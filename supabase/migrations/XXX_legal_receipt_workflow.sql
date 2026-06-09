-- Legal Receipt Workflow — Migration Draft
-- DO NOT APPLY until explicitly approved.

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- Legal documents (Terms, Privacy, etc.)
CREATE TABLE public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  audience text NOT NULL CHECK (audience IN ('candidate', 'employer', 'admin', 'guest_applicant', 'all')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Legal document versions
CREATE TABLE public.legal_document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
  version text NOT NULL,
  effective_at timestamptz NOT NULL DEFAULT now(),
  content_hash text NOT NULL,
  public_url text NOT NULL,
  summary text,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, version)
);

CREATE INDEX idx_ldv_document_id ON public.legal_document_versions (document_id);
CREATE INDEX idx_ldv_is_current ON public.legal_document_versions (is_current);

-- Legal acceptance events
CREATE TABLE public.legal_acceptance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  account_type text CHECK (account_type IN ('candidate', 'employer', 'admin', 'guest_applicant', 'unknown')),
  event_type text NOT NULL,
  related_entity_type text,
  related_entity_id uuid,
  document_version_ids uuid[] NOT NULL DEFAULT '{}',
  terms_accepted boolean NOT NULL DEFAULT false,
  privacy_notice_acknowledged boolean NOT NULL DEFAULT false,
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_text_snapshot text NOT NULL,
  source_route text,
  ip_hash text,
  user_agent_hash text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lae_user_id ON public.legal_acceptance_events (user_id);
CREATE INDEX idx_lae_email ON public.legal_acceptance_events (email);
CREATE INDEX idx_lae_event_type ON public.legal_acceptance_events (event_type);
CREATE INDEX idx_lae_created_at ON public.legal_acceptance_events (created_at);

-- Legal email receipts
CREATE TABLE public.legal_email_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acceptance_event_id uuid NOT NULL REFERENCES public.legal_acceptance_events(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  copy_type text NOT NULL CHECK (copy_type IN ('user_receipt', 'internal_archive')),
  subject text NOT NULL,
  html_hash text,
  text_hash text,
  provider text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX idx_ler_acceptance_event_id ON public.legal_email_receipts (acceptance_event_id);
CREATE INDEX idx_ler_status ON public.legal_email_receipts (status);

-- Legal email delivery attempts
CREATE TABLE public.legal_email_delivery_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES public.legal_email_receipts(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'resend',
  status text NOT NULL,
  provider_message_id text,
  error text,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leda_receipt_id ON public.legal_email_delivery_attempts (receipt_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_email_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_email_delivery_attempts ENABLE ROW LEVEL SECURITY;

-- Revoke all from anon
REVOKE ALL ON public.legal_documents FROM anon;
REVOKE ALL ON public.legal_document_versions FROM anon;
REVOKE ALL ON public.legal_acceptance_events FROM anon;
REVOKE ALL ON public.legal_email_receipts FROM anon;
REVOKE ALL ON public.legal_email_delivery_attempts FROM anon;

-- Grant minimal to authenticated
GRANT SELECT ON public.legal_documents TO authenticated;
GRANT SELECT ON public.legal_document_versions TO authenticated;
GRANT SELECT ON public.legal_acceptance_events TO authenticated;
GRANT SELECT ON public.legal_email_receipts TO authenticated;
-- No grant on delivery_attempts for authenticated

-- Grant full to service_role
GRANT ALL ON public.legal_documents TO service_role;
GRANT ALL ON public.legal_document_versions TO service_role;
GRANT ALL ON public.legal_acceptance_events TO service_role;
GRANT ALL ON public.legal_email_receipts TO service_role;
GRANT ALL ON public.legal_email_delivery_attempts TO service_role;

-- --- legal_documents policies ---

-- Anyone can read active documents (for public legal pages)
CREATE POLICY "ld_public_read_active" ON public.legal_documents
  FOR SELECT USING (is_active = true);

-- Admins manage all
CREATE POLICY "ld_admins_manage_all" ON public.legal_documents
  FOR ALL USING (
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
  );

-- --- legal_document_versions policies ---

-- Anyone can read versions of active documents
CREATE POLICY "ldv_public_read" ON public.legal_document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.legal_documents
      WHERE id = document_id AND is_active = true
    )
  );

-- Admins manage all
CREATE POLICY "ldv_admins_manage_all" ON public.legal_document_versions
  FOR ALL USING (
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
  );

-- --- legal_acceptance_events policies ---

-- Users can read their own events
CREATE POLICY "lae_users_read_own" ON public.legal_acceptance_events
  FOR SELECT USING (auth.uid() = user_id);

-- Admins read all
CREATE POLICY "lae_admins_read_all" ON public.legal_acceptance_events
  FOR SELECT USING (
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
  );

-- Inserts only via service_role (no INSERT policy for authenticated)

-- --- legal_email_receipts policies ---

-- Users can read their own user receipts (not internal archive)
CREATE POLICY "ler_users_read_own_receipt" ON public.legal_email_receipts
  FOR SELECT USING (
    copy_type = 'user_receipt'
    AND EXISTS (
      SELECT 1 FROM public.legal_acceptance_events
      WHERE id = acceptance_event_id AND user_id = auth.uid()
    )
  );

-- Admins read all
CREATE POLICY "ler_admins_read_all" ON public.legal_email_receipts
  FOR SELECT USING (
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
  );

-- Inserts only via service_role

-- --- legal_email_delivery_attempts policies ---

-- Admins read all
CREATE POLICY "leda_admins_read_all" ON public.legal_email_delivery_attempts
  FOR SELECT USING (
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
  );

-- Inserts only via service_role

-- ============================================================================
-- DONE
-- ============================================================================

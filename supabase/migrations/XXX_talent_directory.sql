-- Talent Directory — Migration Draft
-- DO NOT APPLY until explicitly approved.
-- Feature flag: CV_DIRECTORY_ENABLED=false
--
-- This migration creates the Talent Directory tables, RLS policies,
-- helper functions, and indexes.

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin',
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get current user's employer profile ID
CREATE OR REPLACE FUNCTION public.current_user_employer_id()
RETURNS uuid AS $$
  SELECT id FROM public.employers
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if employer has active talent access
CREATE OR REPLACE FUNCTION public.employer_has_active_talent_access(employer_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employer_talent_access
    WHERE employer_id = employer_uuid
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if employer has available contact credits
CREATE OR REPLACE FUNCTION public.employer_has_contact_credit(employer_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employer_talent_access
    WHERE employer_id = employer_uuid
      AND status = 'active'
      AND contact_credits_used < contact_credits_total
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Updated_at trigger function (reuse existing if available)
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

-- Candidate directory profiles (separate from candidate_profiles)
CREATE TABLE public.candidate_directory_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  candidate_profile_id uuid REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  visibility_status text NOT NULL DEFAULT 'private'
    CHECK (visibility_status IN ('private', 'searchable', 'paused')),
  display_mode text NOT NULL DEFAULT 'anonymous'
    CHECK (display_mode IN ('anonymous', 'first_name', 'full_name')),
  headline text,
  summary text,
  location text,
  skills text[] NOT NULL DEFAULT '{}',
  sectors text[] NOT NULL DEFAULT '{}',
  job_types text[] NOT NULL DEFAULT '{}',
  remote_preference text,
  experience_years integer,
  desired_salary_min integer,
  desired_salary_max integer,
  availability text,
  allow_contact_requests boolean NOT NULL DEFAULT true,
  allow_cv_requests boolean NOT NULL DEFAULT false,
  allow_direct_cv_download boolean NOT NULL DEFAULT false,
  consent_version text NOT NULL,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  last_refreshed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for candidate_directory_profiles
CREATE INDEX idx_cdp_candidate_user_id ON public.candidate_directory_profiles (candidate_user_id);
CREATE INDEX idx_cdp_slug ON public.candidate_directory_profiles (slug);
CREATE INDEX idx_cdp_visibility_status ON public.candidate_directory_profiles (visibility_status);
CREATE INDEX idx_cdp_skills ON public.candidate_directory_profiles USING gin (skills);
CREATE INDEX idx_cdp_sectors ON public.candidate_directory_profiles USING gin (sectors);
CREATE INDEX idx_cdp_location ON public.candidate_directory_profiles (location);
CREATE INDEX idx_cdp_remote_preference ON public.candidate_directory_profiles (remote_preference);
CREATE INDEX idx_cdp_experience_years ON public.candidate_directory_profiles (experience_years);

-- Trigger for updated_at
CREATE TRIGGER update_cdp_updated_at
  BEFORE UPDATE ON public.candidate_directory_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Candidate directory CV assets (references candidate_cvs but never exposes file_url)
CREATE TABLE public.candidate_directory_cv_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_profile_id uuid NOT NULL REFERENCES public.candidate_directory_profiles(id) ON DELETE CASCADE,
  candidate_cv_id uuid NOT NULL REFERENCES public.candidate_cvs(id) ON DELETE CASCADE,
  parsed_summary text,
  redacted_text text,
  cv_visibility text NOT NULL DEFAULT 'request_only'
    CHECK (cv_visibility IN ('hidden', 'request_only', 'visible_after_acceptance')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cdcv_directory_profile_id ON public.candidate_directory_cv_assets (directory_profile_id);
CREATE INDEX idx_cdcv_candidate_cv_id ON public.candidate_directory_cv_assets (candidate_cv_id);

CREATE TRIGGER update_cdcv_updated_at
  BEFORE UPDATE ON public.candidate_directory_cv_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Employer talent access (subscription/credits)
CREATE TABLE public.employer_talent_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  plan_key text NOT NULL,
  status text NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'inactive', 'trialing', 'past_due', 'cancelled', 'expired')),
  contact_credits_total integer NOT NULL DEFAULT 0,
  contact_credits_used integer NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_credits_used_lte_total CHECK (contact_credits_used <= contact_credits_total)
);

CREATE INDEX idx_eta_employer_id ON public.employer_talent_access (employer_id);
CREATE INDEX idx_eta_status ON public.employer_talent_access (status);
CREATE INDEX idx_eta_stripe_subscription_id ON public.employer_talent_access (stripe_subscription_id);

CREATE TRIGGER update_eta_updated_at
  BEFORE UPDATE ON public.employer_talent_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Candidate contact requests
CREATE TABLE public.candidate_contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  candidate_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  directory_profile_id uuid NOT NULL REFERENCES public.candidate_directory_profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  credit_reserved_at timestamptz,
  credit_consumed_at timestamptz,
  candidate_response_message text,
  employer_visible_email text,
  employer_visible_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ccr_employer_id ON public.candidate_contact_requests (employer_id);
CREATE INDEX idx_ccr_candidate_user_id ON public.candidate_contact_requests (candidate_user_id);
CREATE INDEX idx_ccr_directory_profile_id ON public.candidate_contact_requests (directory_profile_id);
CREATE INDEX idx_ccr_status ON public.candidate_contact_requests (status);

CREATE TRIGGER update_ccr_updated_at
  BEFORE UPDATE ON public.candidate_contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Candidate directory audit logs
CREATE TABLE public.candidate_directory_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  actor_type text NOT NULL CHECK (actor_type IN ('candidate', 'employer', 'admin', 'system')),
  candidate_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cdal_actor_user_id ON public.candidate_directory_audit_logs (actor_user_id);
CREATE INDEX idx_cdal_candidate_user_id ON public.candidate_directory_audit_logs (candidate_user_id);
CREATE INDEX idx_cdal_employer_id ON public.candidate_directory_audit_logs (employer_id);
CREATE INDEX idx_cdal_action ON public.candidate_directory_audit_logs (action);
CREATE INDEX idx_cdal_created_at ON public.candidate_directory_audit_logs (created_at);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.candidate_directory_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_directory_cv_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_talent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_directory_audit_logs ENABLE ROW LEVEL SECURITY;

-- Revoke all from anon by default
REVOKE ALL ON public.candidate_directory_profiles FROM anon;
REVOKE ALL ON public.candidate_directory_cv_assets FROM anon;
REVOKE ALL ON public.employer_talent_access FROM anon;
REVOKE ALL ON public.candidate_contact_requests FROM anon;
REVOKE ALL ON public.candidate_directory_audit_logs FROM anon;

-- Grant minimal to authenticated (RLS will restrict further)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_directory_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_directory_cv_assets TO authenticated;
GRANT SELECT ON public.employer_talent_access TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.candidate_contact_requests TO authenticated;
GRANT SELECT ON public.candidate_directory_audit_logs TO authenticated;

-- Grant full to service_role (server-side)
GRANT ALL ON public.candidate_directory_profiles TO service_role;
GRANT ALL ON public.candidate_directory_cv_assets TO service_role;
GRANT ALL ON public.employer_talent_access TO service_role;
GRANT ALL ON public.candidate_contact_requests TO service_role;
GRANT ALL ON public.candidate_directory_audit_logs TO service_role;

-- --- candidate_directory_profiles policies ---

-- Candidates manage own profile
CREATE POLICY "cdp_candidates_manage_own" ON public.candidate_directory_profiles
  FOR ALL USING (auth.uid() = candidate_user_id);

-- Employers search searchable profiles (requires active talent access)
CREATE POLICY "cdp_employers_search" ON public.candidate_directory_profiles
  FOR SELECT USING (
    visibility_status = 'searchable'
    AND public.employer_has_active_talent_access(public.current_user_employer_id())
  );

-- Admins manage all
CREATE POLICY "cdp_admins_manage_all" ON public.candidate_directory_profiles
  FOR ALL USING (public.is_admin_user());

-- --- candidate_directory_cv_assets policies ---

-- Candidates manage own CV assets
CREATE POLICY "cdcv_candidates_manage_own" ON public.candidate_directory_cv_assets
  FOR ALL USING (
    auth.uid() = (
      SELECT candidate_user_id FROM public.candidate_directory_profiles
      WHERE id = directory_profile_id
    )
  );

-- Admins manage all
CREATE POLICY "cdcv_admins_manage_all" ON public.candidate_directory_cv_assets
  FOR ALL USING (public.is_admin_user());

-- NOTE: No employer SELECT policy — employers cannot access raw CV assets.
-- CV data is served through server actions with access checks.

-- --- employer_talent_access policies ---

-- Employers view own access
CREATE POLICY "eta_employers_view_own" ON public.employer_talent_access
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.employers WHERE id = employer_id)
  );

-- Admins manage all
CREATE POLICY "eta_admins_manage_all" ON public.employer_talent_access
  FOR ALL USING (public.is_admin_user());

-- --- candidate_contact_requests policies ---

-- Employer insert own request (requires active access and credits)
CREATE POLICY "ccr_employer_insert_own" ON public.candidate_contact_requests
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.employers WHERE id = employer_id)
    AND public.employer_has_active_talent_access(employer_id)
    AND public.employer_has_contact_credit(employer_id)
  );

-- Employer view own requests
CREATE POLICY "ccr_employer_view_own" ON public.candidate_contact_requests
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.employers WHERE id = employer_id)
  );

-- Candidate view requests sent to them
CREATE POLICY "ccr_candidate_view_own" ON public.candidate_contact_requests
  FOR SELECT USING (auth.uid() = candidate_user_id);

-- Candidate update own request (only pending)
CREATE POLICY "ccr_candidate_respond_own" ON public.candidate_contact_requests
  FOR UPDATE USING (
    auth.uid() = candidate_user_id
    AND status = 'pending'
  );

-- Admins manage all
CREATE POLICY "ccr_admins_manage_all" ON public.candidate_contact_requests
  FOR ALL USING (public.is_admin_user());

-- --- candidate_directory_audit_logs policies ---

-- Admins view all
CREATE POLICY "cdal_admins_view_all" ON public.candidate_directory_audit_logs
  FOR SELECT USING (public.is_admin_user());

-- Candidates view logs involving themselves
CREATE POLICY "cdal_candidates_view_own" ON public.candidate_directory_audit_logs
  FOR SELECT USING (auth.uid() = candidate_user_id);

-- Employers view logs involving their employer
CREATE POLICY "cdal_employers_view_own" ON public.candidate_directory_audit_logs
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.employers WHERE id = employer_id)
  );

-- Inserts only via service_role (no INSERT policy for authenticated)

-- ============================================================================
-- 4. PUBLICATION (for Realtime if needed later)
-- ============================================================================

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate_directory_profiles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate_contact_requests;

-- ============================================================================
-- DONE
-- ============================================================================

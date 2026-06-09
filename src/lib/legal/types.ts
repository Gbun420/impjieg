import { z } from "zod";

// ============================================================================
// Legal Document Types
// ============================================================================

export type LegalDocument = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  audience: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LegalDocumentVersion = {
  id: string;
  document_id: string;
  version: string;
  effective_at: string;
  content_hash: string;
  public_url: string;
  summary: string | null;
  is_current: boolean;
  created_at: string;
};

export type LegalAcceptanceEvent = {
  id: string;
  user_id: string | null;
  email: string;
  account_type: string | null;
  event_type: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  document_version_ids: string[];
  terms_accepted: boolean;
  privacy_notice_acknowledged: boolean;
  marketing_consent: boolean;
  consent_text_snapshot: string;
  source_route: string | null;
  ip_hash: string | null;
  user_agent_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type LegalEmailReceipt = {
  id: string;
  acceptance_event_id: string;
  recipient_email: string;
  copy_type: "user_receipt" | "internal_archive";
  subject: string;
  html_hash: string | null;
  text_hash: string | null;
  provider: string;
  provider_message_id: string | null;
  status: "pending" | "sent" | "failed" | "skipped";
  error: string | null;
  created_at: string;
  sent_at: string | null;
};

export type LegalEmailDeliveryAttempt = {
  id: string;
  receipt_id: string;
  provider: string;
  status: string;
  provider_message_id: string | null;
  error: string | null;
  attempted_at: string;
};

// ============================================================================
// Input Types
// ============================================================================

export type LegalAcceptanceInput = {
  userId?: string | null;
  email: string;
  accountType: "candidate" | "employer" | "admin" | "guest_applicant" | "unknown";
  eventType: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  termsAccepted: boolean;
  privacyNoticeAcknowledged: boolean;
  marketingConsent?: boolean;
  consentTextSnapshot: string;
  sourceRoute: string;
  ipHash?: string;
  userAgentHash?: string;
  metadata?: Record<string, unknown>;
};

export type LegalReceiptResult =
  | {
      ok: true;
      acceptanceEventId: string;
      userReceiptId?: string;
      archiveReceiptId?: string;
    }
  | { ok: false; error: string };

// ============================================================================
// Validation Schemas
// ============================================================================

export const legalAcceptanceInputSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  accountType: z.enum([
    "candidate",
    "employer",
    "admin",
    "guest_applicant",
    "unknown",
  ]),
  eventType: z.string().min(1),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().uuid().optional(),
  termsAccepted: z.literal(true),
  privacyNoticeAcknowledged: z.literal(true),
  marketingConsent: z.boolean().default(false),
  consentTextSnapshot: z.string().min(1),
  sourceRoute: z.string().min(1),
  ipHash: z.string().optional(),
  userAgentHash: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LegalAcceptanceInputValidated = z.infer<
  typeof legalAcceptanceInputSchema
>;

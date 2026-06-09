import crypto from "node:crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceKey } from "@/lib/supabase/env";
import type {
  LegalAcceptanceInput,
  LegalReceiptResult,
  LegalEmailReceipt,
} from "./types";
import { legalAcceptanceInputSchema } from "./types";
import { LEGAL_RECEIPTS_ENABLED } from "./constants";
import { buildUserLegalReceiptEmail, buildInternalLegalArchiveEmail } from "./email";
import { sendLegalReceiptEmail } from "./email";

// ============================================================================
// Hash Helpers
// ============================================================================

export function hashLegalEvidenceValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

// ============================================================================
// Record Legal Acceptance
// ============================================================================

export async function recordLegalAcceptance(
  input: LegalAcceptanceInput
): Promise<LegalReceiptResult> {
  // Validate input
  const parsed = legalAcceptanceInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Invalid acceptance input: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const data = parsed.data;
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  // Insert acceptance event
  const { data: event, error: eventError } = await serviceSupabase
    .from("legal_acceptance_events")
    .insert({
      user_id: data.userId ?? null,
      email: data.email,
      account_type: data.accountType,
      event_type: data.eventType,
      related_entity_type: data.relatedEntityType ?? null,
      related_entity_id: data.relatedEntityId ?? null,
      terms_accepted: data.termsAccepted,
      privacy_notice_acknowledged: data.privacyNoticeAcknowledged,
      marketing_consent: data.marketingConsent ?? false,
      consent_text_snapshot: data.consentTextSnapshot,
      source_route: data.sourceRoute,
      ip_hash: data.ipHash ?? null,
      user_agent_hash: data.userAgentHash ?? null,
      metadata: data.metadata ?? {},
    })
    .select("id")
    .single();

  if (eventError || !event) {
    console.error(
      "[LegalReceipt] Failed to record acceptance event:",
      eventError?.message
    );
    return { ok: false, error: "Failed to record legal acceptance" };
  }

  if (!LEGAL_RECEIPTS_ENABLED) {
    return { ok: true, acceptanceEventId: event.id };
  }

  // Send receipt pair
  const receiptResult = await sendLegalReceiptPair({
    acceptanceEventId: event.id,
    email: data.email,
    eventType: data.eventType,
    userId: data.userId ?? null,
    accountType: data.accountType,
    termsAccepted: data.termsAccepted,
    privacyAcknowledged: data.privacyNoticeAcknowledged,
    marketingConsent: data.marketingConsent ?? false,
    consentTextSnapshot: data.consentTextSnapshot,
    sourceRoute: data.sourceRoute,
    relatedEntityType: data.relatedEntityType,
    relatedEntityId: data.relatedEntityId,
  });

  return {
    ok: true,
    acceptanceEventId: event.id,
    userReceiptId: receiptResult.userReceiptId,
    archiveReceiptId: receiptResult.archiveReceiptId,
  };
}

// ============================================================================
// Send Legal Receipt Pair
// ============================================================================

async function sendLegalReceiptPair(input: {
  acceptanceEventId: string;
  email: string;
  eventType: string;
  userId: string | null;
  accountType: string;
  termsAccepted: boolean;
  privacyAcknowledged: boolean;
  marketingConsent: boolean;
  consentTextSnapshot: string;
  sourceRoute: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}): Promise<{ userReceiptId?: string; archiveReceiptId?: string }> {
  let userReceiptId: string | undefined;
  let archiveReceiptId: string | undefined;

  // Send user receipt
  try {
    const userEmail = await sendLegalReceiptEmail({
      acceptanceEventId: input.acceptanceEventId,
      recipientEmail: input.email,
      copyType: "user_receipt",
      eventType: input.eventType,
      accountType: input.accountType,
      email: input.email,
      sourceRoute: input.sourceRoute,
    });
    userReceiptId = userEmail.receiptId;
  } catch (error) {
    console.error("[LegalReceipt] Failed to send user receipt:", error);
  }

  // Send internal archive copy
  try {
    const archiveEmail = await sendLegalReceiptEmail({
      acceptanceEventId: input.acceptanceEventId,
      recipientEmail: input.email,
      copyType: "internal_archive",
      eventType: input.eventType,
      accountType: input.accountType,
      email: input.email,
      userId: input.userId,
      termsAccepted: input.termsAccepted,
      privacyAcknowledged: input.privacyAcknowledged,
      marketingConsent: input.marketingConsent,
      consentTextSnapshot: input.consentTextSnapshot,
      sourceRoute: input.sourceRoute,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
    });
    archiveReceiptId = archiveEmail.receiptId;
  } catch (error) {
    console.error("[LegalReceipt] Failed to send archive receipt:", error);
  }

  return { userReceiptId, archiveReceiptId };
}

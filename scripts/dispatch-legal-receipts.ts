/**
 * Legal Receipt Email Dispatcher
 *
 * Run: npm run legal:dispatch-receipts
 * Sends all pending legal_email_receipts via Resend.
 * Idempotent — never double-sends.
 * Max one delivery attempt per receipt per run.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { sendEmail } from "@/lib/email-sender";
import {
  buildUserLegalReceiptEmail,
  buildInternalLegalArchiveEmail,
} from "@/lib/legal/email";
import { LEGAL_ARCHIVE_EMAIL } from "@/lib/legal/constants";

type ServiceClient = ReturnType<typeof createClient<Database>>;

function getServiceClient(): ServiceClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient<Database>(url, key);
}

async function main() {
  console.log("=== Legal Receipt Dispatcher ===\n");

  const supabase = getServiceClient();

  // Fetch pending receipts with their acceptance events
  const { data: pending, error: fetchErr } = await supabase
    .from("legal_email_receipts")
    .select("*, event:legal_acceptance_events(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (fetchErr) {
    console.error(`Failed to fetch pending receipts: ${fetchErr.message}`);
    process.exit(1);
  }

  const rows = (pending || []) as any[];
  console.log(`Found ${rows.length} pending receipt(s)\n`);

  if (rows.length === 0) {
    console.log("Nothing to dispatch. Done.");
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const receipt of rows) {
    const event = receipt.event;
    if (!event) {
      console.log(`  ⚠  Receipt ${receipt.id}: no acceptance event — skipping`);
      continue;
    }

    const isUserReceipt = receipt.copy_type === "user_receipt";
    const to = isUserReceipt ? receipt.recipient_email : LEGAL_ARCHIVE_EMAIL;

    process.stdout.write(`  ${receipt.copy_type} → ${to} ... `);

    try {
      // Build email
      const content = isUserReceipt
        ? buildUserLegalReceiptEmail({
            eventType: event.event_type,
            email: event.email,
            accountType: event.account_type || "unknown",
            sourceRoute: event.source_route || "/auth/signup",
            acceptanceEventId: event.id,
          })
        : buildInternalLegalArchiveEmail({
            eventType: event.event_type,
            email: event.email,
            accountType: event.account_type || "unknown",
            sourceRoute: event.source_route || "/auth/signup",
            acceptanceEventId: event.id,
            userId: event.user_id,
            termsAccepted: event.terms_accepted,
            privacyAcknowledged: event.privacy_notice_acknowledged,
            marketingConsent: event.marketing_consent,
            consentTextSnapshot: event.consent_text_snapshot,
            relatedEntityType: event.related_entity_type,
            relatedEntityId: event.related_entity_id,
          });

      // Send
      const result = await sendEmail({
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });

      // Update receipt
      await supabase
        .from("legal_email_receipts")
        .update({
          status: result.success ? "sent" : "failed",
          provider_message_id: result.success ? result.messageId : null,
          error: result.success ? null : result.error,
          sent_at: result.success ? new Date().toISOString() : null,
        })
        .eq("id", receipt.id);

      // Record attempt
      await supabase.from("legal_email_delivery_attempts").insert({
        receipt_id: receipt.id,
        status: result.success ? "sent" : "failed",
        provider_message_id: result.success ? result.messageId : null,
        error: result.success ? null : result.error,
      });

      if (result.success) {
        console.log(`SENT (${result.messageId})`);
        sent++;
      } else {
        console.log(`FAILED: ${result.error}`);
        failed++;
      }
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
      await supabase
        .from("legal_email_receipts")
        .update({ status: "failed", error: err.message })
        .eq("id", receipt.id);
      failed++;
    }
  }

  console.log(`\nDone: ${sent} sent, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Dispatch failed:", err.message);
  process.exit(1);
});

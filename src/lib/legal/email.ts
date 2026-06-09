import crypto from "node:crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceKey } from "@/lib/supabase/env";
import { sendEmail } from "@/lib/email-sender";
import { buildBrandedEmailShell } from "@/lib/email-branding";
import { escapeHtml } from "@/lib/email-security";
import {
  LEGAL_ARCHIVE_EMAIL,
  SUPPORT_EMAIL,
  DATA_PROTECTION_EMAIL,
} from "./constants";

// ============================================================================
// Build User Legal Receipt Email
// ============================================================================

export function buildUserLegalReceiptEmail(input: {
  eventType: string;
  email: string;
  accountType: string;
  sourceRoute: string;
  acceptanceEventId: string;
}): { subject: string; html: string; text: string } {
  const eventLabel = input.eventType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const subject = "Your Impjieg legal receipt";

  const bodyHtml = `
    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
      This is your legal receipt for the following action on Impjieg.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; width: 140px;">Event</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px; font-weight: 500;">${escapeHtml(eventLabel)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Timestamp</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${new Date().toISOString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Account</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(input.email)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Receipt ID</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px; font-family: monospace;">${escapeHtml(input.acceptanceEventId)}</td>
      </tr>
    </table>

    <p style="margin: 16px 0 8px; color: #374151; font-size: 14px; line-height: 1.5;">
      You have acknowledged the applicable Terms of Service and Privacy Notice.
      A copy of this receipt is retained by Impjieg for compliance purposes.
    </p>

    <p style="margin: 8px 0; color: #6b7280; font-size: 13px;">
      Questions? Contact <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color: #14C7B7;">${escapeHtml(SUPPORT_EMAIL)}</a>.
      Data protection inquiries: <a href="mailto:${escapeHtml(DATA_PROTECTION_EMAIL)}" style="color: #14C7B7;">${escapeHtml(DATA_PROTECTION_EMAIL)}</a>.
    </p>
  `;

  const html = buildBrandedEmailShell({
    eyebrow: "Legal Receipt",
    title: "Your Impjieg Legal Receipt",
    bodyHtml,
    footerHtml: `Impjieg · Malta's hiring signal · <a href="https://impjieg.vercel.app/legal/terms" style="color: #14C7B7;">Terms</a> · <a href="https://impjieg.vercel.app/legal/privacy" style="color: #14C7B7;">Privacy</a>`,
  });

  const text = `Your Impjieg Legal Receipt

Event: ${eventLabel}
Timestamp: ${new Date().toISOString()}
Account: ${input.email}
Receipt ID: ${input.acceptanceEventId}

You have acknowledged the applicable Terms of Service and Privacy Notice.
A copy of this receipt is retained by Impjieg for compliance purposes.

Questions? Contact ${SUPPORT_EMAIL}.
Data protection: ${DATA_PROTECTION_EMAIL}`;

  return { subject, html, text };
}

// ============================================================================
// Build Internal Legal Archive Email
// ============================================================================

export function buildInternalLegalArchiveEmail(input: {
  eventType: string;
  email: string;
  accountType: string;
  sourceRoute: string;
  acceptanceEventId: string;
  userId?: string | null;
  termsAccepted: boolean;
  privacyAcknowledged: boolean;
  marketingConsent: boolean;
  consentTextSnapshot: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}): { subject: string; html: string; text: string } {
  const eventLabel = input.eventType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const subject = `Impjieg legal receipt copy: ${input.eventType} — ${input.email}`;

  const bodyHtml = `
    <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
      Internal compliance copy — not sent to the user.
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; width: 180px;">Event</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px; font-weight: 500;">${escapeHtml(eventLabel)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Timestamp</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${new Date().toISOString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Acceptance Event ID</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px; font-family: monospace;">${escapeHtml(input.acceptanceEventId)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">User/Account Email</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(input.email)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Account Type</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(input.accountType)}</td>
      </tr>
      ${input.userId ? `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">User ID</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px; font-family: monospace;">${escapeHtml(input.userId)}</td>
      </tr>` : ""}
      ${input.relatedEntityType ? `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Related Entity</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(input.relatedEntityType)}${input.relatedEntityId ? ` (${escapeHtml(input.relatedEntityId)})` : ""}</td>
      </tr>` : ""}
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Source Route</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(input.sourceRoute)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Terms Accepted</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${input.termsAccepted ? "Yes" : "No"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Privacy Acknowledged</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${input.privacyAcknowledged ? "Yes" : "No"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Marketing Consent</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${input.marketingConsent ? "Yes" : "No"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Consent Text</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 13px;">${escapeHtml(input.consentTextSnapshot)}</td>
      </tr>
    </table>

    <p style="margin: 16px 0 8px; color: #9ca3af; font-size: 12px; line-height: 1.5;">
      This is an automated compliance copy. No CV, cover letter, phone number, or raw file URL is included.
    </p>
  `;

  const html = buildBrandedEmailShell({
    eyebrow: "Internal Compliance Copy",
    title: `Legal Receipt: ${eventLabel}`,
    bodyHtml,
    footerHtml: "Impjieg · Internal compliance copy · Do not forward",
  });

  const text = `Internal Compliance Copy — Legal Receipt

Event: ${eventLabel}
Timestamp: ${new Date().toISOString()}
Acceptance Event ID: ${input.acceptanceEventId}
User/Account Email: ${input.email}
Account Type: ${input.accountType}
${input.userId ? `User ID: ${input.userId}` : ""}
${input.relatedEntityType ? `Related Entity: ${input.relatedEntityType}${input.relatedEntityId ? ` (${input.relatedEntityId})` : ""}` : ""}
Source Route: ${input.sourceRoute}
Terms Accepted: ${input.termsAccepted ? "Yes" : "No"}
Privacy Acknowledged: ${input.privacyAcknowledged ? "Yes" : "No"}
Marketing Consent: ${input.marketingConsent ? "Yes" : "No"}
Consent Text: ${input.consentTextSnapshot}

This is an automated compliance copy. No CV, cover letter, phone number, or raw file URL is included.`;

  return { subject, html, text };
}

// ============================================================================
// Send Legal Receipt Email
// ============================================================================

export async function sendLegalReceiptEmail(input: {
  acceptanceEventId: string;
  recipientEmail: string;
  copyType: "user_receipt" | "internal_archive";
  eventType: string;
  accountType: string;
  email: string;
  userId?: string | null;
  termsAccepted?: boolean;
  privacyAcknowledged?: boolean;
  marketingConsent?: boolean;
  consentTextSnapshot?: string;
  sourceRoute: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}): Promise<{ receiptId: string }> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  // Build email
  const emailContent =
    input.copyType === "user_receipt"
      ? buildUserLegalReceiptEmail({
          eventType: input.eventType,
          email: input.email,
          accountType: input.accountType,
          sourceRoute: input.sourceRoute,
          acceptanceEventId: input.acceptanceEventId,
        })
      : buildInternalLegalArchiveEmail({
          eventType: input.eventType,
          email: input.email,
          accountType: input.accountType,
          sourceRoute: input.sourceRoute,
          acceptanceEventId: input.acceptanceEventId,
          userId: input.userId,
          termsAccepted: input.termsAccepted ?? true,
          privacyAcknowledged: input.privacyAcknowledged ?? true,
          marketingConsent: input.marketingConsent ?? false,
          consentTextSnapshot: input.consentTextSnapshot ?? "",
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,
        });

  // Create receipt record
  const htmlHash = crypto
    .createHash("sha256")
    .update(emailContent.html)
    .digest("hex")
    .slice(0, 16);
  const textHash = crypto
    .createHash("sha256")
    .update(emailContent.text)
    .digest("hex")
    .slice(0, 16);

  const { data: receipt, error: receiptError } = await serviceSupabase
    .from("legal_email_receipts")
    .insert({
      acceptance_event_id: input.acceptanceEventId,
      recipient_email:
        input.copyType === "internal_archive"
          ? LEGAL_ARCHIVE_EMAIL
          : input.recipientEmail,
      copy_type: input.copyType,
      subject: emailContent.subject,
      html_hash: htmlHash,
      text_hash: textHash,
      status: "pending",
    })
    .select("id")
    .single();

  if (receiptError || !receipt) {
    console.error(
      "[LegalReceipt] Failed to create receipt record:",
      receiptError?.message
    );
    throw new Error("Failed to create receipt record");
  }

  // Determine recipient
  const to =
    input.copyType === "internal_archive"
      ? LEGAL_ARCHIVE_EMAIL
      : input.recipientEmail;

  // Send email
  const result = await sendEmail({
    to,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  // Update receipt status
  if (result.success) {
    await serviceSupabase
      .from("legal_email_receipts")
      .update({
        status: "sent",
        provider_message_id: result.messageId ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", receipt.id);

    // Record delivery attempt
    await serviceSupabase
      .from("legal_email_delivery_attempts")
      .insert({
        receipt_id: receipt.id,
        status: "sent",
        provider_message_id: result.messageId ?? null,
      });
  } else {
    await serviceSupabase
      .from("legal_email_receipts")
      .update({
        status: "failed",
        error: result.error,
      })
      .eq("id", receipt.id);

    // Record delivery attempt
    await serviceSupabase
      .from("legal_email_delivery_attempts")
      .insert({
        receipt_id: receipt.id,
        status: "failed",
        error: result.error,
      });
  }

  return { receiptId: receipt.id };
}

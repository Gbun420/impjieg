"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/utils";
import { signupWithAutoConfirm } from "./auth-signup";
import { resolvePostLoginDestination } from "@/app/candidate/candidate-queries";
import { isSuperAdminEmail } from "@/lib/admin-access";
import { SITE } from "@/lib/constants";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { insertWithUniqueSlugRetry } from "@/lib/unique-slug";
import { validatePasswordPolicy } from "@/lib/password-policy";
import { LEGAL_EVENT_TYPES, CONSENT_TEXT, LEGAL_ARCHIVE_EMAIL, SUPPORT_EMAIL, DATA_PROTECTION_EMAIL } from "@/lib/legal/constants";
import { buildUserLegalReceiptEmail, buildInternalLegalArchiveEmail } from "@/lib/legal/email";
import { sendEmail } from "@/lib/email-sender";
import type { Database, Employer } from "@/lib/supabase/types";

type EmployerInsert = Database["public"]["Tables"]["employers"]["Insert"];
type EmployersMutationTable = {
  insert(values: EmployerInsert[]): {
    select(): {
      single(): Promise<{
        data: Employer | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    accountType:
      (formData.get("accountType") as "candidate" | "employer" | null) ?? "employer",
    fullName: String(formData.get("fullName") ?? "").trim(),
    companyName: String(formData.get("companyName") ?? "").trim(),
    termsAccepted: formData.get("legal-terms") === "on",
    privacyAccepted: formData.get("legal-privacy") === "on",
    marketingConsent: formData.get("legal-marketing") === "on",
  };

  if (!data.email || !data.password || !data.accountType) {
    return { error: "All fields are required" };
  }

  // Validate legal acceptance
  if (!data.termsAccepted) {
    return { error: "You must accept the Terms of Service" };
  }
  if (!data.privacyAccepted) {
    return { error: "You must acknowledge the Privacy Notice" };
  }

  const passwordError = validatePasswordPolicy(data.password);
  if (passwordError) {
    return { error: passwordError };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { error: "Please enter a valid email address" };
  }

  if (data.accountType === "candidate" && !data.fullName) {
    return { error: "Full name is required for job seeker accounts" };
  }

  if (data.accountType === "employer" && !data.companyName) {
    return { error: "Company name is required for employer accounts" };
  }

  const result = await signupWithAutoConfirm({
    adminClient: serviceSupabase,
    userClient: supabase,
    serviceClient: serviceSupabase,
    input: data,
  });

  // Record legal acceptance whenever a user was created (userId present)
  // Uses the existing service client (proven to work) instead of
  // recordLegalAcceptance which creates its own client internally
  if (result.userId) {
    const eventType =
      data.accountType === "candidate"
        ? LEGAL_EVENT_TYPES.SIGNUP_CANDIDATE
        : LEGAL_EVENT_TYPES.SIGNUP_EMPLOYER;

    try {
      const insertResult = await (serviceSupabase as any)
        .from("legal_acceptance_events")
        .insert({
          user_id: result.userId,
          email: data.email,
          account_type: data.accountType,
          event_type: eventType,
          related_entity_type: "auth_user",
          related_entity_id: result.userId,
          document_version_ids: [],
          terms_accepted: true,
          privacy_notice_acknowledged: true,
          marketing_consent: data.marketingConsent,
          consent_text_snapshot: [
            `terms: ${CONSENT_TEXT.terms}`,
            `privacy: ${CONSENT_TEXT.privacy}`,
            data.marketingConsent ? `marketing: ${CONSENT_TEXT.marketing}` : "marketing: not accepted",
          ].join("; "),
          source_route: "/auth/signup",
          metadata: {
            accountType: data.accountType,
            fullName: data.fullName || undefined,
            companyName: data.companyName || undefined,
          },
        })
        .select("id")
        .single();

      if (insertResult.error) {
        console.error("[LegalReceipt] Failed to record signup acceptance:", insertResult.error.message);
      } else if (insertResult.data) {
        const eventId = insertResult.data.id;

        // Create receipt records and send emails
        const consentSnapshot = [
          `terms: ${CONSENT_TEXT.terms}`,
          `privacy: ${CONSENT_TEXT.privacy}`,
          data.marketingConsent ? `marketing: ${CONSENT_TEXT.marketing}` : "marketing: not accepted",
        ].join("; ");

        // Insert receipt rows first
        const { data: receipts } = await (serviceSupabase as any)
          .from("legal_email_receipts")
          .insert([
            {
              acceptance_event_id: eventId,
              recipient_email: data.email,
              copy_type: "user_receipt",
              subject: "Your Impjieg legal receipt",
              status: "pending",
            },
            {
              acceptance_event_id: eventId,
              recipient_email: LEGAL_ARCHIVE_EMAIL,
              copy_type: "internal_archive",
              subject: `Impjieg legal receipt copy: ${eventType} — ${data.email}`,
              status: "pending",
            },
          ])
          .select("id, copy_type");

        const receiptRows = (receipts || []) as { id: string; copy_type: string }[];
        const userReceiptId = receiptRows.find((r) => r.copy_type === "user_receipt")?.id;
        const archiveReceiptId = receiptRows.find((r) => r.copy_type === "internal_archive")?.id;

        // Send user receipt email
        if (userReceiptId) {
          try {
            const userEmail = buildUserLegalReceiptEmail({
              eventType,
              email: data.email,
              accountType: data.accountType,
              sourceRoute: "/auth/signup",
              acceptanceEventId: eventId,
            });

            const userResult = await sendEmail({
              to: data.email,
              subject: userEmail.subject,
              html: userEmail.html,
              text: userEmail.text,
            });

            await (serviceSupabase as any)
              .from("legal_email_receipts")
              .update({
                status: userResult.success ? "sent" : "failed",
                provider_message_id: userResult.messageId || null,
                error: userResult.error || null,
                sent_at: userResult.success ? new Date().toISOString() : null,
              })
              .eq("id", userReceiptId);

            await (serviceSupabase as any)
              .from("legal_email_delivery_attempts")
              .insert({
                receipt_id: userReceiptId,
                status: userResult.success ? "sent" : "failed",
                provider_message_id: userResult.messageId || null,
                error: userResult.error || null,
              });
          } catch (err: any) {
            console.error("[LegalReceipt] User receipt email failed:", err?.message || err);
            await (serviceSupabase as any)
              .from("legal_email_receipts")
              .update({ status: "failed", error: err?.message || "Unknown error" })
              .eq("id", userReceiptId);
          }
        }

        // Send internal archive email
        if (archiveReceiptId) {
          try {
            const archiveEmail = buildInternalLegalArchiveEmail({
              eventType,
              email: data.email,
              accountType: data.accountType,
              sourceRoute: "/auth/signup",
              acceptanceEventId: eventId,
              userId: result.userId,
              termsAccepted: true,
              privacyAcknowledged: true,
              marketingConsent: data.marketingConsent,
              consentTextSnapshot: consentSnapshot,
            });

            const archiveResult = await sendEmail({
              to: LEGAL_ARCHIVE_EMAIL,
              subject: archiveEmail.subject,
              html: archiveEmail.html,
              text: archiveEmail.text,
            });

            await (serviceSupabase as any)
              .from("legal_email_receipts")
              .update({
                status: archiveResult.success ? "sent" : "failed",
                provider_message_id: archiveResult.messageId || null,
                error: archiveResult.error || null,
                sent_at: archiveResult.success ? new Date().toISOString() : null,
              })
              .eq("id", archiveReceiptId);

            await (serviceSupabase as any)
              .from("legal_email_delivery_attempts")
              .insert({
                receipt_id: archiveReceiptId,
                status: archiveResult.success ? "sent" : "failed",
                provider_message_id: archiveResult.messageId || null,
                error: archiveResult.error || null,
              });
          } catch (err: any) {
            console.error("[LegalReceipt] Archive receipt email failed:", err?.message || err);
            await (serviceSupabase as any)
              .from("legal_email_receipts")
              .update({ status: "failed", error: err?.message || "Unknown error" })
              .eq("id", archiveReceiptId);
          }
        }
      }
    } catch (err: any) {
      console.error("[LegalReceipt] Failed to record signup acceptance:", err?.message || err);
    }
  }

  // If needsConfirmation, tell the client to show check-email
  if (result.needsConfirmation) {
    return {
      success: true as const,
      needsConfirmation: true as const,
      email: result.email,
      error: undefined as undefined,
    };
  }

  return result;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email address before signing in. Check your inbox for the confirmation link." };
    }
    return { error: error.message };
  }

  const user = signInData.user;

  const isAdmin = Boolean(user?.email && isSuperAdminEmail(user.email) && user.app_metadata?.role === "admin");

  const { data: employer } = user
    ? await serviceSupabase
        .from("employers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return {
    success: true,
    redirectTo: resolvePostLoginDestination({
      redirectUrl: null,
      isAdmin,
      hasEmployerProfile: Boolean(employer),
    }),
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE.url}/auth/callback?next=${encodeURIComponent("/auth/login?message=reset-sent")}`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function ensureEmployerProfile() {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", profile: null };
  }

  // Only employer accounts can have employer profiles
  const accountType = user.user_metadata?.accountType;
  if (accountType !== "employer") {
    return { error: "Only employer accounts can access the employer dashboard", profile: null };
  }

  // Check if employer profile exists
  const { data: existingProfile } = await serviceSupabase
    .from("employers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existingProfile) {
    return { error: null, profile: existingProfile };
  }

  // Create profile lazily (auth.users is committed by now)
  const companyName = user.user_metadata?.companyName || "New Employer";
  const employersTable = serviceSupabase.from(
    "employers"
  ) as unknown as EmployersMutationTable;

  const { data: newProfile, error: profileError } = await insertWithUniqueSlugRetry({
    baseSlug: slugify(companyName),
    insert: async (slug) =>
      employersTable
        .insert([
          {
            user_id: user.id,
            name: companyName,
            slug,
          },
        ])
        .select()
        .single(),
  });

  if (profileError) {
    return { error: profileError.message, profile: null };
  }

  if (!newProfile) {
    return { error: "Failed to create employer profile", profile: null };
  }

  return { error: null, profile: newProfile };
}

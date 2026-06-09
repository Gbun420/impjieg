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
import { recordLegalAcceptance } from "@/lib/legal/receipts";
import { LEGAL_EVENT_TYPES, CONSENT_TEXT } from "@/lib/legal/constants";
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
  // This fires for both auto-confirmed signups and needs-confirmation signups
  if (result.userId) {
    const eventType =
      data.accountType === "candidate"
        ? LEGAL_EVENT_TYPES.SIGNUP_CANDIDATE
        : LEGAL_EVENT_TYPES.SIGNUP_EMPLOYER;

    recordLegalAcceptance({
      userId: result.userId,
      email: data.email,
      accountType: data.accountType,
      eventType,
      relatedEntityType: "auth_user",
      relatedEntityId: result.userId,
      termsAccepted: true,
      privacyNoticeAcknowledged: true,
      marketingConsent: data.marketingConsent,
      consentTextSnapshot: [
        `terms: ${CONSENT_TEXT.terms}`,
        `privacy: ${CONSENT_TEXT.privacy}`,
        data.marketingConsent ? `marketing: ${CONSENT_TEXT.marketing}` : "marketing: not accepted",
      ].join("; "),
      sourceRoute: "/auth/signup",
      metadata: {
        accountType: data.accountType,
        fullName: data.fullName || undefined,
        companyName: data.companyName || undefined,
      },
    }).catch((err) => {
      console.error("[LegalReceipt] Failed to record signup acceptance:", err);
    });
  }

  // If needsConfirmation, tell the client to show check-email
  if (result.needsConfirmation) {
    return {
      success: true,
      needsConfirmation: true,
      email: result.email,
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

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdminEmail } from "@/lib/admin-access";
import { logAdminAction } from "@/lib/admin-audit";
import { clearAdminSession, setAdminSession } from "@/lib/admin-session";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import {
  buildAdminOtpAuthUri,
  encryptAdminMfaSecret,
  generateAdminMfaSecret,
  readAdminMfaChallengeCookie,
  setAdminMfaChallengeCookie,
  verifyTotpCode,
  clearAdminMfaChallengeCookie,
} from "@/lib/admin-mfa";

type AdminMfaFactor = {
  user_id: string;
  email: string;
  secret_encrypted: string;
  enabled: boolean | null;
};

function normalizeCode(code: string) {
  return code.replace(/\s+/g, "").trim();
}

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();
  const cookieStore = await cookies();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    if (signInError.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password. Please try again." };
    }

    if (signInError.message.includes("Email not confirmed")) {
      return {
        error:
          "Please verify your email address before signing in. Check your inbox for the confirmation link.",
      };
    }

    return { error: signInError.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin" || !user.email || !isSuperAdminEmail(user.email)) {
    await supabase.auth.signOut();
    await clearAdminSession(cookieStore);
    return { error: "This account is not authorized for admin access." };
  }

  const serviceSupabase = createServiceClient(getSupabaseUrl(), getSupabaseServiceKey());
  const { data: factor } = await serviceSupabase
    .from("admin_mfa_factors")
    .select("user_id, email, secret_encrypted, enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!factor) {
    const secret = generateAdminMfaSecret();
    await setAdminMfaChallengeCookie(
      {
        userId: user.id,
        email: user.email,
        mode: "setup",
        secret,
        issuedAt: Date.now(),
      },
      cookieStore
    );

    return {
      requiresMfa: true,
      mfaMode: "setup" as const,
      setupSecret: secret,
      otpauthUri: buildAdminOtpAuthUri({ email: user.email, secret }),
    };
  }

  if (factor.enabled === false) {
    return { error: "Admin MFA is disabled for this account. Contact an administrator." };
  }

  await setAdminMfaChallengeCookie(
    {
      userId: user.id,
      email: user.email,
      mode: "login",
      issuedAt: Date.now(),
    },
    cookieStore
  );

  return {
    requiresMfa: true,
    mfaMode: "verify" as const,
  };
}

export async function adminLogout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    await logAdminAction(
      createServiceClient(getSupabaseUrl(), getSupabaseServiceKey()),
      {
        adminEmail: user.email,
        action: "admin_logout",
        entityType: "admin_session",
        entityId: user.id,
        afterValue: { success: true },
      }
    );
  }

  const cookieStore = await cookies();
  await clearAdminSession(cookieStore);
  await clearAdminMfaChallengeCookie(cookieStore);
  redirect("/admin/login");
}

export async function adminVerifyMfa(formData: FormData) {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (!code) {
    return { error: "MFA code is required" };
  }

  const supabase = await createClient();
  const cookieStore = await cookies();
  const challenge = await readAdminMfaChallengeCookie(cookieStore);

  if (!challenge) {
    return { error: "Your MFA challenge expired. Please sign in again." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== challenge.userId || user.email?.toLowerCase() !== challenge.email.toLowerCase()) {
    await clearAdminMfaChallengeCookie(cookieStore);
    await supabase.auth.signOut();
    await clearAdminSession(cookieStore);
    return { error: "Your MFA challenge expired. Please sign in again." };
  }

  const serviceSupabase = createServiceClient(getSupabaseUrl(), getSupabaseServiceKey());

  if (challenge.mode === "setup") {
    if (!challenge.secret) {
      await clearAdminMfaChallengeCookie(cookieStore);
      return { error: "Your MFA setup challenge is invalid. Please sign in again." };
    }

    if (!verifyTotpCode(challenge.secret, code)) {
      return { error: "Invalid MFA code. Try again." };
    }

    const encryptedSecret = encryptAdminMfaSecret(challenge.secret);
    const { error } = await serviceSupabase.from("admin_mfa_factors").upsert(
      {
        user_id: challenge.userId,
        email: challenge.email,
        secret_encrypted: encryptedSecret,
        enabled: true,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return { error: error.message };
    }

    await clearAdminMfaChallengeCookie(cookieStore);
    await setAdminSession(cookieStore);
    await logAdminAction(serviceSupabase, {
      adminEmail: challenge.email,
      action: "admin_mfa_enabled",
      entityType: "admin_mfa_factor",
      entityId: challenge.userId,
      afterValue: { success: true },
    });

    return { success: true };
  }

  const { data: factor, error } = await serviceSupabase
    .from("admin_mfa_factors")
    .select("user_id, email, secret_encrypted, enabled")
    .eq("user_id", challenge.userId)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!factor || factor.enabled === false) {
    return { error: "Admin MFA is not configured for this account." };
  }

  const { decryptAdminMfaSecret } = await import("@/lib/admin-mfa");
  const secret = decryptAdminMfaSecret((factor as AdminMfaFactor).secret_encrypted);

  if (!verifyTotpCode(secret, code)) {
    return { error: "Invalid MFA code. Try again." };
  }

  await serviceSupabase
    .from("admin_mfa_factors")
    .update({ last_used_at: new Date().toISOString() })
    .eq("user_id", challenge.userId);

  await clearAdminMfaChallengeCookie(cookieStore);
  await setAdminSession(cookieStore);
  await logAdminAction(serviceSupabase, {
    adminEmail: challenge.email,
    action: "admin_login",
    entityType: "admin_session",
    entityId: challenge.userId,
    afterValue: { success: true, mfa: true },
  });

  return { success: true };
}

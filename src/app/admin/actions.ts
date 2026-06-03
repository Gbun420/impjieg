"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdminEmail } from "@/lib/admin-access";
import { logAdminAction } from "@/lib/admin-audit";
import { clearAdminSession, setAdminSession } from "@/lib/admin-session";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";

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

  await setAdminSession(cookieStore);
  await logAdminAction(
    createServiceClient(getSupabaseUrl(), getSupabaseServiceKey()),
    {
      adminEmail: user.email,
      action: "admin_login",
      entityType: "admin_session",
      entityId: user.id,
      afterValue: { success: true },
    }
  );
  return { success: true };
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

  await clearAdminSession(await cookies());
  redirect("/admin/login");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { clearAdminSession, setAdminSession } from "@/lib/admin-session";

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

  if (user?.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    await clearAdminSession(cookieStore);
    return { error: "This account is not authorized for admin access." };
  }

  await setAdminSession(cookieStore);
  return { success: true };
}

export async function adminLogout() {
  await clearAdminSession(await cookies());
  redirect("/admin/login");
}

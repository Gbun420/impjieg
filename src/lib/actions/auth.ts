"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    companyName: formData.get("companyName") as string,
  };

  if (!data.email || !data.password || !data.companyName) {
    return { error: "All fields are required" };
  }

  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      data: { companyName: data.companyName },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Employer profile will be created lazily on first dashboard access
  return { success: true, needsConfirmation: !authData.user?.email_confirmed_at };
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
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
    redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback?next=/employer/settings`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

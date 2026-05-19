"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { error: "Please enter a valid email address" };
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
    if (authError.message.includes("already registered")) {
      return { error: "An account with this email already exists. Please sign in." };
    }
    return { error: authError.message };
  }

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
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password. Please try again." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email address before signing in. Check your inbox for the confirmation link." };
    }
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

export async function ensureEmployerProfile() {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", profile: null };
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
  const slug = slugify(companyName);

  const { data: newProfile, error: profileError } = await serviceSupabase
    .from("employers")
    .insert({
      user_id: user.id,
      name: companyName,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
    })
    .select()
    .single();

  if (profileError) {
    return { error: profileError.message, profile: null };
  }

  return { error: null, profile: newProfile };
}

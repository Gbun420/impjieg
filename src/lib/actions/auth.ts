"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    companyName: formData.get("companyName") as string,
  };

  const { data: authData, error: authError } =
    await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      },
    });

  if (authError) {
    return { error: authError.message };
  }

  if (authData.user) {
    const slug = slugify(data.companyName);
    const { error: profileError } = await supabase
      .from("employers")
      .insert({
        user_id: authData.user.id,
        name: data.companyName,
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  redirect("/auth/login?message=check-email");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/employer/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback?next=/employer/settings`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

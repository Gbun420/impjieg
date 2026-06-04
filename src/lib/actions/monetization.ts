"use server";

import { resolveEmployerCommercialEntitlements } from "@/lib/monetization/admin-grants/actions";
import { createClient } from "@/lib/supabase/server";

export async function getEmployerEntitlements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single<{ id: string }>();

  if (!employer) {
    return null;
  }

  try {
    return await resolveEmployerCommercialEntitlements(employer.id);
  } catch (error) {
    console.error("Failed to resolve entitlements:", error);
    return null;
  }
}

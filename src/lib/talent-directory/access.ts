import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceKey } from "@/lib/supabase/env";
import type { AuthContext } from "@/lib/auth/account-access";
import type { TalentAccessWithEmployer, CreditBalance } from "./types";
import { TALENT_DIRECTORY_ENABLED } from "./constants";

// ============================================================================
// Feature Flag Guard
// ============================================================================

export function assertTalentDirectoryEnabled(): void {
  if (!TALENT_DIRECTORY_ENABLED) {
    throw new Error("Talent Directory is not enabled");
  }
}

// ============================================================================
// Role Assertions
// ============================================================================

export function assertCandidateAccount(
  ctx: AuthContext
): asserts ctx is AuthContext & { user: NonNullable<AuthContext["user"]> } {
  if (!ctx.user || ctx.accountType !== "candidate") {
    throw new Error("Candidate access required");
  }
}

export function assertEmployerAccount(
  ctx: AuthContext
): asserts ctx is AuthContext & { user: NonNullable<AuthContext["user"]> } {
  if (!ctx.user || (ctx.accountType !== "employer" && !ctx.isAdmin)) {
    throw new Error("Employer access required");
  }
}

export function assertAdminAccount(
  ctx: AuthContext
): asserts ctx is AuthContext & { user: NonNullable<AuthContext["user"]> } {
  if (!ctx.user || !ctx.isAdmin) {
    throw new Error("Admin access required");
  }
}

// ============================================================================
// Employer Talent Access
// ============================================================================

export async function getEmployerTalentAccess(
  employerId: string
): Promise<TalentAccessWithEmployer | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employer_talent_access" as any)
    .select("*, employer:employers(id, name, slug, logo_url)")
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as TalentAccessWithEmployer | null;
}

export async function getServiceEmployerTalentAccess(
  employerId: string
): Promise<TalentAccessWithEmployer | null> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
  const { data } = await serviceSupabase
    .from("employer_talent_access" as any)
    .select("*, employer:employers(id, name, slug, logo_url)")
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data as TalentAccessWithEmployer | null;
}

export function hasActiveTalentAccess(
  access: TalentAccessWithEmployer | null
): boolean {
  if (!access) return false;
  if (access.status !== "active" && access.status !== "trialing") return false;
  return true;
}

export function getCreditBalance(
  access: TalentAccessWithEmployer | null
): CreditBalance | null {
  if (!access) return null;
  return {
    total: access.credits_total,
    used: access.credits_used,
    remaining: access.credits_total - access.credits_used,
    planKey: access.plan_key,
    status: access.status,
  };
}

export async function canEmployerSearchTalent(
  employerId: string
): Promise<boolean> {
  if (!TALENT_DIRECTORY_ENABLED) return false;
  const access = await getEmployerTalentAccess(employerId);
  return hasActiveTalentAccess(access);
}

export async function canEmployerRequestContact(
  employerId: string
): Promise<boolean> {
  if (!TALENT_DIRECTORY_ENABLED) return false;
  const access = await getEmployerTalentAccess(employerId);
  if (!hasActiveTalentAccess(access)) return false;
  const balance = getCreditBalance(access);
  return balance !== null && balance.remaining > 0;
}

// ============================================================================
// Candidate Directory Profile
// ============================================================================

export async function canCandidateManageDirectoryProfile(
  candidateUserId: string
): Promise<boolean> {
  if (!TALENT_DIRECTORY_ENABLED) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidate_directory_profiles" as any)
    .select("id")
    .eq("candidate_user_id", candidateUserId)
    .maybeSingle();
  return !!data;
}

// ============================================================================
// Admin
// ============================================================================

export function canAdminManageTalentDirectory(ctx: AuthContext): boolean {
  return ctx.isAdmin;
}

// ============================================================================
// Slug Generation
// ============================================================================

export function generateDirectorySlug(fullName: string): string {
  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

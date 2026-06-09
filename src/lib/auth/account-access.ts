import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AccountType = "candidate" | "employer" | "admin" | "unauthenticated";

export interface AuthContext {
  user: User | null;
  accountType: AccountType;
  hasEmployerProfile: boolean;
  isAdmin: boolean;
}

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, accountType: "unauthenticated", hasEmployerProfile: false, isAdmin: false };
  }

  const isAdmin = user.app_metadata?.role === "admin" && user.email
    ? await isSuperAdminEmail(user.email)
    : false;

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const accountType = determineAccountType(user, !!employer, isAdmin);

  return {
    user,
    accountType,
    hasEmployerProfile: !!employer,
    isAdmin,
  };
}

function determineAccountType(user: User, hasEmployerProfile: boolean, isAdmin: boolean): AccountType {
  if (isAdmin) return "admin";

  const metaType = user.user_metadata?.accountType as string | undefined;
  if (metaType === "candidate") return "candidate";
  if (metaType === "employer") return "employer";

  if (hasEmployerProfile) return "employer";
  return "candidate";
}

async function isSuperAdminEmail(email: string): Promise<boolean> {
  const configured = process.env.SUPER_ADMIN_EMAILS;
  const primaryAdminEmail = process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL?.trim().toLowerCase();

  const emails = new Set<string>();

  if (configured) {
    for (const e of configured.split(",")) {
      const normalized = e.trim().toLowerCase();
      if (normalized) emails.add(normalized);
    }
  }

  const primary = process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL?.trim().toLowerCase();
  if (primary) emails.add(primary);

  const fallback = "info@dopaminedigital.co";
  emails.add(fallback);

  return emails.has(email.trim().toLowerCase());
}

export async function requireCandidateAccess(): Promise<{ user: User; error?: string }> {
  const context = await getAuthContext();
  if (!context.user) {
    return { user: null as any, error: "Authentication required" };
  }
  if (context.accountType !== "candidate") {
    return { user: null as any, error: "Candidate access required" };
  }
  return { user: context.user };
}

export async function requireEmployerAccess(): Promise<{ user: User; employerId: string; error?: string }> {
  const supabase = await createClient();
  const context = await getAuthContext();

  if (!context.user) {
    return { user: null as any, employerId: "", error: "Authentication required" };
  }
  if (context.accountType === "candidate") {
    return { user: null as any, employerId: "", error: "Employer access required" };
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", context.user.id)
    .maybeSingle();

  if (!employer) {
    return { user: null as any, employerId: "", error: "Employer profile not found" };
  }

  return { user: context.user, employerId: employer.id };
}

export async function requireAdminAccess(): Promise<{ user: User; error?: string }> {
  const context = await getAuthContext();
  if (!context.user) {
    return { user: null as any, error: "Authentication required" };
  }
  if (!context.isAdmin) {
    return { user: null as any, error: "Admin access required" };
  }
  return { user: context.user };
}

export async function userCanAccessEmployerWorkspace(user: User): Promise<boolean> {
  const supabase = await createClient();
  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (employer) return true;

  const metaType = user.user_metadata?.accountType as string | undefined;
  return metaType === "employer";
}

export async function userCanAccessCandidateWorkspace(user: User): Promise<boolean> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile) return true;

  const metaType = user.user_metadata?.accountType as string | undefined;
  return metaType === "candidate";
}

export async function getAccountType(user: User): Promise<AccountType> {
  const isAdmin = user.app_metadata?.role === "admin" && user.email
    ? await isSuperAdminEmail(user.email)
    : false;

  if (isAdmin) return "admin";

  const supabase = await createClient();
  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const metaType = user.user_metadata?.accountType as string | undefined;
  if (metaType === "candidate") return "candidate";
  if (metaType === "employer") return "employer";
  if (employer) return "employer";
  return "candidate";
}
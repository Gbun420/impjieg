import { createClient as createServiceClient, type User } from "@supabase/supabase-js";
import { hasValidAdminSession } from "@/lib/admin-session";
import { isSuperAdminEmail } from "@/lib/admin-access";
import { createClient as createUserClient } from "@/lib/supabase/server";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database, Employer } from "@/lib/supabase/types";

export class AuthorizationError extends Error {
  constructor(message = "You are not authorized to access this resource") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function createAdminGrantsServiceClient() {
  return createServiceClient<Database>(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
}

export function isEligibleAdminUser(user: Pick<User, "id" | "email" | "app_metadata"> | null | undefined) {
  const appRole = (user?.app_metadata as { role?: string | null } | undefined)?.role;

  return Boolean(
    user?.id &&
      user.email &&
      appRole === "admin" &&
      isSuperAdminEmail(user.email)
  );
}

export async function getCurrentUserOrThrow(
  client = createUserClient()
) {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new AuthorizationError("You must be signed in to continue");
  }

  return user;
}

export async function assertAdminUser(client = createUserClient()) {
  if (!(await hasValidAdminSession())) {
    throw new AuthorizationError("Admin session required");
  }

  const user = await getCurrentUserOrThrow(client);

  if (!isEligibleAdminUser(user)) {
    throw new AuthorizationError("This account is not authorized for admin access");
  }

  return user;
}

export async function getEmployerProfileForUser(
  userId: string,
  client = createUserClient()
): Promise<Pick<Employer, "id" | "user_id" | "name" | "slug">> {
  const { data, error } = await client
    .from("employers")
    .select("id, user_id, name, slug")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new AuthorizationError("Employer profile not found");
  }

  return data as Pick<Employer, "id" | "user_id" | "name" | "slug">;
}

export async function assertEmployerOwnsGrant(
  userId: string,
  employerId: string,
  client = createUserClient()
) {
  const employer = await getEmployerProfileForUser(userId, client);

  if (employer.id !== employerId) {
    throw new AuthorizationError("You can only access your own commercial grants");
  }

  return employer;
}

export async function assertAdminOrEmployerOwnsGrant(
  user: Pick<User, "id" | "email" | "app_metadata">,
  employerId: string,
  client = createUserClient()
) {
  if (isEligibleAdminUser(user)) {
    return true;
  }

  await assertEmployerOwnsGrant(user.id, employerId, client);
  return true;
}

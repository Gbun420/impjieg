import type { Database } from "@/lib/supabase/types";

type SignupAccountType = "candidate" | "employer";

type SignupInput = {
  email: string;
  password: string;
  accountType: SignupAccountType;
  fullName?: string;
  companyName?: string;
};

type SignupResult =
  | { success: true; needsConfirmation: false; redirectTo: string; userId: string; error?: undefined }
  | { needsConfirmation: true; userId: string; email: string; success?: undefined; error?: undefined; redirectTo?: undefined }
  | { error: string; success?: undefined; needsConfirmation?: undefined; redirectTo?: undefined; userId?: undefined };

type UserClient = {
  auth: {
    signInWithPassword(payload: {
      email: string;
      password: string;
    }): Promise<{ error: { message: string } | null }>;
    signOut(): Promise<{ error: { message: string } | null }>;
  };
};

type CreateUserResponse = {
  data: { user: { id: string } | null } | null;
  error: { message: string } | null;
};

type AdminClient = {
  auth: {
    admin: {
      createUser(payload: {
        email: string;
        password: string;
        email_confirm: boolean;
        user_metadata: {
          accountType: SignupAccountType;
          fullName?: string;
          companyName?: string;
        };
      }): Promise<CreateUserResponse>;
    };
  };
};

type CandidateProfileInsert = Database["public"]["Tables"]["candidate_profiles"]["Insert"];

type DeleteQuery = {
  eq(column: "user_id", value: string): Promise<{ error: { message: string } | null }>;
};

type EmployerMutationTable = {
  delete(): DeleteQuery;
};

type CandidateProfilesMutationTable = {
  delete(): DeleteQuery;
  insert(values: CandidateProfileInsert[]): {
    select(): {
      single(): Promise<{
        error: { message: string } | null;
      }>;
    };
  };
};

async function deleteEmployerProfile(serviceClient: unknown, userId: string) {
  const employerTable = serviceClient as {
    from(table: "employers"): EmployerMutationTable;
  };

  const { error } = await employerTable
    .from("employers")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function createCandidateProfile(
  serviceClient: unknown,
  userId: string,
  fullName: string
) {
  const candidateProfilesTable = serviceClient as {
    from(table: "candidate_profiles"): CandidateProfilesMutationTable;
  };

  const { error: deleteError } = await candidateProfilesTable
    .from("candidate_profiles")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error } = await candidateProfilesTable
    .from("candidate_profiles")
    .insert([
      {
        user_id: userId,
        full_name: fullName,
        is_open_to_work: true,
      } satisfies CandidateProfileInsert,
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
}

function isAutoConfirmEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return process.env.ALLOW_AUTO_CONFIRM_SIGNUP === "true";
  }
  return process.env.ALLOW_AUTO_CONFIRM_SIGNUP !== "false";
}

export async function signupWithAutoConfirm({
  adminClient,
  userClient,
  serviceClient,
  input,
}: {
  adminClient: AdminClient;
  userClient: UserClient;
  serviceClient: unknown;
  input: SignupInput;
}): Promise<SignupResult> {
  const autoConfirm = isAutoConfirmEnabled();

  const emailConfirm = isAutoConfirmEnabled();

  const createPayload =
    input.accountType === "employer"
      ? {
          email: input.email,
          password: input.password,
          email_confirm: emailConfirm,
          user_metadata: {
            accountType: input.accountType,
            companyName: input.companyName?.trim() || undefined,
          },
        }
      : {
          email: input.email,
          password: input.password,
          email_confirm: emailConfirm,
          user_metadata: {
            accountType: input.accountType,
            fullName: input.fullName?.trim() || undefined,
          },
        };

  const { data: created, error: createError } = await adminClient.auth.admin.createUser(
    createPayload
  );

  if (createError) {
    if (createError.message.toLowerCase().includes("already")) {
      return {
        error: "An account with this email already exists. Please sign in.",
      };
    }
    return { error: createError.message };
  }

  const userId = created?.user?.id;
  if (!userId) {
    return { error: "Failed to create account — please try again" };
  }

  // Try to sign the user in (may fail if email confirmation is required)
  const { error: signInError } = await userClient.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  // If sign-in fails because email is not confirmed, return needsConfirmation
  // The userId is available so legal acceptance can be recorded
  if (signInError) {
    const isConfirmationError =
      signInError.message.toLowerCase().includes("email not confirmed") ||
      signInError.message.toLowerCase().includes("not confirmed") ||
      signInError.message.toLowerCase().includes("confirm");

    if (isConfirmationError && !emailConfirm) {
      return {
        needsConfirmation: true,
        userId,
        email: input.email,
      };
    }

    // Other sign-in errors are real failures
    return { error: signInError.message };
  }

  // User is signed in — create profile
  try {
    if (input.accountType === "candidate") {
      await deleteEmployerProfile(serviceClient, userId);
      await createCandidateProfile(
        serviceClient,
        userId,
        input.fullName?.trim() || input.email.split("@")[0]
      );
    }
  } catch (error) {
    await userClient.auth.signOut();
    const message = error instanceof Error ? error.message : "Failed to complete account setup";
    return { error: message };
  }

  return {
    success: true,
    needsConfirmation: false,
    userId,
    redirectTo:
      input.accountType === "employer" ? "/employer/dashboard" : "/candidate/dashboard",
  };
}

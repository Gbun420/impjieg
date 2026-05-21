type SignupInput = {
  email: string;
  password: string;
  companyName: string;
};

type SignupResult =
  | { success: true; needsConfirmation: false; error?: undefined }
  | { error: string; success?: undefined; needsConfirmation?: undefined };

type UserClient = {
  auth: {
    signInWithPassword(payload: {
      email: string;
      password: string;
    }): Promise<{ error: { message: string } | null }>;
  };
};

type AdminClient = {
  auth: {
    admin: {
      createUser(payload: {
        email: string;
        password: string;
        email_confirm: true;
        user_metadata: { companyName: string };
      }): Promise<{ error: { message: string } | null }>;
    };
  };
};

export async function signupWithAutoConfirm({
  adminClient,
  userClient,
  input,
}: {
  adminClient: AdminClient;
  userClient: UserClient;
  input: SignupInput;
}): Promise<SignupResult> {
  const { error: createError } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { companyName: input.companyName },
  });

  if (createError) {
    if (createError.message.toLowerCase().includes("already")) {
      return {
        error: "An account with this email already exists. Please sign in.",
      };
    }

    return { error: createError.message };
  }

  const { error: signInError } = await userClient.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  return { success: true, needsConfirmation: false };
}

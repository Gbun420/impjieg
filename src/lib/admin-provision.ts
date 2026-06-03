import { randomBytes } from "node:crypto";
import { normalizeEmail } from "./admin-access";

type AdminUser = {
  id: string;
  email?: string | null;
};

type AdminListUsersResponse = {
  data:
    | {
        users: AdminUser[];
        nextPage?: number | null;
        [key: string]: unknown;
      }
    | null;
  error: { message: string } | null;
};

type AdminMutationResponse = {
  error: { message: string } | null;
};

export type AdminProvisionClient = {
  auth: {
    admin: {
      listUsers(params?: { page?: number; perPage?: number }): Promise<AdminListUsersResponse>;
      createUser(payload: {
        email: string;
        password: string;
        email_confirm: true;
        app_metadata: { role: "admin" };
      }): Promise<AdminMutationResponse>;
      updateUserById(
        id: string,
        payload: {
          password: string;
          email_confirm: true;
          app_metadata: { role: "admin" };
        }
      ): Promise<AdminMutationResponse>;
    };
    resetPasswordForEmail(
      email: string,
      options: { redirectTo: string }
    ): Promise<AdminMutationResponse>;
  };
};

const ADMIN_APP_METADATA = { role: "admin" } as const;
const ADMIN_LIST_PAGE_SIZE = 100;

function makeTemporaryPassword() {
  return randomBytes(24).toString("hex");
}

async function findAdminUserByEmail(
  client: AdminProvisionClient,
  email: string
): Promise<AdminUser | null> {
  const targetEmail = normalizeEmail(email);
  let page = 1;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: ADMIN_LIST_PAGE_SIZE,
    });

    if (error) {
      throw new Error(error.message);
    }

    const users = data?.users ?? [];
    const existingUser = users.find(
      (user) => normalizeEmail(user.email ?? "") === targetEmail
    );

    if (existingUser) {
      return existingUser;
    }

    const nextPage = data?.nextPage ?? null;
    if (!nextPage) {
      return null;
    }

    page = nextPage;
  }
}

async function assertMutationSuccess(response: AdminMutationResponse) {
  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function upsertAdminPasswordAccount({
  client,
  email,
  password,
}: {
  client: AdminProvisionClient;
  email: string;
  password: string;
}) {
  const existingUser = await findAdminUserByEmail(client, email);
  const payload = {
    password,
    email_confirm: true as const,
    app_metadata: ADMIN_APP_METADATA,
  };

  if (existingUser) {
    await assertMutationSuccess(
      await client.auth.admin.updateUserById(existingUser.id, payload)
    );
    return {
      email: normalizeEmail(email),
      status: "password-updated" as const,
    };
  }

  await assertMutationSuccess(
    await client.auth.admin.createUser({
      email,
      ...payload,
    })
  );

  return {
    email: normalizeEmail(email),
    status: "account-created" as const,
  };
}

export async function upsertAdminResettableAccount({
  client,
  email,
  baseUrl,
}: {
  client: AdminProvisionClient;
  email: string;
  baseUrl: string;
}) {
  const existingUser = await findAdminUserByEmail(client, email);
  const temporaryPassword = makeTemporaryPassword();
  const payload = {
    password: temporaryPassword,
    email_confirm: true as const,
    app_metadata: ADMIN_APP_METADATA,
  };

  if (existingUser) {
    await assertMutationSuccess(
      await client.auth.admin.updateUserById(existingUser.id, payload)
    );
  } else {
    await assertMutationSuccess(
      await client.auth.admin.createUser({
        email,
        ...payload,
      })
    );
  }

  await assertMutationSuccess(
    await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/callback?next=/admin/login`,
    })
  );

  return {
    email: normalizeEmail(email),
    status: "reset-email-sent",
  } as const;
}

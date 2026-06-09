import test from "node:test";
import assert from "node:assert/strict";
import { signupWithAutoConfirm } from "./auth-signup";

test("signupWithAutoConfirm creates a confirmed employer user and signs them in", async () => {
  const adminCalls: unknown[] = [];
  const signInCalls: unknown[] = [];

  const result = await signupWithAutoConfirm({
    adminClient: {
      auth: {
        admin: {
          async createUser(payload) {
            adminCalls.push(payload);
            return { data: { user: { id: "user_1" } }, error: null };
          },
        },
      },
    },
    userClient: {
      auth: {
        async signInWithPassword(payload) {
          signInCalls.push(payload);
          return { error: null };
        },
        async signOut() {
          return { error: null };
        },
      },
    },
    serviceClient: {
      from() {
        return {
          delete() {
            return {
              eq() {
                return Promise.resolve({ error: null });
              },
            };
          },
          insert() {
            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({ data: null, error: null });
                  },
                };
              },
            };
          },
        };
      },
    } as never,
    input: {
      email: "founder@example.com",
      password: "secret123",
      accountType: "employer",
      companyName: "Acme Ltd",
    },
  });

  assert.deepEqual(adminCalls, [
    {
      email: "founder@example.com",
      password: "secret123",
      email_confirm: true,
      user_metadata: { accountType: "employer", companyName: "Acme Ltd" },
    },
  ]);
  assert.deepEqual(signInCalls, [
    {
      email: "founder@example.com",
      password: "secret123",
    },
  ]);
  assert.deepEqual(result, {
    success: true,
    needsConfirmation: false,
    userId: "user_1",
    redirectTo: "/employer/dashboard",
  });
});

test("signupWithAutoConfirm creates a candidate profile and removes the auto employer row", async () => {
  const calls: Record<string, unknown>[] = [];

  const result = await signupWithAutoConfirm({
    adminClient: {
      auth: {
        admin: {
          async createUser(payload) {
            calls.push({ type: "create", payload });
            return { data: { user: { id: "user_2" } }, error: null };
          },
        },
      },
    },
    userClient: {
      auth: {
        async signInWithPassword(payload) {
          calls.push({ type: "sign-in", payload });
          return { error: null };
        },
        async signOut() {
          calls.push({ type: "sign-out" });
          return { error: null };
        },
      },
    },
    serviceClient: {
      from(table) {
        return {
          delete() {
            return {
              eq(column, value) {
                calls.push({ type: "delete", table, column, value });
                return Promise.resolve({ error: null });
              },
            };
          },
          insert(values) {
            calls.push({ type: "insert", table, values });
            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({ data: null, error: null });
                  },
                };
              },
            };
          },
        };
      },
    } as never,
    input: {
      email: "candidate@example.com",
      password: "secret123",
      accountType: "candidate",
      fullName: "Jane Doe",
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.redirectTo, "/candidate/dashboard");
  assert.deepEqual(calls, [
    {
      type: "create",
      payload: {
        email: "candidate@example.com",
        password: "secret123",
        email_confirm: true,
        user_metadata: { accountType: "candidate", fullName: "Jane Doe" },
      },
    },
    {
      type: "sign-in",
      payload: {
        email: "candidate@example.com",
        password: "secret123",
      },
    },
    {
      type: "delete",
      table: "employers",
      column: "user_id",
      value: "user_2",
    },
    {
      type: "delete",
      table: "candidate_profiles",
      column: "user_id",
      value: "user_2",
    },
    {
      type: "insert",
      table: "candidate_profiles",
      values: [
        {
          user_id: "user_2",
          full_name: "Jane Doe",
          is_open_to_work: true,
        },
      ],
    },
  ]);
});

test("signupWithAutoConfirm returns a friendly duplicate-user error", async () => {
  const result = await signupWithAutoConfirm({
    adminClient: {
      auth: {
        admin: {
          async createUser() {
            return { data: null, error: { message: "User already registered" } };
          },
        },
      },
    },
    userClient: {
      auth: {
        async signInWithPassword() {
          throw new Error("signInWithPassword should not be called");
        },
        async signOut() {
          return { error: null };
        },
      },
    },
    serviceClient: {
      from() {
        throw new Error("serviceClient should not be called");
      },
    } as never,
    input: {
      email: "founder@example.com",
      password: "secret123",
      accountType: "employer",
      companyName: "Acme Ltd",
    },
  });

  assert.deepEqual(result, {
    error: "An account with this email already exists. Please sign in.",
  });
});

test("signupWithAutoConfirm returns needsConfirmation when email not confirmed", async () => {
  // Simulate production mode where email confirmation is required
  const prevNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    const result = await signupWithAutoConfirm({
      adminClient: {
        auth: {
          admin: {
            async createUser(payload) {
              return { data: { user: { id: "user_3" } }, error: null };
            },
          },
        },
      },
      userClient: {
        auth: {
          async signInWithPassword() {
            return { error: { message: "Email not confirmed" } };
          },
          async signOut() {
            return { error: null };
          },
        },
      },
      serviceClient: {
        from() {
          return {
            delete() {
              return {
                eq() {
                  return Promise.resolve({ error: null });
                },
              };
            },
          };
        },
      } as never,
      input: {
        email: "needs-confirm@example.com",
        password: "secret123",
        accountType: "candidate",
        fullName: "Pat Test",
      },
    });

    assert.equal(result.needsConfirmation, true);
    assert.equal(result.userId, "user_3");
    assert.equal(result.email, "needs-confirm@example.com");
    assert.equal(result.success, undefined);
    assert.equal(result.error, undefined);
  } finally {
    process.env.NODE_ENV = prevNodeEnv;
  }
});

test("signupWithAutoConfirm returns needsConfirmation for not confirmed variant messages", async () => {
  const prevNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    const result = await signupWithAutoConfirm({
      adminClient: {
        auth: {
          admin: {
            async createUser(payload) {
              return { data: { user: { id: "user_4" } }, error: null };
            },
          },
        },
      },
      userClient: {
        auth: {
          async signInWithPassword() {
            return { error: { message: "Email not confirmed. Please check your inbox for the confirmation link." } };
          },
          async signOut() {
            return { error: null };
          },
        },
      },
      serviceClient: {
        from() {
          return {
            delete() {
              return {
                eq() {
                  return Promise.resolve({ error: null });
                },
              };
            },
          };
        },
      } as never,
      input: {
        email: "confirm2@example.com",
        password: "secret123",
        accountType: "employer",
        companyName: "TestCo",
      },
    });

    assert.equal(result.needsConfirmation, true);
    assert.equal(result.userId, "user_4");
  } finally {
    process.env.NODE_ENV = prevNodeEnv;
  }
});

test("signupWithAutoConfirm returns error for non-confirmation sign-in failures", async () => {
  const prevNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    const result = await signupWithAutoConfirm({
      adminClient: {
        auth: {
          admin: {
            async createUser(payload) {
              return { data: { user: { id: "user_5" } }, error: null };
            },
          },
        },
      },
      userClient: {
        auth: {
          async signInWithPassword() {
            return { error: { message: "Invalid login credentials" } };
          },
          async signOut() {
            return { error: null };
          },
        },
      },
      serviceClient: {
        from() {
          return {
            delete() {
              return {
                eq() {
                  return Promise.resolve({ error: null });
                },
              };
            },
          };
        },
      } as never,
      input: {
        email: "bad@example.com",
        password: "secret123",
        accountType: "candidate",
        fullName: "Bad Creds",
      },
    });

    assert.equal(result.error, "Invalid login credentials");
    assert.equal(result.success, undefined);
    assert.equal(result.needsConfirmation, undefined);
  } finally {
    process.env.NODE_ENV = prevNodeEnv;
  }
});

test("signupWithAutoConfirm returns error when user has no id", async () => {
  const result = await signupWithAutoConfirm({
    adminClient: {
      auth: {
        admin: {
          async createUser(payload) {
            return { data: { user: null }, error: null };
          },
        },
      },
    },
    userClient: {
      auth: {
        async signInWithPassword() {
          return { error: null };
        },
        async signOut() {
          return { error: null };
        },
      },
    },
    serviceClient: {
      from() {
        return {
          delete() {
            return {
              eq() {
                return Promise.resolve({ error: null });
              },
            };
          },
        };
      },
    } as never,
    input: {
      email: "noid@example.com",
      password: "secret123",
      accountType: "candidate",
      fullName: "No ID",
    },
  });

  assert.equal(result.error, "Failed to create account — please try again");
});

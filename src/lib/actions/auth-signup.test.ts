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

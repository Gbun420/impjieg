import test from "node:test";
import assert from "node:assert/strict";
import {
  upsertAdminPasswordAccount,
  upsertAdminResettableAccount,
} from "./admin-provision";

test("upsertAdminPasswordAccount creates a confirmed admin user when one does not exist", async () => {
  const calls: Record<string, unknown>[] = [];

  const result = await upsertAdminPasswordAccount({
    client: {
      auth: {
        admin: {
          async listUsers() {
            return { data: { users: [], nextPage: null }, error: null };
          },
          async createUser(payload) {
            calls.push(payload as Record<string, unknown>);
            return { error: null };
          },
          async updateUserById() {
            throw new Error("updateUserById should not be called");
          },
        },
      },
    },
    email: "BundyGlenn@Example.com",
    password: "Floyd420!",
  });

  assert.deepEqual(calls, [
    {
      email: "BundyGlenn@Example.com",
      password: "Floyd420!",
      email_confirm: true,
      app_metadata: { role: "admin" },
    },
  ]);
  assert.deepEqual(result, {
    email: "bundyglenn@example.com",
    status: "account-created",
  });
});

test("upsertAdminResettableAccount updates an existing admin and sends a reset email", async () => {
  const calls: {
    update: unknown[];
    reset: unknown[];
  } = {
    update: [],
    reset: [],
  };

  const result = await upsertAdminResettableAccount({
    client: {
      auth: {
        admin: {
          async listUsers() {
            return {
              data: {
                users: [{ id: "user_123", email: "anthonymackaymt@gmail.com" }],
                nextPage: null,
              },
              error: null,
            };
          },
          async createUser() {
            throw new Error("createUser should not be called");
          },
          async updateUserById(id, payload) {
            calls.update.push([id, payload]);
            return { error: null };
          },
        },
        async resetPasswordForEmail(email, options) {
          calls.reset.push([email, options]);
          return { error: null };
        },
      },
    },
    email: "anthonymackaymt@gmail.com",
    baseUrl: "https://impjieg.vercel.app",
  });

  assert.equal(calls.update.length, 1);
  const [updateId, updatePayload] = calls.update[0] as [
    string,
    {
      password: string;
      email_confirm: boolean;
      app_metadata: { role: string };
    },
  ];
  assert.equal(updateId, "user_123");
  assert.equal(typeof updatePayload.password, "string");
  assert.ok(updatePayload.password.length > 0);
  assert.equal(updatePayload.email_confirm, true);
  assert.deepEqual(updatePayload.app_metadata, { role: "admin" });
  assert.deepEqual(calls.reset, [
    [
      "anthonymackaymt@gmail.com",
      { redirectTo: "https://impjieg.vercel.app/auth/callback?next=/admin/login" },
    ],
  ]);
  assert.deepEqual(result, {
    email: "anthonymackaymt@gmail.com",
    status: "reset-email-sent",
  });
});

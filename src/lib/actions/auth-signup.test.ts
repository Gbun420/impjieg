import test from "node:test";
import assert from "node:assert/strict";
import { signupWithAutoConfirm } from "./auth-signup";

test("signupWithAutoConfirm creates a confirmed user and signs them in", async () => {
  const adminCalls: unknown[] = [];
  const signInCalls: unknown[] = [];

  const result = await signupWithAutoConfirm({
    adminClient: {
      auth: {
        admin: {
          async createUser(payload) {
            adminCalls.push(payload);
            return { error: null };
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
      },
    },
    input: {
      email: "founder@example.com",
      password: "secret123",
      companyName: "Acme Ltd",
    },
  });

  assert.deepEqual(adminCalls, [
    {
      email: "founder@example.com",
      password: "secret123",
      email_confirm: true,
      user_metadata: { companyName: "Acme Ltd" },
    },
  ]);
  assert.deepEqual(signInCalls, [
    {
      email: "founder@example.com",
      password: "secret123",
    },
  ]);
  assert.deepEqual(result, { success: true, needsConfirmation: false });
});

test("signupWithAutoConfirm returns a friendly duplicate-user error", async () => {
  const result = await signupWithAutoConfirm({
    adminClient: {
      auth: {
        admin: {
          async createUser() {
            return { error: { message: "User already registered" } };
          },
        },
      },
    },
    userClient: {
      auth: {
        async signInWithPassword() {
          throw new Error("signInWithPassword should not be called");
        },
      },
    },
    input: {
      email: "founder@example.com",
      password: "secret123",
      companyName: "Acme Ltd",
    },
  });

  assert.deepEqual(result, {
    error: "An account with this email already exists. Please sign in.",
  });
});

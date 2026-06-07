import test from "node:test";
import assert from "node:assert/strict";
import { isSuperAdminEmail, getSuperAdminEmailsList } from "./admin-access";

function withAdminEnv(
  env: {
    SUPER_ADMIN_EMAILS?: string;
    ADMIN_BOOTSTRAP_PRIMARY_EMAIL?: string;
  },
  callback: () => void
) {
  const originalSuperAdminEmails = process.env.SUPER_ADMIN_EMAILS;
  const originalPrimaryAdminEmail = process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL;

  if (env.SUPER_ADMIN_EMAILS === undefined) {
    delete process.env.SUPER_ADMIN_EMAILS;
  } else {
    process.env.SUPER_ADMIN_EMAILS = env.SUPER_ADMIN_EMAILS;
  }

  if (env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL === undefined) {
    delete process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL;
  } else {
    process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL = env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL;
  }

  try {
    callback();
  } finally {
    if (originalSuperAdminEmails === undefined) {
      delete process.env.SUPER_ADMIN_EMAILS;
    } else {
      process.env.SUPER_ADMIN_EMAILS = originalSuperAdminEmails;
    }

    if (originalPrimaryAdminEmail === undefined) {
      delete process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL;
    } else {
      process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL = originalPrimaryAdminEmail;
    }
  }
}

test("super admin email allowlist is case-insensitive", () => {
  withAdminEnv(
    {
      SUPER_ADMIN_EMAILS: "info@dopaminedigital.co",
      ADMIN_BOOTSTRAP_PRIMARY_EMAIL: undefined,
    },
    () => {
      assert.equal(isSuperAdminEmail("Info@DopamineDigital.Co"), true);
      assert.equal(isSuperAdminEmail("someoneelse@example.com"), false);
      assert.deepEqual(getSuperAdminEmailsList(), ["info@dopaminedigital.co"]);
    }
  );
});

test("primary bootstrap admin email is accepted for admin authorization", () => {
  withAdminEnv(
    {
      SUPER_ADMIN_EMAILS: "info@dopaminedigital.co",
      ADMIN_BOOTSTRAP_PRIMARY_EMAIL: "bundyglenn@gmail.com",
    },
    () => {
      assert.equal(isSuperAdminEmail("bundyglenn@gmail.com"), true);
      assert.equal(isSuperAdminEmail("BUNDYGLENN@GMAIL.COM"), true);
    }
  );
});

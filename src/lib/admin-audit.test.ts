import test from "node:test";
import assert from "node:assert/strict";
import { buildAdminAuditRecord } from "./admin-audit";

test("buildAdminAuditRecord normalizes and redacts sensitive data", () => {
  const record = buildAdminAuditRecord({
    adminEmail: " Admin@Example.com ",
    action: "job_approve",
    entityType: "job",
    entityId: " 123 ",
    beforeValue: {
      title: "Old title",
      password: "secret",
      nested: { apiKey: "key-123", keep: true },
    },
    afterValue: {
      title: "New title",
      token: "abc",
    },
    ipAddress: " 127.0.0.1 ",
    userAgent: "  Chrome  ",
  });

  assert.equal(record.admin_email, "admin@example.com");
  assert.equal(record.action, "job_approve");
  assert.equal(record.entity_type, "job");
  assert.equal(record.entity_id, "123");
  assert.equal(record.ip_address, "127.0.0.1");
  assert.equal(record.user_agent, "Chrome");
  assert.equal(record.before_value?.password, "[redacted]");
  assert.equal((record.before_value as { nested?: { apiKey?: string; keep?: boolean } }).nested?.apiKey, "[redacted]");
  assert.equal(record.after_value?.token, "[redacted]");
});

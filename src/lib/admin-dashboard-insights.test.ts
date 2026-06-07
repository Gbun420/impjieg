import test from "node:test";
import assert from "node:assert/strict";
import { buildAdminDashboardPriorityItems } from "./admin-dashboard-insights";

test("buildAdminDashboardPriorityItems prioritizes operational issues before the audit feed", () => {
  const items = buildAdminDashboardPriorityItems({
    summary: {
      jobs: 24,
      activeJobs: 19,
      featuredJobs: 7,
      employers: 12,
      verifiedEmployers: 9,
      applications: 88,
      alerts: 16,
      activeAlerts: 14,
      subscriptions: 6,
      activeSubscriptions: 5,
      payments: 11,
      pendingPayments: 3,
      totalRevenue: 4800,
      paidRevenue: 3900,
    },
    serviceStatus: [
      { label: "Production URL", value: "configured", ok: true },
      { label: "Admin token", value: "configured", ok: true },
      { label: "Supabase", value: "down", ok: false },
      { label: "Stripe keys", value: "configured", ok: true },
    ],
    recentAuditLogs: [
      {
        id: "audit-1",
        action: "admin_login",
        entity_type: "admin_session",
        entity_id: "admin-1",
        admin_email: "admin@example.com",
        created_at: "2026-06-06T10:00:00.000Z",
      },
      {
        id: "audit-2",
        action: "grant_created",
        entity_type: "admin_commercial_grant",
        entity_id: "grant-1",
        admin_email: "admin@example.com",
        created_at: "2026-06-06T09:30:00.000Z",
      },
    ],
  });

  assert.deepEqual(items.map((item) => item.label), [
    "Service checks",
    "Pending payments",
    "Employer verification",
    "Recent admin activity",
  ]);
  assert.equal(items[0]?.tone, "critical");
  assert.equal(items[0]?.href, "/admin/audit-log");
  assert.match(items[0]?.note ?? "", /Supabase/);
  assert.equal(items[1]?.href, "/admin/payments");
  assert.equal(items[2]?.href, "/admin/employers");
  assert.equal(items[3]?.href, "/admin/audit-log");
});

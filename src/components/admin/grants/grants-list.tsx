"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { AdminCommercialGrantRow } from "@/lib/monetization/admin-grants/types";
import { revokeAdminCommercialGrant } from "@/lib/monetization/admin-grants/actions";
import { Inbox } from "lucide-react";

function formatGrantType(grantType: string) {
  const labels: Record<string, string> = {
    free_trial: "Free trial",
    plan_access: "Temporary plan access",
    job_credit: "Job posting credits",
    featured_credit: "Featured listing credits",
    boost_credit: "Boost credits",
    ai_screening_credit: "AI screening credits",
    percent_discount: "Percentage discount",
    fixed_discount: "Fixed discount",
    custom_entitlement: "Custom entitlement",
  };

  return labels[grantType] ?? grantType.replaceAll("_", " ");
}

function formatStatus(status: AdminCommercialGrantRow["status"]) {
  const labels: Record<AdminCommercialGrantRow["status"], string> = {
    active: "Active",
    expired: "Expired",
    revoked: "Revoked",
    consumed: "Used",
  };

  return labels[status];
}

function getStatusVariant(status: AdminCommercialGrantRow["status"]) {
  switch (status) {
    case "active":
      return "success" as const;
    case "revoked":
      return "error" as const;
    case "expired":
      return "secondary" as const;
    case "consumed":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export function GrantsList({ grants }: { grants: AdminCommercialGrantRow[] }) {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleRevoke(grantId: string) {
    if (!confirm("Revoke this grant? This action will require a reason.")) return;

    setRevokingId(grantId);
    try {
      const result = await revokeAdminCommercialGrant(grantId, "Manually revoked via admin console");
      if (!result.ok) {
        alert(result.error);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to revoke grant");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/30">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Grant</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Employer</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Expiry</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Usage</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {grants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-foreground">No grants yet</p>
                      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        Create a trial, credit, or discount grant for an employer. Grants will appear here with status, expiry, and usage.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              grants.map((grant) => {
                const usage =
                  grant.credits_total != null
                    ? `${grant.credits_used} / ${grant.credits_total}`
                    : grant.grant_type.includes("discount")
                      ? "Checkout discount"
                      : "—";

                return (
                  <tr key={grant.id} className="align-top hover:bg-muted/10">
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {formatGrantType(grant.grant_type)}
                        </p>
                        <p
                          className="max-w-[320px] truncate text-xs text-muted-foreground"
                          title={grant.reason}
                        >
                          {grant.reason}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="max-w-[180px] truncate font-mono text-xs text-foreground"
                        title={grant.employer_id}
                      >
                        {grant.employer_id}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(grant.status)}>
                        {formatStatus(grant.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {grant.expires_at ? formatDate(grant.expires_at) : "No expiry"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{usage}</td>
                    <td className="px-4 py-3">
                      {grant.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error hover:text-error hover:bg-error/10"
                          onClick={() => handleRevoke(grant.id)}
                          disabled={revokingId === grant.id}
                        >
                          {revokingId === grant.id ? "Revoking..." : "Revoke"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No action</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

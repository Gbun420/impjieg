"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { AdminCommercialGrantRow } from "@/lib/monetization/admin-grants/types";
import { revokeAdminCommercialGrant } from "@/lib/monetization/admin-grants/actions";

export function GrantsList({ grants }: { grants: AdminCommercialGrantRow[] }) {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleRevoke(grantId: string) {
    if (!confirm("Are you sure you want to revoke this grant?")) return;
    
    setRevokingId(grantId);
    try {
      await revokeAdminCommercialGrant(grantId, "Manually revoked via admin console");
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
              <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Employer ID</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Expires</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Usage</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {grants.map((grant) => (
              <tr key={grant.id} className="hover:bg-muted/10">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{grant.grant_type.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{grant.reason}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{grant.employer_id}</td>
                <td className="px-4 py-3">
                  <Badge variant={grant.status === "active" ? "success" : "secondary"}>
                    {grant.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {grant.expires_at ? formatDate(grant.expires_at) : "Never"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {grant.credits_total ? `${grant.credits_used} / ${grant.credits_total}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {grant.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:text-error hover:bg-error/10"
                      onClick={() => handleRevoke(grant.id)}
                      disabled={revokingId === grant.id}
                    >
                      {revokingId === grant.id ? "Revoking..." : "Revoke"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {grants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No commercial grants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

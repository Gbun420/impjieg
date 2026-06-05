"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  createAdminCommercialGrant,
} from "@/lib/monetization/admin-grants/actions";
import { GRANT_TYPES } from "@/lib/monetization/admin-grants/constants";

type GrantType = (typeof GRANT_TYPES)[number];

export function CreateGrantForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      employerId: formData.get("employerId") as string,
      grantType: formData.get("grantType") as GrantType,
      reason: formData.get("reason") as string,
      creditsTotal: formData.get("creditsTotal") ? parseInt(formData.get("creditsTotal") as string) : undefined,
      discountPercent: formData.get("discountPercent") ? parseInt(formData.get("discountPercent") as string) : undefined,
      discountAmountCents: formData.get("discountAmountCents") ? parseInt(formData.get("discountAmountCents") as string) : undefined,
      expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null,
      planKey: formData.get("planKey") as string || undefined,
      entitlementKey: formData.get("entitlementKey") as string || undefined,
    };

    try {
      await createAdminCommercialGrant(data);
      (event.target as HTMLFormElement).reset();
      alert("Grant created successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create grant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 border-border/70 bg-surface shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Create New Grant</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-error bg-error/10 p-3 rounded-lg">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Employer ID (UUID)</label>
            <Input name="employerId" required placeholder="00000000-0000-0000-0000-000000000000" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Grant Type</label>
            <select name="grantType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              {GRANT_TYPES.map((type) => (
                <option key={type} value={type}>{type.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Credits Total (if applicable)</label>
            <Input name="creditsTotal" type="number" placeholder="e.g. 5" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Percent (1-100)</label>
            <Input name="discountPercent" type="number" placeholder="e.g. 20" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Discount Amount (cents)</label>
            <Input name="discountAmountCents" type="number" placeholder="e.g. 5000 for €50" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry Date</label>
            <Input name="expiresAt" type="datetime-local" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Key (for trials)</label>
            <Input name="planKey" placeholder="e.g. growth" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Entitlement Key (custom)</label>
            <Input name="entitlementKey" placeholder="e.g. managed_shortlist_access" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reason (min 10 chars)</label>
          <Input name="reason" required placeholder="Commercial reason for this grant" />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create Grant"}
        </Button>
      </form>
    </Card>
  );
}

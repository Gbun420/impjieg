"use client";

import { useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAdminCommercialGrant } from "@/lib/monetization/admin-grants/actions";
import { GRANT_TYPES } from "@/lib/monetization/admin-grants/constants";
import { Clock3, Coins, ShieldCheck, Sparkles } from "lucide-react";

type GrantType = (typeof GRANT_TYPES)[number];

const DEFAULT_GRANT_TYPE: GrantType = GRANT_TYPES[0];

const grantTypeMeta: Record<
  GrantType,
  {
    title: string;
    description: string;
    badge: "success" | "warning" | "secondary" | "accent" | "info";
    summary: string;
  }
> = {
  free_trial: {
    title: "Free trial",
    description: "Temporary access to test the product or onboard a new employer.",
    badge: "secondary",
    summary: "Requires an expiry date and works best for onboarding or evaluation.",
  },
  plan_access: {
    title: "Plan access",
    description: "Unlock a paid plan tier for a fixed window of time.",
    badge: "secondary",
    summary: "Set an expiry date and optionally a plan key to mirror a plan tier.",
  },
  job_credit: {
    title: "Job credits",
    description: "Standard listing credits that can be consumed on job creation.",
    badge: "success",
    summary: "Requires a positive credit total. Perfect for free postings or bundles.",
  },
  featured_credit: {
    title: "Featured credits",
    description: "Credits that upgrade a listing to featured placement.",
    badge: "success",
    summary: "Use when you want the employer to skip the featured checkout path.",
  },
  boost_credit: {
    title: "Boost credits",
    description: "Credits for visibility boosts or promotional placement.",
    badge: "success",
    summary: "Requires a total credit count and consumes against the boost flow.",
  },
  ai_screening_credit: {
    title: "AI screening credits",
    description: "Credits for screening or matching calls tied to AI usage.",
    badge: "success",
    summary: "Use for usage-based AI features that should not hit the billing path.",
  },
  percent_discount: {
    title: "Percent discount",
    description: "Applies a percentage discount to checkout totals.",
    badge: "warning",
    summary: "Set either a percent or a fixed amount, not both.",
  },
  fixed_discount: {
    title: "Fixed discount",
    description: "Applies a fixed euro amount discount to checkout totals.",
    badge: "warning",
    summary: "Set either a fixed amount or a percent, not both.",
  },
  custom_entitlement: {
    title: "Custom entitlement",
    description: "Attaches a bespoke entitlement key for a special access path.",
    badge: "accent",
    summary: "Use when the grant needs to drive a custom product rule.",
  },
};

export function CreateGrantForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrantType, setSelectedGrantType] =
    useState<GrantType>(DEFAULT_GRANT_TYPE);

  const meta = grantTypeMeta[selectedGrantType];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      employerId: formData.get("employerId") as string,
      grantType: formData.get("grantType") as GrantType,
      productId: (formData.get("productId") as string) || undefined,
      reason: formData.get("reason") as string,
      creditsTotal: formData.get("creditsTotal")
        ? Number(formData.get("creditsTotal"))
        : undefined,
      discountPercent: formData.get("discountPercent")
        ? Number(formData.get("discountPercent"))
        : undefined,
      discountAmountCents: formData.get("discountAmountCents")
        ? Number(formData.get("discountAmountCents"))
        : undefined,
      startsAt: formData.get("startsAt")
        ? new Date(formData.get("startsAt") as string)
        : undefined,
      expiresAt: formData.get("expiresAt")
        ? new Date(formData.get("expiresAt") as string)
        : null,
      planKey: (formData.get("planKey") as string) || undefined,
      entitlementKey: (formData.get("entitlementKey") as string) || undefined,
      internalNotes: (formData.get("internalNotes") as string) || undefined,
    };

    try {
      await createAdminCommercialGrant(data);
      formRef.current?.reset();
      setSelectedGrantType(DEFAULT_GRANT_TYPE);
      alert("Grant created successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create grant");
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    formRef.current?.reset();
    setSelectedGrantType(DEFAULT_GRANT_TYPE);
    setError(null);
  };

  return (
    <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/8 via-surface to-secondary/8 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="info" className="w-fit">
              Revenue operations
            </Badge>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                Issue a commercial grant
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Grant temporary credits, access, or discounts without touching the billing flow.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm lg:max-w-sm">
            <div className="flex items-center gap-2">
              <Badge variant={meta.badge}>{meta.title}</Badge>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Selected type
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              {meta.description}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{meta.summary}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Guarded by admin session
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Only authenticated admins should use this console.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coins className="h-4 w-4 text-success" />
              Credit-backed grants
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Job, featured, boost, and AI credits can bypass the checkout path.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-secondary" />
              Discount grants
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Percent and fixed discounts are applied at checkout, not in the UI only.
            </p>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div className="rounded-2xl border border-error/20 bg-error/8 p-4 text-sm text-error">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">1</Badge>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Recipient
            </h4>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              name="employerId"
              label="Employer ID (UUID)"
              required
              placeholder="00000000-0000-0000-0000-000000000000"
            />
            <Input
              name="productId"
              label="Product ID"
              placeholder="Optional Stripe or product identifier"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">2</Badge>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Grant type
            </h4>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Grant Type</label>
                <select
                  name="grantType"
                  required
                  value={selectedGrantType}
                  onChange={(event) =>
                    setSelectedGrantType(event.target.value as GrantType)
                  }
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {GRANT_TYPES.map((type) => {
                    const optionMeta = grantTypeMeta[type];
                    return (
                      <option key={type} value={type}>
                        {optionMeta.title}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">What this type needs</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{meta.summary}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">3</Badge>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Grant value
            </h4>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              name="creditsTotal"
              type="number"
              label="Credits Total"
              placeholder="e.g. 5"
            />
            <Input
              name="discountPercent"
              type="number"
              label="Discount Percent"
              placeholder="e.g. 20"
            />
            <Input
              name="discountAmountCents"
              type="number"
              label="Discount Amount (cents)"
              placeholder="e.g. 5000 for €50"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Credits require a positive total. Discount grants require either a percent or a fixed amount.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">4</Badge>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Timing and metadata
            </h4>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              name="startsAt"
              type="datetime-local"
              label="Starts At"
            />
            <Input
              name="expiresAt"
              type="datetime-local"
              label="Expiry Date"
            />
            <Input
              name="planKey"
              label="Plan Key (for trials)"
              placeholder="e.g. growth"
            />
            <Input
              name="entitlementKey"
              label="Entitlement Key (custom)"
              placeholder="e.g. managed_shortlist_access"
            />
            <div className="lg:col-span-2">
              <Textarea
                name="internalNotes"
                label="Internal notes"
                placeholder="Optional notes for the ops team"
                className="min-h-[96px]"
              />
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">5</Badge>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Reason
            </h4>
          </div>

          <Textarea
            name="reason"
            label="Reason (min 10 chars)"
            required
            placeholder="Commercial reason for this grant"
            className="min-h-[110px]"
          />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset form
          </Button>
          <Button type="submit" disabled={loading} isLoading={loading}>
            Create grant
          </Button>
        </div>
      </form>
    </Card>
  );
}

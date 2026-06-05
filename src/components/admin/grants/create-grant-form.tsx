"use client";

import { useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAdminCommercialGrant } from "@/lib/monetization/admin-grants/actions";
import { GRANT_TYPES } from "@/lib/monetization/admin-grants/constants";
import { ShieldCheck } from "lucide-react";

type GrantType = (typeof GRANT_TYPES)[number];

type GrantTypeMeta = {
  label: string;
  description: string;
  requirements: string;
  badge: "success" | "warning" | "secondary" | "accent" | "info";
};

const DEFAULT_GRANT_TYPE: GrantType = GRANT_TYPES[0];

const grantTypeMeta: Record<GrantType, GrantTypeMeta> = {
  free_trial: {
    label: "Free trial",
    description: "Temporary access for onboarding, evaluation, or a negotiated trial.",
    requirements: "Requires an expiry date.",
    badge: "secondary",
  },
  plan_access: {
    label: "Temporary plan access",
    description: "Gives an employer access to a plan for a fixed period.",
    requirements: "Does not create a paid Stripe subscription.",
    badge: "secondary",
  },
  job_credit: {
    label: "Job posting credits",
    description: "Lets an employer publish jobs without checkout until the credits are used.",
    requirements: "Provide a positive credit total.",
    badge: "success",
  },
  featured_credit: {
    label: "Featured listing credits",
    description: "Lets an employer feature jobs for free while credits remain.",
    requirements: "Provide a positive credit total.",
    badge: "success",
  },
  boost_credit: {
    label: "Boost credits",
    description: "Lets an employer boost listings without checkout while credits remain.",
    requirements: "Provide a positive credit total.",
    badge: "success",
  },
  ai_screening_credit: {
    label: "AI screening credits",
    description: "Lets an employer activate paid screening support on selected jobs.",
    requirements: "Provide a positive credit total.",
    badge: "success",
  },
  percent_discount: {
    label: "Percentage discount",
    description: "Applies a percentage discount at checkout.",
    requirements: "Use a clear expiry date and only one discount value.",
    badge: "warning",
  },
  fixed_discount: {
    label: "Fixed discount",
    description: "Applies a fixed euro discount at checkout.",
    requirements: "The discount should not exceed the order total.",
    badge: "warning",
  },
  custom_entitlement: {
    label: "Custom entitlement",
    description: "Use only for manually agreed commercial arrangements.",
    requirements: "Include a clear reason.",
    badge: "accent",
  },
};

export function CreateGrantForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedGrantType, setSelectedGrantType] =
    useState<GrantType>(DEFAULT_GRANT_TYPE);

  const meta = grantTypeMeta[selectedGrantType];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

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
      setSuccess("Grant created successfully.");
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
    setSuccess(null);
  };

  return (
    <Card className="overflow-hidden border-border/70 bg-surface shadow-sm xl:sticky xl:top-6">
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/8 via-surface to-secondary/8 p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Admin only</Badge>
            <Badge variant="secondary">Commercial grants</Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Create employer grant
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Give an employer temporary access, credits, or a checkout discount without changing billing settings.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">How grants work</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Admin-only:</span> grants can only be created by authenticated admins.
              </li>
              <li>
                <span className="font-medium text-foreground">Time-limited:</span> trials and plan access require an expiry date.
              </li>
              <li>
                <span className="font-medium text-foreground">Credit-based:</span> job, featured, boost, and AI credits are consumed when used.
              </li>
              <li>
                <span className="font-medium text-foreground">Audited:</span> every grant must include a reason and can be revoked.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 p-6">
        {error && (
          <div
            className="rounded-2xl border border-error/20 bg-error/8 p-4 text-sm leading-6 text-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="rounded-2xl border border-success/20 bg-success/10 p-4 text-sm leading-6 text-success"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">1</Badge>
            <h4 className="text-sm font-semibold text-foreground">Employer</h4>
          </div>

          <div className="space-y-4">
            <Input
              name="employerId"
              id="grant-employer-id"
              label="Employer"
              required
              placeholder="Search or paste the employer ID"
              aria-describedby="grant-employer-id-help"
            />
            <p id="grant-employer-id-help" className="text-xs leading-5 text-muted-foreground">
              Search or paste the employer ID. Use the UUID from the employer record.
            </p>

            <Input
              name="productId"
              id="grant-product-id"
              label="Product or plan"
              placeholder="Optional identifier"
              aria-describedby="grant-product-id-help"
            />
            <p id="grant-product-id-help" className="text-xs leading-5 text-muted-foreground">
              Optional. Use only when the grant applies to a specific product, plan, or checkout item.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">2</Badge>
            <h4 className="text-sm font-semibold text-foreground">Grant details</h4>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Grant type</label>
              <select
                name="grantType"
                id="grant-type"
                required
                value={selectedGrantType}
                onChange={(event) =>
                  setSelectedGrantType(event.target.value as GrantType)
                }
                aria-describedby="grant-type-help"
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {GRANT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {grantTypeMeta[type].label}
                  </option>
                ))}
              </select>
              <p id="grant-type-help" className="text-xs leading-5 text-muted-foreground">
                Choose the grant type first. The requirements panel updates to show the fields that matter most.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
                <Badge variant={meta.badge}>Requirements</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">{meta.requirements}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">3</Badge>
            <h4 className="text-sm font-semibold text-foreground">Duration</h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="startsAt" type="datetime-local" label="Starts at" />
            <Input name="expiresAt" type="datetime-local" label="Expiry date" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">4</Badge>
            <h4 className="text-sm font-semibold text-foreground">Value</h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="creditsTotal"
              type="number"
              label="Credits total"
              placeholder="e.g. 5"
            />
            <Input
              name="discountPercent"
              type="number"
              label="Discount percent"
              placeholder="e.g. 20"
            />
            <Input
              name="discountAmountCents"
              type="number"
              label="Discount amount (cents)"
              placeholder="e.g. 5000"
            />
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Only use the fields that match the selected grant type. Credit grants need a positive total; discount grants need either a percent or a fixed amount.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">5</Badge>
            <h4 className="text-sm font-semibold text-foreground">Reason and notes</h4>
          </div>

          <div className="space-y-4">
            <Textarea
              name="reason"
              label="Grant reason"
              required
              placeholder="Why is this grant being issued?"
              id="grant-reason"
              aria-describedby="grant-reason-help"
              className="min-h-[110px]"
            />
            <p id="grant-reason-help" className="text-xs leading-5 text-muted-foreground">
              Keep this short, specific, and suitable for audit review.
            </p>
            <Textarea
              name="internalNotes"
              label="Internal notes"
              placeholder="Optional notes for the admin team"
              id="grant-internal-notes"
              aria-describedby="grant-internal-notes-help"
              className="min-h-[92px]"
            />
            <p id="grant-internal-notes-help" className="text-xs leading-5 text-muted-foreground">
              Internal notes are visible to admins only and should not be shared with employers.
            </p>
          </div>
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

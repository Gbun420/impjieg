"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRICING, PROMOTION_BUNDLES } from "@/lib/constants";
import { getEmployerEntitlements } from "@/lib/actions/monetization";
import { selectBestCommercialDiscount } from "@/lib/monetization/admin-grants/resolver";
import type { ResolvedEmployerCommercialEntitlements } from "@/lib/monetization/admin-grants/types";
import { LegalAcknowledgementCheckboxes } from "@/components/legal/legal-acknowledgement-checkboxes";
import { Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; listingType?: string }>;
}) {
  const params = use(searchParams);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<ResolvedEmployerCommercialEntitlements | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const jobId = params.jobId;
  const listingType = params.listingType || "standard";

  const pricing = PRICING[listingType as keyof typeof PRICING];
  const originalAmountCents = pricing.price * 100;

  useEffect(() => {
    getEmployerEntitlements().then(setEntitlements);
  }, []);

  const bestDiscount = entitlements?.discounts.length 
    ? selectBestCommercialDiscount(entitlements.discounts, originalAmountCents)
    : null;

  const finalAmountCents = bestDiscount ? bestDiscount.discountedTotalCents : originalAmountCents;
  const finalPrice = finalAmountCents / 100;
  const featuredBoostPrice = PROMOTION_BUNDLES.featuredBoost.price;

  useEffect(() => {
    if (!jobId) {
      router.replace("/employer/jobs");
    }
  }, [jobId, router]);

  async function handleCheckout(bundleType?: string) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, listingType, bundleType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create checkout session");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleMainCheckout = () => handleCheckout();
  const handleAddVisibility = () => handleCheckout("featuredBoost");

  if (!jobId) {
    return (
      <div className="mx-auto max-w-lg space-y-8 py-10">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Missing job selection
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting you back to your jobs list.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8 py-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Employer checkout
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Review your posting before payment
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirm the listing type, see any grant-driven savings, and continue when the total looks right.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <Card className="overflow-hidden border-border/70 bg-surface p-0 shadow-sm">
        <div className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(30,99,255,0.08),rgba(20,199,183,0.04))] px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            Order summary
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {pricing.label} listing · {pricing.description}
          </p>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Base price</span>
            <span className={`font-mono text-lg font-bold ${bestDiscount ? "line-through text-muted-foreground" : "text-foreground"}`}>
              €{pricing.price}
            </span>
          </div>

          {bestDiscount ? (
            <>
              <div className="flex items-center justify-between text-success">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  Applied grant
                </span>
                <span className="font-mono text-lg font-bold">
                  -€{bestDiscount.discountCents / 100}
                </span>
              </div>
              <div className="rounded-2xl border border-success/20 bg-success/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-success">
                  Savings applied
                </p>
                <p className="mt-1 text-sm leading-6 text-success/90">
                  {bestDiscount.discount?.reason}
                </p>
              </div>
            </>
          ) : null}

          <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              What you get
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A live posting on Impjieg with direct candidate applications and the visibility level you selected.
            </p>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-mono text-xl font-bold text-foreground">
                €{finalPrice}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {listingType === "standard" ? (
        <Card className="overflow-hidden border-border/70 bg-surface p-0 shadow-sm">
          <div className="border-b border-border/60 bg-muted/20 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Optional add-on
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Add visibility before you pay
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Featured Boost</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Stronger placement for one role when you need replies faster.
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-bold text-foreground">€{featuredBoostPrice}</p>
                <p className="text-xs text-muted-foreground">Optional add-on</p>
              </div>
            </div>
            <div className="mt-4">
              <Button type="button" variant="outline" className="w-full" onClick={handleAddVisibility}>
                Add Featured Boost
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <LegalAcknowledgementCheckboxes
        audience="employer"
        requireTerms
        requirePrivacyNotice
        onTermsChange={setTermsAccepted}
      />

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleMainCheckout}
        isLoading={isLoading}
        disabled={!termsAccepted}
      >
        {finalPrice === 0
          ? isLoading
            ? "Opening grant flow..."
            : "Continue free"
          : isLoading
            ? "Redirecting to Stripe..."
            : `Pay €${finalPrice}`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Secure payment powered by Stripe. All prices include VAT.
      </p>
    </div>
  );
}

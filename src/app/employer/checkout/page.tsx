"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PRICING } from "@/lib/constants";
import { getEmployerEntitlements } from "@/lib/actions/monetization";
import { selectBestCommercialDiscount } from "@/lib/monetization/admin-grants/resolver";
import type { ResolvedEmployerCommercialEntitlements } from "@/lib/monetization/admin-grants/types";
import { Tag, CheckCircle2 } from "lucide-react";

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

  useEffect(() => {
    if (!jobId) {
      router.replace("/employer/jobs");
    }
  }, [jobId, router]);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, listingType }),
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
    <div className="mx-auto max-w-lg space-y-8 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Checkout
      </h1>

      {error && (
        <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Order Summary
        </h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{pricing.label} Listing</span>
            <span className={`font-mono text-lg font-bold ${bestDiscount ? "line-through text-muted-foreground" : "text-foreground"}`}>
              €{pricing.price}
            </span>
          </div>
          
          {bestDiscount && (
            <div className="flex items-center justify-between text-success">
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                Commercial Discount
              </span>
              <span className="font-mono text-lg font-bold">
                -€{bestDiscount.discountCents / 100}
              </span>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{pricing.description}</p>
          
          {bestDiscount && (
            <div className="rounded-lg bg-success/5 p-3 flex items-start gap-2.5 border border-success/20">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-success uppercase tracking-wider">Discount Applied</p>
                <p className="text-xs text-success/80">{bestDiscount.discount?.reason}</p>
              </div>
            </div>
          )}

          <div className="border-t border-border/50 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-mono text-xl font-bold text-foreground">
                €{finalPrice}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        isLoading={isLoading}
      >
        {isLoading ? "Redirecting to Stripe..." : `Pay €${finalPrice}`}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Secure payment powered by Stripe. All prices include VAT.
      </p>
    </div>
  );
}

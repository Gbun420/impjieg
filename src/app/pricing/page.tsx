import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Post standard listings, featured listings, or purchase bulk credits and monthly subscriptions.",
};

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRICING, SUBSCRIPTION_PLANS, CREDIT_PACKS, PROMOTION_BUNDLES, SCREENING_UPSELLS } from "@/lib/constants";

const standardFeatures = [
  "30-day active listing",
  "Visible in search results",
  "Direct candidate applications",
  "Basic analytics dashboard",
  "Application pipeline management",
  "Email templates for candidates",
];

const featuredFeatures = [
  ...standardFeatures,
  "Homepage featured placement",
  "Top of search results",
  "Highlighted job card",
  "Priority candidate matching",
  "Social media promotion",
  "AI job description writer",
  "Bulk CSV upload",
  "PDF hiring reports",
];

const COMPARISON = [
  { feature: "Price per job", impjieg: "€29", keepmeposted: "€110", jobsinmalta: "€95", jobhound: "Custom" },
  { feature: "Self-serve checkout", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "Application pipeline", impjieg: true, keepmeposted: false, jobsinmalta: "Basic", jobhound: "Basic" },
  { feature: "AI job description", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "Analytics dashboard", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "PDF hiring reports", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "Bulk CSV upload", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "WhatsApp notifications", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "Email templates", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "Dark mode", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
  { feature: "Google for Jobs schema", impjieg: true, keepmeposted: false, jobsinmalta: false, jobhound: false },
];

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-success" />;
  if (value === false) return <X className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Flexible Pricing{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            For Every Hiring Need
          </span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Choose from pay-per-job, subscriptions, or custom bundles
        </p>
      </div>

      <Tabs defaultValue="pay-per-job" className="mt-12 w-full">
        <TabsList className="grid w-full grid-cols-3 border-b">
          <TabsTrigger value="pay-per-job" className="px-4 py-2 font-medium text-foreground/75 hover:text-foreground">
            Pay Per Job
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="px-4 py-2 font-medium text-foreground/75 hover:text-foreground">
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="add-ons" className="px-4 py-2 font-medium text-foreground/75 hover:text-foreground">
            Add-ons & Upsells
          </TabsTrigger>
        </TabsList>

        {/* Pay Per Job */}
        <TabsContent value="pay-per-job" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Standard */}
            <Card className="p-8">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {PRICING.standard.label}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {PRICING.standard.description}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold text-foreground">
                    €{PRICING.standard.price}
                  </span>
                  <span className="text-muted-foreground">/listing</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  vs €70-€110 on other Malta job boards
                </p>
                <Link href="/employer/post-job" className="mt-6 block">
                  <Button variant="outline" size="lg" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
              <ul className="mt-8 space-y-3">
                {standardFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Featured */}
            <Card className="relative border-primary/30 bg-gradient-to-b from-primary/5 to-transparent p-8">
              <Badge
                variant="default"
                className="absolute -top-3 left-1/2 -translate-x-1/2"
              >
                <Sparkles className="mr-1 h-3 w-3" /> Most Popular
              </Badge>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {PRICING.featured.label}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {PRICING.featured.description}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    €{PRICING.featured.price}
                  </span>
                  <span className="text-muted-foreground">/listing</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Still cheaper than a standard listing elsewhere
                </p>
                <Link href="/employer/post-job" className="mt-6 block">
                  <Button variant="primary" size="lg" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
              <ul className="mt-8 space-y-3">
                {featuredFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Credit Packs */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-foreground">Credit Packs</h2>
            <p className="mt-2 text-muted-foreground">
              Buy credits in bulk and save - perfect for occasional hiring needs
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(CREDIT_PACKS).map(([key, pack]) => (
                <Card key={key} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{pack.label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pack.credits} job credits
                      </p>
                      {pack.savings && (
                        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Save {pack.savings}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-2xl font-bold text-foreground">
                        €{pack.price}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Buy Credits
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Subscriptions */}
        <TabsContent value="subscriptions" className="mt-4 space-y-6">
          <p className="text-muted-foreground">
            Save with monthly or annual subscriptions - ideal for regular hiring
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <Card key={key} className="p-8">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">{plan.label}</h3>
                  {plan.label === "Professional" && (
                    <Badge variant="default" className="ml-2">
                      Most Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-3xl font-bold text-foreground">
                    €{plan.price}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  or €{plan.priceAnnual}/year ({Math.round((1 - plan.priceAnnual / (plan.price * 12)) * 100)}% savings)
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-3 w-3 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="primary" size="lg" className="w-full mt-6">
                  Choose Plan
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Add-ons & Upsells */}
        <TabsContent value="add-ons" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Promotion Bundles */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Promotion Bundles</h2>
              <p className="text-muted-foreground mb-4">
                Boost your job visibility with our promotion add-ons
              </p>
              <div className="space-y-4">
                {Object.entries(PROMOTION_BUNDLES).map(([key, bundle]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{bundle.label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {bundle.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-lg font-bold text-foreground">
                          €{bundle.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Screening Upsells */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Screening Services</h2>
              <p className="text-muted-foreground mb-4">
                Add professional screening services to your hiring process
              </p>
              <div className="space-y-4">
                {Object.entries(SCREENING_UPSELLS).map(([key, service]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{service.label}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-lg font-bold text-foreground">
                          €{service.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Competitive Comparison */}
      <div className="mt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            How We Compare
          </h2>
          <p className="mt-2 text-muted-foreground">
            Impjieg vs other Malta job boards
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Feature</th>
                <th className="px-4 py-3 text-center font-medium text-primary">Impjieg</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">KeepMePosted</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">JobsinMalta</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Jobhound</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} className={`border-b border-border/20 ${i % 2 === 0 ? "bg-muted/10" : ""}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.feature}</td>
                  <td className="px-4 py-3 text-center"><CheckCell value={row.impjieg} /></td>
                  <td className="px-4 py-3 text-center"><CheckCell value={row.keepmeposted} /></td>
                  <td className="px-4 py-3 text-center"><CheckCell value={row.jobsinmalta} /></td>
                  <td className="px-4 py-3 text-center"><CheckCell value={row.jobhound} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Pricing data sourced from competitor websites as of May 2026. Contact us if any information is outdated.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Ready to hire smarter?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Post your first job in under 2 minutes. No contracts, no hidden fees.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/employer/post-job">
            <Button variant="primary" size="lg">
              Post a Job — €{PRICING.standard.price}
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

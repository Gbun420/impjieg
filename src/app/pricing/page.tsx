import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for listings, credit packs, subscriptions, promotion bundles, and employer growth services.",
};

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, X, Megaphone, BrainCircuit, Target, BarChart3, ArrowRight } from "lucide-react";
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

const DECISION_GUIDE = [
  {
    title: "Occasional hiring",
    copy: "Use a standard listing for a single vacancy with a fast, no-friction checkout.",
  },
  {
    title: "Need visibility",
    copy: "Use featured when the role needs stronger placement and quicker candidate attention.",
  },
  {
    title: "Hiring repeatedly",
    copy: "Use credits or subscriptions when you want fewer checkout steps across multiple roles.",
  },
];

const PROMOTION_GUIDE = [
  {
    title: "Featured Boost",
    copy: "Better placement for one role when you need replies faster.",
    price: `€${PROMOTION_BUNDLES.featuredBoost.price}`,
    icon: Megaphone,
  },
  {
    title: "Social Promotion Bundle",
    copy: "Extend reach beyond the marketplace with social distribution.",
    price: `€${PROMOTION_BUNDLES.socialPromotion.price}`,
    icon: Megaphone,
  },
  {
    title: "Email Blast",
    copy: "Reach subscribers with a timely vacancy announcement.",
    price: `€${PROMOTION_BUNDLES.emailBlast.price}`,
    icon: Megaphone,
  },
];

const HIRING_SUPPORT_GUIDE = [
  {
    title: "Skills Assessment",
    copy: "Order from the application view when you need a technical check before shortlist.",
    price: `€${SCREENING_UPSELLS.skillsAssessment.price}`,
    icon: BrainCircuit,
  },
  {
    title: "Background Check",
    copy: "Order from the application view for final-stage hires when trust checks matter.",
    price: `€${SCREENING_UPSELLS.backgroundCheck.price}`,
    icon: BrainCircuit,
  },
  {
    title: "Reference Check",
    copy: "Order from the application view to verify experience and credibility.",
    price: `€${SCREENING_UPSELLS.referenceCheck.price}`,
    icon: BrainCircuit,
  },
];

const GROWTH_SERVICE = {
  title: "Employer Growth Sprint",
  copy: "SEO-led hiring growth for Malta employers who want more organic traffic, better employer pages, and a clearer lead funnel.",
  bullets: [
    "SEO audit and keyword map",
    "Employer and job page optimisation",
    "iGaming content cluster planning",
    "Lead capture and conversion review",
  ],
};

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-success" />;
  if (value === false) return <X className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Employer monetization
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Pricing that fits{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            how often you hire
          </span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Decide quickly between a single listing, a visibility boost, or a repeatable hiring plan.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {DECISION_GUIDE.map((item) => (
          <Card key={item.title} className="border-border/70 bg-surface p-4 shadow-sm">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pay-per-job" className="mt-12 w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl border border-border/60 bg-surface p-1 shadow-sm">
          <TabsTrigger value="pay-per-job" className="rounded-xl px-4 py-2.5 font-medium text-foreground/75 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
            Pay Per Job
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-xl px-4 py-2.5 font-medium text-foreground/75 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="add-ons" className="rounded-xl px-4 py-2.5 font-medium text-foreground/75 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
            Add-ons & Upsells
          </TabsTrigger>
        </TabsList>

        {/* Pay Per Job */}
        <TabsContent value="pay-per-job" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Standard */}
            <Card className="p-8">
              <div>
                <Badge variant="secondary">Best for occasional hiring</Badge>
                <h2 className="mt-3 text-xl font-semibold text-foreground">
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
                  Clean, direct, and priced for a single vacancy.
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
                <Badge variant="info">Best for visibility</Badge>
                <h2 className="mt-3 text-xl font-semibold text-foreground">
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
                  Stronger placement for roles that need more attention.
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
              Buy credits in bulk and keep hiring without reopening checkout each time.
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
                        <span className="mt-2 inline-flex items-center rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
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
            Save with monthly or annual subscriptions. Best for teams that hire regularly.
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
                  {plan.label === "Enterprise" && (
                    <Badge variant="secondary" className="ml-2">
                      Best for volume
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
              <h2 className="text-xl font-semibold text-foreground mb-4">Visibility add-ons</h2>
              <p className="text-muted-foreground mb-4">
                Promote a vacancy when you need more reach than the base listing gives you.
              </p>
              <div className="space-y-4">
                {PROMOTION_GUIDE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-lg font-bold text-foreground">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Hiring support */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Hiring support</h2>
              <p className="text-muted-foreground mb-4">
                Attach screening to a specific application when a role needs extra validation before you hire.
              </p>
              <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                Screening is ordered from the applications pipeline so it stays linked to the candidate record.
                <Link href="/employer/applications" className="ml-1 font-medium text-primary hover:underline">
                  Open applications
                </Link>
              </div>
              <div className="space-y-4">
                {HIRING_SUPPORT_GUIDE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-lg font-bold text-foreground">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">{GROWTH_SERVICE.title}</h2>
                  <p className="text-muted-foreground mb-4">
                    {GROWTH_SERVICE.copy}
                  </p>
                </div>
                <Badge variant="info">Custom</Badge>
              </div>
              <div className="space-y-3">
                {GROWTH_SERVICE.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Target className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{bullet}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Turn traffic into employer leads</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This is the best fit when SEO is part of your hiring and employer-brand strategy, not just a one-off campaign.
                </p>
                <Link href="/employer-growth" className="mt-4 block">
                  <Button variant="primary" className="w-full">
                    Request a growth sprint
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
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
      <div className="mt-16 rounded-[2rem] border border-primary/20 bg-[radial-gradient(circle_at_top,rgba(30,99,255,0.08),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] p-8 text-center shadow-sm">
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

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Employer pricing for one-off listings, hiring credits, subscriptions, add-ons, and growth services.",
};

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Megaphone, BrainCircuit, Target, BarChart3, ArrowRight } from "lucide-react";
import { PRICING, SUBSCRIPTION_PLANS, CREDIT_PACKS, PROMOTION_BUNDLES, SCREENING_UPSELLS } from "@/lib/constants";

const standardFeatures = [
  "30-day active listing",
  "Visible in search results",
  "Direct candidate applications",
  "Basic analytics dashboard",
  "Application pipeline management",
  "Email templates for candidates",
];

const featuredExtras = [
  "Homepage featured placement",
  "Top of search results",
  "Highlighted job card",
  "Priority candidate matching",
  "Social media promotion",
  "AI job description writer",
  "Bulk CSV upload",
  "PDF hiring reports",
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
    title: "Reference Check",
    copy: "Order from the application view to verify experience and credibility.",
    price: `€${SCREENING_UPSELLS.referenceCheck.price}`,
    icon: BrainCircuit,
  },
  {
    title: "Candidate Verification",
    copy: "Use candidate-consented verification for final-stage hiring when you need more diligence.",
    price: `€${SCREENING_UPSELLS.backgroundCheck.price}`,
    icon: BrainCircuit,
  },
];

const PRICING_PILLARS = [
  {
    title: "Salary-first listings",
    copy: "Every public listing puts compensation and work mode where candidates can see it first.",
    icon: Target,
  },
  {
    title: "Direct employer applications",
    copy: "Reduce friction by letting candidates apply straight to the hiring team.",
    icon: Megaphone,
  },
  {
    title: "Visibility when you need it",
    copy: "Promote urgent roles without hiding the base price behind a sales call.",
    icon: BarChart3,
  },
  {
    title: "Hiring support on demand",
    copy: "Add screening and verification only when the role calls for it.",
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

function SectionHeading({ eyebrow, title, copy }: { eyebrow?: string; title: string; copy?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      {copy && <p className="mt-2 text-muted-foreground">{copy}</p>}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Employer pricing
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Pricing that scales with{" "}
          <span className="text-primary">how often you hire</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Pay per listing to start. Save with credits or a plan when you hire often. No contracts, no hidden fees.
        </p>
      </header>

      {/* 1 — Post a single role: the two core listings */}
      <section className="mx-auto mt-14 max-w-4xl">
        <div className="grid gap-6 pt-3 sm:grid-cols-2">
          {/* Standard */}
          <Card className="flex flex-col p-8">
            <Badge variant="secondary" className="w-fit">Best for one-off hiring</Badge>
            <h2 className="mt-3 text-xl font-semibold text-foreground">Standard listing</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A clean 30-day listing with direct applications and search visibility.
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-foreground">€{PRICING.standard.price}</span>
              <span className="text-muted-foreground">/listing</span>
            </div>
            <ul className="mt-6 space-y-3">
              {standardFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <Check className="h-3 w-3 text-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="lg" className="mt-8 w-full">
              <Link href="/employer/post-job">Post a Standard role</Link>
            </Button>
          </Card>

          {/* Featured */}
          <Card className="relative flex flex-col border-transparent bg-accent/[0.06] p-8 ring-2 ring-accent">
            <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm">
              <Sparkles className="h-3 w-3" /> Most popular
            </span>
            <Badge variant="secondary" className="w-fit">Best for visibility</Badge>
            <h2 className="mt-3 text-xl font-semibold text-foreground">Featured listing</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A premium listing with stronger placement and faster candidate attention.
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-foreground">€{PRICING.featured.price}</span>
              <span className="text-muted-foreground">/listing</span>
            </div>
            <p className="mt-6 text-sm font-semibold text-foreground">Everything in Standard, plus:</p>
            <ul className="mt-3 space-y-3">
              {featuredExtras.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Check className="h-3 w-3 text-accent-foreground" />
                  </div>
                  <span className="text-sm text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="primary" size="lg" className="mt-8 w-full">
              <Link href="/employer/post-job">Post a Featured role</Link>
            </Button>
          </Card>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pay per listing — no subscription required. Every role runs for 30 days.
        </p>
      </section>

      {/* 2 — Hiring more than once: credits + subscriptions */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="Hiring at volume"
          title="Hiring more than once?"
          copy="Save with bulk credits for occasional roles, or a monthly plan for ongoing hiring."
        />

        {/* Credits */}
        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-lg font-semibold text-foreground">Bulk credits</h3>
            <span className="text-sm text-muted-foreground">One-off listings, discounted</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {Object.entries(CREDIT_PACKS).map(([key, pack]) => (
              <Card key={key} className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{pack.label}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{pack.credits} job credits</p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-foreground">€{pack.price}</span>
                </div>
                {pack.savings && (
                  <span className="mt-3 inline-flex w-fit items-center rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                    Save {pack.savings}
                  </span>
                )}
                <Button variant="outline" size="sm" className="mt-5 w-full">
                  Buy credits
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscriptions */}
        <div className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-lg font-semibold text-foreground">Subscriptions</h3>
            <span className="text-sm text-muted-foreground">For ongoing, regular hiring</span>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
              const isPopular = plan.label === "Professional";
              return (
                <Card
                  key={key}
                  className={`relative flex flex-col p-8 ${isPopular ? "border-transparent bg-accent/[0.06] ring-2 ring-accent" : ""}`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm">
                      <Sparkles className="h-3 w-3" /> Most popular
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{plan.label}</h4>
                    {plan.label === "Enterprise" && (
                      <Badge variant="secondary">Best for volume</Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-foreground">€{plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or €{plan.priceAnnual}/year ({Math.round((1 - plan.priceAnnual / (plan.price * 12)) * 100)}% savings)
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={isPopular ? "primary" : "outline"} size="lg" className="mt-8 w-full">
                    Choose {plan.label}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3 — Add-ons */}
      <section className="mt-24">
        <SectionHeading
          eyebrow="Optional"
          title="Boost & screen"
          copy="Add-ons for when a role needs more reach, or a candidate needs extra checks before you hire."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Visibility add-ons */}
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Visibility add-ons</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Promote a vacancy when you need more reach than the base listing gives you.
            </p>
            <div className="mt-5 space-y-3">
              {PROMOTION_GUIDE.map((item) => (
                <div key={item.title} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-foreground">{item.price}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Hiring support */}
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Hiring support</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Attach screening to a specific application when a role needs extra validation before you hire.
            </p>
            <div className="mt-5 space-y-3">
              {HIRING_SUPPORT_GUIDE.map((item) => (
                <div key={item.title} className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{item.copy}</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-foreground">{item.price}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
              Screening is ordered from the applications pipeline so it stays linked to the candidate record.
              <Link href="/employer/applications" className="ml-1 font-medium text-foreground underline underline-offset-2 hover:text-primary">
                Open applications
              </Link>
            </p>
          </Card>
        </div>
      </section>

      {/* 4 — Growth Sprint (full-width service banner) */}
      <section className="mt-8">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
            <div className="p-8">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Custom service</Badge>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-foreground">{GROWTH_SERVICE.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{GROWTH_SERVICE.copy}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {GROWTH_SERVICE.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-3 border-t border-border bg-muted/40 p-8 md:border-l md:border-t-0">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-foreground" />
                <p className="text-sm font-semibold text-foreground">Turn traffic into employer leads</p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Best when SEO is part of your hiring and employer-brand strategy, not just a one-off campaign.
              </p>
              <Button asChild variant="primary" className="mt-1 w-full">
                <Link href="/employer-growth">
                  Request a growth sprint
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Trust pillars */}
      <div className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRICING_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Card key={pillar.title} className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">{pillar.title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{pillar.copy}</p>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#272019] to-[#0C0A08] p-10 text-center shadow-[0_24px_60px_-20px_rgba(12,10,8,0.5)]">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to hire smarter?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          Post your first role in under 2 minutes. No contracts, no hidden fees.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/employer/post-job">
              Post a role — €{PRICING.standard.price}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/25 bg-white/10 text-white hover:bg-white/20">
            <Link href="/contact">
              Contact Sales
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

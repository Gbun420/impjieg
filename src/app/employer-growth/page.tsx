import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmployerGrowthForm from "@/components/employer-growth/employer-growth-form";
import {
  Search,
  TrendingUp,
  Target,
  Globe2,
  Building2,
  BarChart3,
  Megaphone,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Employer Growth Sprint",
  description:
    "SEO and hiring growth for Malta employers. Turn job demand into organic traffic, employer leads, and more qualified applicants.",
};

const growthOffers = [
  {
    title: "SEO foundation",
    copy: "Clean employer pages, search-friendly job templates, and title structures that rank.",
    icon: Search,
  },
  {
    title: "iGaming cluster",
    copy: "Build topic clusters around the roles Malta employers search for most.",
    icon: Target,
  },
  {
    title: "Lead capture",
    copy: "Turn job traffic into employer enquiries with clear conversion paths.",
    icon: Globe2,
  },
  {
    title: "Hiring visibility",
    copy: "Pair organic pages with featured listings and promotion bundles when urgency matters.",
    icon: Megaphone,
  },
];

const deliverables = [
  "Keyword map for Malta hiring demand",
  "Employer profile and company page optimisation",
  "Job page copy and internal linking improvements",
  "Sector and location landing page guidance",
  "Content cluster ideas for iGaming hiring",
  "Conversion review for employer CTAs",
];

const packageCards = [
  {
    title: "SEO Audit",
    price: "Custom",
    copy: "One-time review of the hiring funnel, employer pages, and content opportunities.",
  },
  {
    title: "Growth Sprint",
    price: "Custom",
    copy: "A focused rollout to improve job search visibility and employer lead capture.",
  },
  {
    title: "Monthly Retainer",
    price: "Custom",
    copy: "Ongoing SEO support for employers who hire frequently or need recurring traffic.",
  },
];

export default function EmployerGrowthPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(14,23,45,0.98),rgba(23,37,76,0.94)_45%,rgba(12,17,29,0.98))] p-6 text-white shadow-xl sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <Badge variant="info" className="border-white/15 bg-white/10 text-white">
              Employer growth service
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                Turn hiring search demand into employer leads.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/76 sm:text-lg">
                Use SEO, content structure, and conversion design to make Impjieg a lead engine for Malta
                employers, especially in tech, digital, and iGaming.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="#request-growth">
                <Button variant="primary" size="lg">
                  Request a growth sprint
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  View employer pricing
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Malta search focus", value: "High-intent" },
                { label: "Best fit", value: "iGaming + tech" },
                { label: "Outcome", value: "More leads" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-white/10 bg-white p-6 text-foreground shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">What this unlocks</p>
                <p className="text-sm text-muted-foreground">A revenue channel, not just a content project.</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                "Employer pages that rank for active hiring intent",
                "SEO content that brings employers to Impjieg",
                "Lead capture tied to job visibility and hiring services",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {growthOffers.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-border/60 bg-surface p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </Card>
          );
        })}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Included in the sprint
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                Practical SEO work that supports hiring conversion.
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {deliverables.map((item) => (
              <div key={item} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          {packageCards.map((item) => (
            <Card key={item.title} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                </div>
                <Badge variant="secondary">{item.price}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="request-growth" className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Why this monetizes
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            SEO creates demand. Impjieg converts it.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your partner&apos;s SEO skill set can turn Impjieg into the place employers find when they search for
            Malta hiring help. That means more inbound employer enquiries, more paid listings, and more demand for
            promotion bundles and growth retainers.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "Capture employer leads from organic search",
              "Sell visibility alongside the traffic you generate",
              "Build a defensible niche in Malta iGaming hiring",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Target className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Request a proposal
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Tell us what you want to grow.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Share the sectors, roles, or pages you want to rank. We&apos;ll reply with the most practical SEO or
            growth package.
          </p>
          <div className="mt-6">
            <EmployerGrowthForm />
          </div>
        </Card>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBenchmarksBySector, getAllBenchmarks } from "@/lib/salary/benchmarks";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Malta Salary Guide 2026 — Pay by Role & Sector",
  description:
    "Approximate 2026 salary ranges for popular jobs in Malta, by role and sector — entry, typical, and senior pay, plus estimated take-home. Illustrative, not official statistics.",
  alternates: { canonical: `${SITE.url}/salaries` },
};

function compact(n: number): string {
  return `€${Math.round(n / 1000)}k`;
}

export default function SalariesPage() {
  const groups = getBenchmarksBySector();
  const all = getAllBenchmarks();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Malta Salary Guide 2026",
    itemListElement: all.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${b.role} Salary in Malta`,
      url: `${SITE.url}/salaries/${b.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Salary guide</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Malta Salary Guide 2026
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Approximate gross salary ranges for popular roles in Malta — entry, typical, and senior pay by sector.
          Pick a role for the full breakdown and estimated take-home.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="primary" size="lg" className="gap-2">
            <Link href="/salary-calculator"><Calculator className="h-4 w-4" /> Take-home calculator</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/blog/malta-salary-guide-2026">Read the full salary guide</Link>
          </Button>
        </div>
      </header>

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.sector} aria-label={`${group.sector} salaries`}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{group.sector}</h2>
              <Link
                href={`/jobs/sector/${group.sectorSlug}`}
                className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {group.sector} jobs <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.roles.map((b) => (
                <Link
                  key={b.slug}
                  href={`/salaries/${b.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground group-hover:text-primary">{b.role}</p>
                    <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                      {compact(b.low)}–{compact(b.high)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        Figures are approximate, illustrative gross annual ranges for 2026 and vary widely by employer, experience, and
        skills — they are not official statistics. For tax and visa specifics, always check official sources such as the{" "}
        <a href="https://cfr.gov.mt" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2">
          Commissioner for Tax and Customs
        </a>.
      </p>
    </div>
  );
}

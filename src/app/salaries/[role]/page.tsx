import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Briefcase, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalaryRangeBar } from "@/components/salary/salary-range-bar";
import { getBenchmark, getRelatedBenchmarks, getAllBenchmarks } from "@/lib/salary/benchmarks";
import { calculateSalary } from "@/lib/salary/salary-calculator";
import { estimateMaltaPercentile, percentileLabel } from "@/lib/salary/percentile";
import { formatSalary } from "@/lib/utils";
import { SITE } from "@/lib/constants";

export function generateStaticParams() {
  return getAllBenchmarks().map((b) => ({ role: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> {
  const { role } = await params;
  const b = getBenchmark(role);
  if (!b) return { title: "Not Found" };

  return {
    title: `${b.role} Salary in Malta (2026) — Ranges & Take-Home`,
    description: `What does a ${b.role.toLowerCase()} earn in Malta? Approximate 2026 pay: ${formatSalary(b.low)}–${formatSalary(b.high)} gross (typically ${formatSalary(b.mid)}), plus estimated monthly take-home. Illustrative, not official statistics.`,
    alternates: { canonical: `${SITE.url}/salaries/${b.slug}` },
  };
}

export default async function RoleSalaryPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const b = getBenchmark(role);
  if (!b) notFound();

  const result = calculateSalary({ amount: b.mid, period: "annual", profile: "single" });
  const pct = estimateMaltaPercentile(b.mid);
  const related = getRelatedBenchmarks(b.slug);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the average ${b.role.toLowerCase()} salary in Malta?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `A ${b.role.toLowerCase()} in Malta typically earns around ${formatSalary(b.mid)} gross per year (2026, approximate), ranging from about ${formatSalary(b.low)} at entry level to ${formatSalary(b.high)}+ for senior roles. Figures vary by employer, experience, and skills and are not official statistics.`,
        },
      },
      {
        "@type": "Question",
        name: `How much does a ${b.role.toLowerCase()} take home after tax in Malta?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `On a typical ${formatSalary(b.mid)} gross salary, a ${b.role.toLowerCase()} in Malta takes home roughly ${formatSalary(result.netMonthly)} per month after income tax and social security (single computation, 2026 estimate), keeping about ${result.takeHomeRatio}% of gross.`,
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Salary Guide", item: `${SITE.url}/salaries` },
      { "@type": "ListItem", position: 2, name: `${b.role} Salary in Malta`, item: `${SITE.url}/salaries/${b.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/salaries" className="hover:text-foreground">Salary Guide</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{b.role}</span>
      </nav>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Salary guide · {b.sector}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {b.role} Salary in Malta
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{b.blurb}</p>
      </header>

      {/* Range */}
      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(26,22,19,0.04),0_18px_44px_-22px_rgba(26,22,19,0.18)] sm:p-8">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {b.role} pay range
        </h2>
        <SalaryRangeBar low={b.low} mid={b.mid} high={b.high} />
      </section>

      {/* Take-home + percentile */}
      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-accent/40 bg-gradient-to-b from-accent/[0.07] to-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Typical take-home</p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-foreground">
            {formatSalary(result.netMonthly)}<span className="ml-1 text-base font-semibold text-muted-foreground">/mo</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Net on a {formatSalary(b.mid)} gross salary — you keep {result.takeHomeRatio}% after tax &amp; social security.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Where it ranks</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{percentileLabel(pct)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The typical {b.role.toLowerCase()} earns more than ~{Math.round(pct)}% of Malta full-time workers.{" "}
            <span className="opacity-80">Approximate.</span>
          </p>
        </div>
      </section>

      {/* What affects pay */}
      <section className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground">What affects {b.role.toLowerCase()} pay in Malta</h2>
        <p className="mt-2 text-muted-foreground">
          Experience, employer size, and in-demand skills move pay within the range above. Employers hiring {b.role.toLowerCase()}s
          in Malta most often look for:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {b.skills.map((s) => (
            <span key={s} className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">{s}</span>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="mt-8 flex flex-wrap gap-2">
        <Button asChild variant="primary" size="lg" className="gap-2">
          <Link href={`/jobs/sector/${b.sectorSlug}`}><Briefcase className="h-4 w-4" /> Browse {b.sector} jobs</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/salary-calculator"><Calculator className="h-4 w-4" /> Calculate your take-home</Link>
        </Button>
      </section>

      {/* Related roles */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Related {b.sector} salaries</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/salaries/${r.slug}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground group-hover:text-primary">{r.role}</p>
                  <p className="mt-0.5 font-mono text-sm text-muted-foreground">{formatSalary(r.low)}–{formatSalary(r.high)}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        These figures are approximate, illustrative 2026 gross ranges and estimated take-home — not official statistics or a
        salary offer. Actual pay varies by employer, experience, and skills. Verify tax and visa specifics with official
        sources such as the{" "}
        <a href="https://cfr.gov.mt" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2">
          Commissioner for Tax and Customs
        </a>.
      </p>
    </div>
  );
}

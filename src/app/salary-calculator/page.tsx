import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SalaryCalculatorTool from "@/components/salary/salary-calculator-tool";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Malta Salary Calculator 2026 — Estimate Your Take-Home Pay",
  description:
    "Free Malta salary calculator. Estimate your monthly and annual net (take-home) pay after income tax and social security (NI). Built for Malta's job market.",
  alternates: { canonical: `${SITE.url}/salary-calculator` },
  openGraph: {
    title: "Malta Salary Calculator — Estimate Your Take-Home Pay",
    description:
      "Estimate your net take-home pay in Malta after income tax and social security.",
    url: `${SITE.url}/salary-calculator`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Malta Salary Calculator",
    description: "Estimate your net take-home pay in Malta after tax and social security.",
  },
};

const FAQS = [
  {
    q: "How is income tax calculated in Malta?",
    a: "Malta taxes personal income on a progressive scale, currently from 0% up to 35%, with separate tax bands for single, married, and parent rates. Employers usually deduct tax at source under the FSS (Final Settlement System). Always verify the current bands with the Commissioner for Tax and Customs (cfr.gov.mt).",
  },
  {
    q: "What does this calculator estimate?",
    a: "It estimates your net (take-home) pay after income tax and social security (National Insurance) contributions, based on the gross salary, pay period, and tax profile you enter. It is a guide, not formal tax advice.",
  },
  {
    q: "How much is social security (NI) in Malta?",
    a: "Both employees and employers pay weekly social security contributions that fund healthcare, pensions, and benefits. The exact amount depends on your income and contribution category — check cfr.gov.mt for current rates.",
  },
  {
    q: "Is the calculator accurate?",
    a: "It applies standard Malta income-tax and NI logic to give a close estimate, but individual circumstances (allowances, additional income, or special schemes) vary. Confirm your exact figure with an accountant or the Commissioner for Tax and Customs.",
  },
];

export default function SalaryCalculatorPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div data-testid="salary-calculator">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative overflow-hidden bg-gradient-to-b from-[#272019] to-[#0C0A08] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Malta Salary Calculator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            Estimate your monthly and annual take-home pay after Malta income tax and social security.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/salaries">
                Salary ranges by role <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full border-white/25 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
              <Link href="/jobs">Browse jobs with salary</Link>
            </Button>
          </div>
        </div>
      </section>

      <SalaryCalculatorTool />

      {/* Indexable SEO content */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">How take-home pay works in Malta</h2>
        <div className="mt-4 space-y-4 leading-7 text-muted-foreground">
          <p>
            Your <strong className="text-foreground">net (take-home) pay</strong> in Malta is your gross salary minus
            income tax and social security (National Insurance) contributions. Income tax is charged on a progressive
            scale — currently from <strong className="text-foreground">0% up to 35%</strong> — with more generous
            tax-free bands for married couples and parents. For most employees, tax and NI are deducted at source under
            the FSS system, so the figure that lands in your account is already net.
          </p>
          <p>
            This calculator gives a close estimate from the gross figure you enter. Exact deductions depend on your
            allowances and category, so treat the result as a guide and confirm specifics with the{" "}
            <a href="https://cfr.gov.mt" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-primary">
              Commissioner for Tax and Customs
            </a>{" "}
            or an accountant.
          </p>
          <p>
            Comparing offers? Every role on Impjieg shows its salary up front — {" "}
            <Link href="/jobs" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-primary">browse salary-transparent jobs in Malta</Link>, or read the{" "}
            <Link href="/blog/malta-salary-guide-2026" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-primary">Malta Salary Guide</Link>{" "}
            for typical pay by sector.
          </p>
        </div>

        <h2 className="mt-10 text-2xl font-bold tracking-tight text-foreground">Frequently asked questions</h2>
        <dl className="mt-4 space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-xl border border-border bg-card p-5">
              <dt className="font-semibold text-foreground">{f.q}</dt>
              <dd className="mt-2 text-sm leading-7 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-xs text-muted-foreground">
          Estimates only — not tax advice. Verify current rates with the Commissioner for Tax and Customs. Last updated June 2026.
        </p>
      </section>
    </div>
  );
}

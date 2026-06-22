import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import WorkPermitChecker from "@/components/visa/work-permit-checker";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Malta Work Permit Checker — Do You Need a Visa? (2026)",
  description:
    "Free interactive Malta work-permit eligibility checker. Find out if you need a permit and which route fits — Single Permit, Key Employee Initiative (KEI), Specialist Employee Initiative (SEI), or EU Blue Card. Approximate guidance, not legal advice.",
  alternates: { canonical: `${SITE.url}/work-permit-checker` },
};

const FAQS = [
  {
    q: "Do EU citizens need a work permit for Malta?",
    a: "No. EU, EEA, and Swiss citizens have the right to work in Malta without a permit. If you stay longer than three months, you register for an eResidence document with Identità — an administrative step, not a barrier.",
  },
  {
    q: "Can I apply for a Malta work permit without a job offer?",
    a: "No. The Single Permit is employment-based: you need a confirmed job offer first, and your Maltese employer submits the application on your behalf through Identità. Securing the offer comes first.",
  },
  {
    q: "What is the Key Employee Initiative (KEI)?",
    a: "The KEI is a fast-tracked Single Permit for managerial or highly technical roles, generally requiring a gross salary of at least around €45,000 plus relevant qualifications or experience. It is processed much faster than a standard application.",
  },
  {
    q: "How long does a Malta work permit take?",
    a: "A standard Single Permit can take up to around four months end-to-end (offer, advertising, documents, biometrics). The KEI fast-track can be a matter of working days. Timelines change — confirm current processing times with Identità.",
  },
];

export default function WorkPermitCheckerPage() {
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
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#1f1a12] to-[#0c0a08] py-16 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFC400]/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFC400]">Free tool</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Malta Work Permit Checker
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            Answer a few questions to see whether you need a permit to work in Malta — and which route is the most likely fit.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/jobs">Browse jobs in Malta <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full border-white/25 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
              <Link href="/blog/work-permit-malta-expats">Read the full guide</Link>
            </Button>
          </div>
        </div>
      </section>

      <WorkPermitChecker />

      {/* SEO content */}
      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">How work permits work in Malta</h2>
        <div className="mt-4 space-y-4 leading-7 text-muted-foreground">
          <p>
            Your route to working in Malta depends entirely on your nationality. <strong className="text-foreground">EU, EEA,
            and Swiss citizens</strong> can work freely and simply register their residence if they stay beyond three months.
            <strong className="text-foreground"> Non-EU (third-country) nationals</strong> need a permit — and in almost all
            cases the employer applies on their behalf, so a confirmed job offer comes first.
          </p>
          <p>
            The standard permit is the <strong className="text-foreground">Single Permit</strong>, a combined work-and-residence
            authorisation issued by Identità. For senior or specialist hires there are faster or alternative routes: the{" "}
            <strong className="text-foreground">Key Employee Initiative (KEI)</strong> for managerial and highly technical roles,
            the <strong className="text-foreground">Specialist Employee Initiative (SEI)</strong> for other skilled roles, and the{" "}
            <strong className="text-foreground">EU Blue Card</strong> for highly qualified, degree-level professionals. Each has
            its own salary threshold and processing speed.
          </p>
          <p>
            Use the checker above for a quick indication, then read the{" "}
            <Link href="/blog/work-permit-malta-expats" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-primary">
              full step-by-step work-permit guide
            </Link>{" "}
            for documents, fees, and timelines. Always confirm the current rules with{" "}
            <a href="https://identita.gov.mt" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2">Identità</a> and{" "}
            <a href="https://jobsplus.gov.mt" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2">Jobsplus</a>.
          </p>
        </div>

        <h2 className="mt-12 text-2xl font-bold tracking-tight text-foreground">Common questions</h2>
        <dl className="mt-4 space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-border/60 bg-card p-5">
              <dt className="font-medium text-foreground">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

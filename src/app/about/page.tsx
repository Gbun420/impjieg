import { SITE } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        About {SITE.name}
      </h1>

      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          {SITE.name} is Malta&apos;s modern job board, built with a simple
          mission: make job hunting transparent and efficient for everyone.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Why Salary Transparency?
        </h2>
        <p>
          Too many job listings hide salary information, wasting everyone&apos;s
          time. On {SITE.name}, every listing shows verified salary ranges so
          candidates can make informed decisions and employers attract the right
          talent.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Built for Malta
        </h2>
        <p>
          We understand the Maltese job market. From iGaming in St.
          Julian&apos;s to tech startups in Valletta, {SITE.name} connects
          Maltese employers with local and international talent. We support visa
          sponsorship listings and provide a Malta-specific salary calculator.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Fresh Listings Only
        </h2>
        <p>
          Jobs expire after 30 days. No stale listings, no ghost jobs. Every
          listing on {SITE.name} is active and real.
        </p>
      </div>
    </div>
  );
}

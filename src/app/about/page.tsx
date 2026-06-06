import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn more about Impjieg, Malta's modern jobs marketplace for tech, digital, and iGaming talent.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-[#08111F] p-8 text-white shadow-[0_26px_70px_rgba(8,17,31,0.28)] sm:p-10">
        <span className="brand-eyebrow border-white/15 bg-white/10 text-[#7AA8FF]">
          Malta marketplace
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          About {SITE.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
          Impjieg is built for Malta&apos;s tech, digital, and iGaming hiring
          market: sharper role context, clearer salary signals, and direct
          applications that keep both sides moving.
        </p>
      </div>

      <div className="prose prose-sm marketplace-panel mt-8 max-w-none rounded-[1.5rem] p-6 text-muted-foreground sm:p-8">
        <p>
          {SITE.name} is Malta&apos;s modern jobs marketplace, built with a
          simple mission: make job hunting and hiring clearer, faster, and
          easier to trust.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Why Salary Transparency?
        </h2>
        <p>
          Too many job listings hide salary information and work-mode details,
          wasting everyone&apos;s time. On {SITE.name}, listings surface the
          signals candidates need early, so employers attract better matches.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Built for Malta
        </h2>
        <p>
          We understand the Maltese job market. From iGaming in St.
          Julian&apos;s to tech startups in Valletta, {SITE.name} connects
          Maltese employers with local and international talent. We support
          visa-friendly listings and Malta-specific salary context.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Fresh Listings Only
        </h2>
        <p>
          Jobs expire after 30 days. No stale listings, no ghost jobs. Every
          visible role on {SITE.name} is active and current.
        </p>
      </div>
    </div>
  );
}

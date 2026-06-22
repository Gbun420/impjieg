import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { deriveCompanyInsights } from "@/lib/company-insights";
import { deriveEmployerProfileCompleteness } from "@/lib/employer-profile-completeness";
import { deriveEmployerTrustSignals } from "@/lib/employer-trust-signals";
import { deriveCompanyProfileDisplay } from "@/lib/company-profile-display";
import CompanyHero from "@/components/companies/company-hero";
import CompanySnapshot from "@/components/companies/company-snapshot";
import CompanyTrustPanel from "@/components/companies/company-trust-panel";
import CompanyAbout from "@/components/companies/company-about";
import CompanyHiringProcess from "@/components/companies/company-hiring-process";
import CompanyOpenRoles from "@/components/companies/company-open-roles";
import { SocialShare } from "@/components/share/social-share";
import type { Employer, JobWithEmployer } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: employer } = await supabase
    .from("employers")
    .select("name, description, logo_url, cover_image_url")
    .eq("slug", slug)
    .single();

  const emp = employer as Employer | null;

  if (!emp) {
    return { title: "Company Not Found" };
  }

  const ogImage = emp.cover_image_url || emp.logo_url || undefined;

  return {
    title: `${emp.name} - Jobs & Company Profile | Impjieg`,
    description:
      emp.description ||
      `View open roles at ${emp.name} on Impjieg, Malta's jobs marketplace.`,
    openGraph: {
      title: `${emp.name} | Impjieg`,
      description:
        emp.description ||
        `View open roles at ${emp.name} on Impjieg, Malta's jobs marketplace.`,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${emp.name} | Impjieg`,
      description:
        emp.description ||
        `View open roles at ${emp.name} on Impjieg, Malta's jobs marketplace.`,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    alternates: {
      canonical: `/companies/${slug}`,
    },
  };
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: employer } = await supabase
    .from("employers")
    .select("*")
    .eq("slug", slug)
    .single();

  const emp = employer as Employer | null;

  if (!emp) {
    notFound();
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("employer_id", emp.id)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const typedJobs = (jobs || []) as unknown as JobWithEmployer[];
  const insights = deriveCompanyInsights(typedJobs);
  const profileCompleteness = deriveEmployerProfileCompleteness(emp);

  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
  const { data: employerApplications } = await serviceSupabase
    .from("applications")
    .select("status, created_at, updated_at")
    .eq("employer_id", emp.id)
    .limit(100);

  const trustSignals = deriveEmployerTrustSignals({
    activeJobsCount: typedJobs.length,
    applications: employerApplications || [],
    expectedResponseDays: emp.response_time_days,
  });

  const display = deriveCompanyProfileDisplay({
    emp,
    insights,
    trustSignals,
    profileCompleteness,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: emp.name,
    description: emp.description || undefined,
    url: `/companies/${slug}`,
    logo: emp.logo_url || undefined,
    ...(emp.location
      ? { address: { addressLocality: emp.location } }
      : {}),
    ...(emp.website ? { sameAs: emp.website } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/companies"
            className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to companies
          </Link>
          <SocialShare
            title={`${emp.name} — hiring in Malta`}
            text={`${emp.name} is hiring in Malta. See their open roles on Impjieg:`}
            label="Share"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6">
            <CompanyHero
              emp={emp}
              activeJobsCount={typedJobs.length}
              heroCtaLabel={display.heroCtaLabel}
              heroCtaHref={display.heroCtaHref}
              heroSecondaryLabel={display.heroSecondaryLabel}
              heroSecondaryHref={display.heroSecondaryHref}
              heroTagline={display.heroTagline}
            />

            <section aria-labelledby="company-about-heading">
              <CompanyAbout emp={emp} />
            </section>

            <CompanyHiringProcess emp={emp} />

            <CompanyOpenRoles
              emp={emp}
              jobs={typedJobs}
              display={display}
            />
          </div>

          <aside
            className="space-y-4 lg:sticky lg:top-24"
            aria-label="Company information"
          >
            <CompanySnapshot
              emp={emp}
              activeRolesCount={typedJobs.length}
              latestPostingDate={insights.latestPostingDate}
            />
            <CompanyTrustPanel display={display} />
          </aside>
        </div>
      </main>
    </>
  );
}

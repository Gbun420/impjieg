import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Briefcase, Clock, Banknote, ArrowRight } from "lucide-react";
import { formatSalary, daysAgo, addDaysIso } from "@/lib/utils";
import type { JobWithEmployer } from "@/lib/supabase/types";
import { SECTORS, LOCATIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const JOBS_PER_PAGE = 20;

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function labelToSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
}

function isValidSector(sector: string): boolean {
  return SECTORS.some((s) => labelToSlug(s) === sector);
}

function isValidLocation(location: string): boolean {
  return LOCATIONS.some((l) => labelToSlug(l) === location);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sector: string; location: string }>;
}): Promise<Metadata> {
  const { sector, location } = await params;
  if (!isValidSector(sector) || !isValidLocation(location)) {
    return { title: "Not Found" };
  }
  const sectorLabel = slugToLabel(sector);
  const locationLabel = slugToLabel(location);
  const canonicalUrl = `https://impjieg.vercel.app/jobs/sector/${sector}/location/${location}`;
  const hasJobs = await checkSectorLocationHasJobs(sectorLabel, locationLabel);

  const metadata: Metadata = {
    title: `${sectorLabel} Jobs in ${locationLabel}, Malta | Impjieg`,
    description: `Browse ${sectorLabel.toLowerCase()} jobs in ${locationLabel}, Malta with salary, work-mode, employer, and freshness signals. Apply directly.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: hasJobs ? undefined : "noindex, follow",
  };

  return metadata;
}

async function checkSectorLocationHasJobs(
  sectorLabel: string,
  locationLabel: string
): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("sector", sectorLabel)
    .ilike("location", `%${locationLabel}%`)
    .gte("expires_at", new Date().toISOString());
  return (count ?? 0) > 0;
}

async function JobPostingSchema({ job }: { job: JobWithEmployer }) {
  const nonce = (await headers()).get("x-nonce");
  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description.replace(/<[^>]*>/g, ""),
    datePosted: job.created_at,
    validThrough: job.expires_at || addDaysIso(30),
    employmentType: job.job_type,
    hiringOrganization: {
      "@type": "Organization",
      name: job.employers?.name,
      sameAs: job.employers?.website || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location?.split(",")[0]?.trim() || "Malta",
        addressCountry: "MT",
      },
    },
    baseSalary: job.salary_min
      ? {
          "@type": "MonetaryAmount",
          currency: "EUR",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salary_min,
            maxValue: job.salary_max || undefined,
            unitText: "YEAR",
          },
        }
      : undefined,
    applicantLocationRequirements: job.remote_type
      ? { "@type": "Place", name: job.remote_type }
      : undefined,
    url: `https://impjieg.vercel.app/jobs/${job.employers?.slug}/${job.slug}`,
  };

  return (
    <Script
      id={`job-posting-jsonld-${job.slug}`}
      type="application/ld+json"
      nonce={nonce ?? undefined}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function SectorLocationPage({
  params,
}: {
  params: Promise<{ sector: string; location: string }>;
}) {
  const { sector, location } = await params;

  if (!isValidSector(sector) || !isValidLocation(location)) {
    notFound();
  }

  const sectorLabel = slugToLabel(sector);
  const locationLabel = slugToLabel(location);

  const supabase = await createClient();

  const query = supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("status", "active")
    .eq("sector", sectorLabel)
    .ilike("location", `%${locationLabel}%`)
    .gte("expires_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: jobs } = await query.limit(JOBS_PER_PAGE);

  // Always render the page and its SEO content, even on an empty board or a
  // query error — the guidance and internal links matter on their own.
  const typedJobs = (jobs ?? []) as unknown as JobWithEmployer[];

  const relatedSectors = SECTORS.filter((s) => labelToSlug(s) !== sector).slice(0, 6);
  const relatedLocations = LOCATIONS.filter((l) => labelToSlug(l) !== location).slice(0, 6);
  const hasJobs = typedJobs.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
        <span className="mx-2">/</span>
        <Link href={`/jobs/sector/${sector}`} className="hover:text-foreground">{sectorLabel}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{locationLabel}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {sectorLabel} Jobs in {locationLabel}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {typedJobs.length} {typedJobs.length === 1 ? "role" : "roles"} available{typedJobs.length === 0 ? " right now" : ""}. Browse {sectorLabel.toLowerCase()} opportunities across {locationLabel}, Malta.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{sectorLabel}</Badge>
          <Badge variant="secondary">{locationLabel}</Badge>
          <Badge variant="accent">Malta</Badge>
        </div>
      </header>

      <section aria-label="Job listings">
        {typedJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground">No jobs found</h2>
            <p className="mt-2 text-muted-foreground">
              No {sectorLabel.toLowerCase()} roles in {locationLabel} at the moment. Set a free alert, or explore nearby.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild variant="primary">
                <Link href="/alerts">Set a job alert</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/jobs/sector/${sector}`}>
                  View all {sectorLabel} jobs
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <ul className="space-y-4">
            {typedJobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.employers?.slug}/${job.slug}`}>
                  <Card className={`group p-5 transition-all hover:shadow-md ${
                    job.is_featured
                      ? "border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
                      : "hover:border-primary/20"
                  }`}>
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          job.is_featured
                            ? "bg-gradient-to-br from-primary/20 to-secondary/20"
                            : "bg-muted/50"
                        }`}
                        role="img"
                        aria-label={
                          job.employers?.logo_url
                            ? `${job.employers?.name} logo`
                            : `${job.employers?.name} logo placeholder`
                        }
                      >
                        {job.employers?.logo_url ? (
                          <Image
                            src={job.employers.logo_url}
                            alt={`${job.employers.name} logo`}
                            width={32}
                            height={32}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <span aria-hidden="true" className="text-lg font-bold text-muted-foreground">
                            {job.employers?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {job.is_featured && <Badge variant="default">Featured</Badge>}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {job.employers?.name}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {job.job_type}
                          </span>
                          {job.remote_type && (
                            <Badge variant="secondary" className="text-xs">{job.remote_type}</Badge>
                          )}
                          {job.salary_min && (
                            <span className="flex items-center gap-1 font-medium text-primary">
                              <Banknote className="h-3.5 w-3.5" />
                              {formatSalary(job.salary_min)}
                              {job.salary_max ? ` - ${formatSalary(job.salary_max)}` : "+"}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {daysAgo(job.created_at)}
                          </span>
                        </div>
                        {job.skills && job.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 4).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.skills.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 sm:block" />
                    </div>
                  </Card>
                </Link>
                <JobPostingSchema job={job} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {sectorLabel} Jobs in Other Locations
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {relatedLocations.map((loc) => (
              <Link
                key={loc}
                href={`/jobs/sector/${sector}/location/${labelToSlug(loc)}`}
                className="rounded-xl border border-border/50 bg-card p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {loc}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Other Sectors in {locationLabel}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {relatedSectors.map((sec) => (
              <Link
                key={sec}
                href={`/jobs/sector/${labelToSlug(sec)}/location/${location}`}
                className="rounded-xl border border-border/50 bg-card p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {sec}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground">
          About {sectorLabel} Jobs in {locationLabel}, Malta
        </h2>
        <div className="mt-4 space-y-3 text-muted-foreground">
          <p>
            {locationLabel} is a growing hub for {sectorLabel.toLowerCase()} professionals in Malta.
            Whether you&apos;re looking for entry-level positions or senior roles, the {locationLabel} area offers
            diverse opportunities across startups, established companies, and multinationals.
          </p>
          <p>
            The {sectorLabel.toLowerCase()} sector in Malta continues to expand, with competitive salaries
            and benefits. Most roles offer hybrid or remote working options, and many employers are
            visa-friendly for international candidates.
          </p>
          <p>
            Browse all available {sectorLabel.toLowerCase()} roles in {locationLabel} above, or explore
            opportunities in other Malta locations.
          </p>
        </div>
      </section>
    </div>
  );
}

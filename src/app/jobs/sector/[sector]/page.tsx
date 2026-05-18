import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Briefcase, Clock, Banknote, ArrowRight } from "lucide-react";
import { formatSalary, formatDate, daysAgo } from "@/lib/utils";
import type { JobWithEmployer } from "@/lib/supabase/types";
import { SECTORS, LOCATIONS } from "@/lib/constants";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sector: string }>;
}): Promise<Metadata> {
  const { sector } = await params;
  if (!isValidSector(sector)) {
    return { title: "Not Found" };
  }
  const sectorLabel = slugToLabel(sector);
  return {
    title: `${sectorLabel} Jobs in Malta | Impjieg`,
    description: `Browse ${sectorLabel.toLowerCase()} jobs in Malta. Find full-time, part-time, remote and hybrid roles with verified salaries. Apply directly.`,
  };
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;

  if (!isValidSector(sector)) {
    notFound();
  }

  const sectorLabel = slugToLabel(sector);

  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("status", "active")
    .eq("sector", sectorLabel)
    .gte("expires_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: jobs, error } = await query.limit(JOBS_PER_PAGE);

  if (error || !jobs) {
    return <p>Error loading jobs.</p>;
  }

  const typedJobs = jobs as unknown as JobWithEmployer[];

  const relatedSectors = SECTORS.filter((s) => labelToSlug(s) !== sector).slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/jobs" className="hover:text-foreground">Jobs</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{sectorLabel}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {sectorLabel} Jobs in Malta
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {typedJobs.length} {typedJobs.length === 1 ? "role" : "roles"} available in {sectorLabel.toLowerCase()}. Browse opportunities across Malta.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{sectorLabel}</Badge>
          <Badge variant="accent">Malta</Badge>
        </div>
      </header>

      <section aria-label="Job listings">
        {typedJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground">No jobs found</h2>
            <p className="mt-2 text-muted-foreground">
              No {sectorLabel.toLowerCase()} roles at the moment. Try another sector.
            </p>
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
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        job.is_featured
                          ? "bg-gradient-to-br from-primary/20 to-secondary/20"
                          : "bg-muted/50"
                      }`}>
                        {job.employers?.logo_url ? (
                          <img
                            src={job.employers.logo_url}
                            alt={job.employers.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
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
                      </div>
                      <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 sm:block" />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {sectorLabel} Jobs by Location
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LOCATIONS.map((loc) => (
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
            Other Sectors in Malta
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {relatedSectors.map((sec) => (
              <Link
                key={sec}
                href={`/jobs/sector/${labelToSlug(sec)}`}
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
          Working in {sectorLabel} in Malta
        </h2>
        <div className="mt-4 space-y-3 text-muted-foreground">
          <p>
            Malta&apos;s {sectorLabel.toLowerCase()} sector is one of the fastest-growing industries on the island.
            With a business-friendly environment, English as an official language, and a strategic location
            between Europe and North Africa, Malta attracts top talent and international companies alike.
          </p>
          <p>
            Salaries in {sectorLabel.toLowerCase()} are competitive, with many roles offering additional benefits
            such as remote work options, health insurance, and professional development budgets.
            Many employers are also visa-friendly, making Malta an attractive destination for international professionals.
          </p>
          <p>
            Browse all available {sectorLabel.toLowerCase()} roles above, or filter by specific locations across Malta.
          </p>
        </div>
      </section>
    </div>
  );
}

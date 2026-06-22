import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import JobCard from "@/components/jobs/job-card";
import type { JobWithEmployer } from "@/lib/supabase/types";
import { SECTORS, LOCATIONS } from "@/lib/constants";
import { getSectorContent } from "@/lib/seo/sector-content";

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
  const canonicalUrl = `https://impjieg.vercel.app/jobs/sector/${sector}`;
  const hasJobs = await checkSectorHasJobs(sectorLabel);
  const sectorContent = getSectorContent(sector);

  const metadata: Metadata = {
    title: `${sectorLabel} Jobs in Malta | Impjieg`,
    description:
      sectorContent?.intro ??
      `Browse ${sectorLabel.toLowerCase()} jobs in Malta with salary, work-mode, employer, and freshness signals. Apply directly.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: hasJobs ? undefined : "noindex, follow",
  };

  return metadata;
}

async function checkSectorHasJobs(sectorLabel: string): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("sector", sectorLabel)
    .gte("expires_at", new Date().toISOString());
  return (count ?? 0) > 0;
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

  const query = supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("status", "active")
    .eq("sector", sectorLabel)
    .gte("expires_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: jobs, error } = await query.limit(JOBS_PER_PAGE);

  if (error || !jobs) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        We couldn&apos;t load roles right now. Please refresh in a moment.
      </div>
    );
  }

  const typedJobs = jobs as unknown as JobWithEmployer[];

  const relatedSectors = SECTORS.filter((s) => labelToSlug(s) !== sector).slice(0, 8);
  const hasJobs = typedJobs.length > 0;
  const sectorContent = getSectorContent(sector);

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
          <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20">
              <Briefcase className="h-7 w-7 text-[#141210]" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">No {sectorLabel.toLowerCase()} roles just yet</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              New roles are added regularly. Set a free alert for {sectorLabel.toLowerCase()} jobs, or explore other sectors below.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button asChild variant="primary" size="lg"><Link href="/alerts">Set a job alert</Link></Button>
              <Button asChild variant="outline" size="lg"><Link href="/jobs">Browse all jobs</Link></Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {typedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
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
                className="rounded-xl border border-border/50 bg-card p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
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
                className="rounded-xl border border-border/50 bg-card p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                {sec}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-accent/30 bg-accent/[0.05] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground">
          Working in {sectorLabel} in Malta
        </h2>
        {sectorContent ? (
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p className="leading-7">{sectorContent.intro}</p>
            <div>
              <p className="text-sm font-semibold text-foreground">Common {sectorLabel.toLowerCase()} roles in Malta</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sectorContent.roles.map((role) => (
                  <span key={role} className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <p className="leading-7">
              Browse the latest {sectorLabel.toLowerCase()} roles above, filter by location across Malta, or{" "}
              <Link href="/jobs" className="font-medium text-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-primary">
                see all jobs in Malta
              </Link>
              .
            </p>
          </div>
        ) : (
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
        )}
      </section>
    </div>
  );
}

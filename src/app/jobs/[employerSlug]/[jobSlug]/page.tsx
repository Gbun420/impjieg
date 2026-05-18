import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Share2,
} from "lucide-react";
import { formatSalary, formatDate, daysAgo } from "@/lib/utils";
import type { JobWithEmployer } from "@/lib/supabase/types";
import ApplyForm from "@/components/jobs/apply-form";
import { ShareJobButton } from "@/components/jobs/share-job";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ employerSlug: string; jobSlug: string }>;
}): Promise<Metadata> {
  const { employerSlug, jobSlug } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, description, employers(name)")
    .eq("slug", jobSlug)
    .eq("status", "active")
    .single();

  if (!job) {
    return { title: "Job Not Found" };
  }

  return {
    title: `${job.title} at ${job.employers?.[0]?.name}`,
    description: job.description.substring(0, 160),
  };
}

function JobPostingSchema({ job }: { job: JobWithEmployer }) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description.replace(/<[^>]*>/g, ""),
    datePosted: job.created_at,
    validThrough: job.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    url: `https://impjieg.com/jobs/${job.employers?.slug}/${job.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ employerSlug: string; jobSlug: string }>;
}) {
  const { employerSlug, jobSlug } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location, website)")
    .eq("slug", jobSlug)
    .eq("status", "active")
    .single() as { data: JobWithEmployer | null; error: any };

  if (!job) {
    notFound();
  }

  await supabase
    .from("jobs")
    .update({ views: (job as any).views + 1 })
    .eq("id", (job as any).id);

  const j = job as unknown as JobWithEmployer;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="group mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to jobs
      </Link>

      <div className="flex items-start gap-5">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
          j.is_featured
            ? "bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-primary/10"
            : "bg-muted/50"
        }`}>
          {j.employers.logo_url ? (
            <img
              src={j.employers.logo_url}
              alt={j.employers.name}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {j.employers.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {j.title}
            </h1>
            {j.is_featured && <Badge variant="default">Featured</Badge>}
            <ShareJobButton title={j.title} />
          </div>
          <Link
            href={`/companies/${j.employers.slug}`}
            className="mt-1 text-lg text-muted-foreground hover:text-primary transition-colors"
          >
            {j.employers.name}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {j.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {j.job_type}
            </span>
            {j.remote_type && <Badge>{j.remote_type}</Badge>}
            {j.visa_friendly && <Badge variant="accent">Visa Friendly</Badge>}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {j.views} views
            </span>
          </div>
        </div>
      </div>

      {(j.salary_min || j.salary_max) && (
        <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Banknote className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">
                Verified Salary
              </span>
            </div>
            <p className="mt-3 font-mono text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {formatSalary(j.salary_min ?? 0)}
              {j.salary_max
                ? ` - ${formatSalary(j.salary_max)}`
                : "+"}
              <span className="text-base font-normal text-muted-foreground">
                /year
              </span>
            </p>
          </div>
        </Card>
      )}

      <div className="mt-10 space-y-10">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Job Description
          </h2>
          <div
            className="prose prose-sm mt-4 max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: j.description }}
          />
        </div>

        {j.skills && j.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Skills & Requirements
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {j.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {j.benefits && j.benefits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Benefits
            </h2>
            <ul className="mt-3 space-y-2">
              {j.benefits.map((benefit: string) => (
                <li
                  key={benefit}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Interested in this role?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Apply directly through Impjieg or use the employer&apos;s preferred method.
            </p>
            <div className="mt-5 space-y-4">
              <ApplyForm jobId={j.id} employerId={j.employer_id} jobTitle={j.title} />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-xs">or</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {j.application_url && (
                  <Link href={j.application_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="lg">
                      <Globe className="mr-2 h-4 w-4" />
                      Apply on Company Site
                    </Button>
                  </Link>
                )}
                {j.application_email && (
                  <Link href={`mailto:${j.application_email}`}>
                    <Button variant="outline" size="lg">
                      Email Application
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-10 border-t border-border/50 pt-6 text-sm text-muted-foreground">
        Posted {formatDate(j.created_at)} &middot; {daysAgo(j.created_at)}
      </div>

      <JobPostingSchema job={j} />
    </div>
  );
}

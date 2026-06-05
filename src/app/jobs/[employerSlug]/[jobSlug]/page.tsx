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
import { analyzeJobMatchWithAI, type AIJobMatchAnalysis } from "@/lib/ai-match.service";
import {
  MapPin,
  Briefcase,
  Banknote,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { formatSalary, formatDate, daysAgo, addDaysIso } from "@/lib/utils";
import { isJobPubliclyLive } from "@/lib/job-visibility";
import type { CandidateProfile, Database, JobWithEmployer } from "@/lib/supabase/types";
import ApplyForm from "@/components/jobs/apply-form";
import { ShareJobButton } from "@/components/jobs/share-job";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { sanitizeJobDescription, sanitizeJobDescriptionForMetadata } from "@/lib/job-description";

export const dynamic = "force-dynamic";

type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];
type JobsMutationTable = {
  update(values: JobUpdate): {
    eq(column: "id", value: string): Promise<unknown>;
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ employerSlug: string; jobSlug: string }>;
}): Promise<Metadata> {
  const { jobSlug } = await params;
  const supabase = await createClient();
  const { data: jobData } = await supabase
    .from("jobs")
    .select("title, description, employers(name)")
    .eq("slug", jobSlug)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .single();
  const job = jobData as {
    title: string;
    description: string;
    employers: Array<{ name: string }> | null;
  } | null;

  if (!job) {
    return { title: "Job Not Found" };
  }

  const employerRelation = job.employers as
    | { name?: string }
    | Array<{ name?: string }>
    | null
    | undefined;
  const employerName = Array.isArray(employerRelation)
    ? employerRelation[0]?.name
    : employerRelation?.name;

  return {
    title: employerName ? `${job.title} at ${employerName}` : job.title,
    description: sanitizeJobDescriptionForMetadata(job.description),
  };
}

async function JobPostingSchema({ job }: { job: JobWithEmployer }) {
  const nonce = (await headers()).get("x-nonce");
  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: sanitizeJobDescription(job.description),
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

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ employerSlug: string; jobSlug: string }>;
}) {
  const { jobSlug } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location, website)")
    .eq("slug", jobSlug)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .single() as { data: JobWithEmployer | null; error: unknown };

  if (!job || !isJobPubliclyLive(job)) {
    notFound();
  }

  const jobsTable = supabase.from("jobs") as unknown as JobsMutationTable;

  await jobsTable
    .update({ views: job.views + 1 })
    .eq("id", job.id);

  const j = job as unknown as JobWithEmployer;
  const safeDescription = sanitizeJobDescription(j.description);
   const {
     data: { user },
   } = await supabase.auth.getUser();
  const { data: savedJob } = user
    ? await supabase
        .from("saved_jobs")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", j.id)
        .maybeSingle()
    : { data: null };
  const isSaved = !!savedJob;
   let candidateMatch: AIJobMatchAnalysis | null = null;

   if (user) {
     const { data: profileData } = await supabase
       .from("candidate_profiles")
       .select("skills, sectors, job_types, remote_preference, desired_salary_min, experience_years")
       .eq("user_id", user.id)
       .single();

      const profile = profileData as Pick<
        CandidateProfile,
        "skills" | "sectors" | "job_types" | "remote_preference" | "desired_salary_min" | "experience_years" | "full_name" | "headline"
      > | null;

      if (profile) {
        candidateMatch = await analyzeJobMatchWithAI(j, {
          skills: profile.skills,
          sectors: profile.sectors,
          job_types: profile.job_types,
          remote_preference: profile.remote_preference,
          experience_years: profile.experience_years,
          desired_salary_min: profile.desired_salary_min,
          full_name: profile.full_name,
          headline: profile.headline,
        });
      }
   }

  const salaryText = (j.salary_min || j.salary_max)
    ? `${formatSalary(j.salary_min ?? 0)}${j.salary_max ? ` - ${formatSalary(j.salary_max)}` : "+"}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="group mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
            <div className={`h-1 w-full ${
              j.is_featured
                ? "bg-[linear-gradient(90deg,rgba(30,99,255,0.95)_0%,rgba(20,199,183,0.95)_100%)]"
                : "bg-border/60"
            }`} />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    j.is_featured
                      ? "bg-primary/10 ring-1 ring-primary/10"
                      : "bg-muted"
                  }`}
                  role="img"
                  aria-label={
                    j.employers.logo_url
                      ? `${j.employers.name} logo`
                      : `${j.employers.name} logo placeholder`
                  }
                >
                  {j.employers.logo_url ? (
                    <Image
                      src={j.employers.logo_url}
                      alt={`${j.employers.name} logo`}
                      width={36}
                      height={36}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="text-xl font-semibold text-muted-foreground">
                      {j.employers.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                          {j.title}
                        </h1>
                        {j.is_featured ? <Badge variant="default">Featured</Badge> : null}
                      </div>
                      <Link
                        href={`/companies/${j.employers.slug}`}
                        className="mt-1 text-base text-muted-foreground hover:text-primary transition-colors"
                      >
                        {j.employers.name}
                      </Link>
                    </div>
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <SaveJobButton
                        jobId={j.id}
                        saved={isSaved}
                        authenticated={!!user}
                        redirectTo={`/jobs/${j.employers.slug}/${j.slug}`}
                      />
                      <ShareJobButton title={j.title} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {j.location}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                      <Briefcase className="h-4 w-4 shrink-0" />
                      {j.job_type}
                    </span>
                    {j.remote_type ? <Badge>{j.remote_type}</Badge> : null}
                    {j.visa_friendly ? <Badge variant="accent">Visa friendly</Badge> : null}
                    <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/20 px-2.5 py-1">
                      <Eye className="h-4 w-4 shrink-0" />
                      {j.views} views
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Salary */}
          {salaryText && (
            <Card className="border-primary/20 bg-primary/[0.03]">
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Banknote className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Verified Salary Range
                  </span>
                </div>
                <p className="mt-2 font-mono text-2xl font-bold text-primary">
                  {salaryText}
                  <span className="text-base font-normal text-muted-foreground">
                    /year
                  </span>
                </p>
              </div>
            </Card>
          )}

          {candidateMatch && (
            <Card className="border-border/60 bg-card/60">
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-semibold text-foreground">Your profile match</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on your saved candidate profile
                    </p>
                  </div>
                  <Badge
                    variant={
                      candidateMatch.matchLevel === "Excellent"
                        ? "success"
                        : candidateMatch.matchLevel === "Good"
                          ? "default"
                          : candidateMatch.matchLevel === "Fair"
                            ? "warning"
                            : "secondary"
                    }
                  >
                    {candidateMatch.score}% {candidateMatch.matchLevel}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Strengths
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {candidateMatch.strengths.slice(0, 3).map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  {candidateMatch.gaps.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-xs font-medium text-warning">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Gaps to consider
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {candidateMatch.gaps.slice(0, 3).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              About the Role
            </h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {safeDescription}
            </div>
          </div>

          {/* Skills */}
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

          {/* Benefits */}
          {j.benefits && j.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Benefits
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {j.benefits.map((benefit: string) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Posted date */}
          <div className="border-t border-border pt-4 text-sm text-muted-foreground">
            Posted {formatDate(j.created_at)} &middot; {daysAgo(j.created_at)} ago
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
              <div className="border-b border-border/60 bg-muted/20 p-5">
                <h2 className="text-base font-semibold text-foreground">
                  Apply for this role
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Apply directly through Impjieg.
                </p>
              </div>
              <div className="p-5">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                  <ApplyForm jobId={j.id} employerId={j.employer_id} jobTitle={j.title} />
                </div>
                {(j.application_url || j.application_email) && (
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-3 text-xs text-muted-foreground">Or apply directly:</p>
                    <div className="flex flex-wrap gap-2">
                      {j.application_url && (
                        <Link href={j.application_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Globe className="mr-1.5 h-3.5 w-3.5" />
                            Company Site
                          </Button>
                        </Link>
                      )}
                      {j.application_email && (
                        <Link href={`mailto:${j.application_email}`}>
                          <Button variant="outline" size="sm">
                            Email
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Company card */}
            <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
              <div className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  About the Company
                </h3>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted"
                    role="img"
                    aria-label={
                      j.employers.logo_url
                        ? `${j.employers.name} logo`
                        : `${j.employers.name} logo placeholder`
                    }
                  >
                    {j.employers.logo_url ? (
                      <Image
                        src={j.employers.logo_url}
                        alt={`${j.employers.name} logo`}
                        width={24}
                        height={24}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <span aria-hidden="true" className="text-lg font-semibold text-muted-foreground">
                        {j.employers.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/companies/${j.employers.slug}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                    >
                      {j.employers.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{j.employers.location}</p>
                  </div>
                </div>
                {j.employers.website && (
                  <Link
                    href={j.employers.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-3 w-3" />
                    Visit website
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <JobPostingSchema job={j} />
    </div>
  );
}

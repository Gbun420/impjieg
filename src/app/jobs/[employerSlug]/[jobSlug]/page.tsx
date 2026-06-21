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
    .select("title, description, created_at, expires_at, employers(name, logo_url, website, slug)")
    .eq("slug", jobSlug)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .single();
  const job = jobData as {
    title: string;
    description: string;
    created_at: string;
    expires_at: string;
    employers: Array<{ name: string; logo_url: string | null; website: string | null; slug: string }> | null;
  } | null;

  if (!job) {
    return { title: "Job Not Found" };
  }

  const employerRelation = job.employers as
    | { name?: string; logo_url?: string | null; website?: string | null; slug?: string }
    | Array<{ name?: string; logo_url?: string | null; website?: string | null; slug?: string }>
    | null
    | undefined;
  const employerName = Array.isArray(employerRelation)
    ? employerRelation[0]?.name
    : employerRelation?.name;
  const employerLogo = Array.isArray(employerRelation)
    ? employerRelation[0]?.logo_url
    : employerRelation?.logo_url;
  const employerSlug = Array.isArray(employerRelation)
    ? employerRelation[0]?.slug
    : employerRelation?.slug;

  const pageTitle = employerName ? `${job.title} at ${employerName}` : job.title;
  const pageDescription = sanitizeJobDescriptionForMetadata(job.description);
  const pageUrl = employerSlug
    ? `https://impjieg.vercel.app/jobs/${employerSlug}/${jobSlug}`
    : undefined;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "article",
      url: pageUrl,
      siteName: "Impjieg",
      images: employerLogo ? [{ url: employerLogo, width: 1200, height: 630, alt: employerName || "Company logo" }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: employerLogo ? [employerLogo] : [],
    },
    other: {
      "job:posted": job.created_at || "",
      "job:expires": job.expires_at || "",
    },
  };
}

function mapEmploymentTypeToSchema(type: string | null | undefined): string {
  if (!type) return "FULL_TIME";
  const t = type.toLowerCase();
  if (t.includes("full")) return "FULL_TIME";
  if (t.includes("part")) return "PART_TIME";
  if (t.includes("contract")) return "CONTRACTOR";
  if (t.includes("temp")) return "TEMPORARY";
  if (t.includes("intern")) return "INTERN";
  if (t.includes("volunteer")) return "VOLUNTEER";
  return "OTHER";
}

async function JobPostingSchema({ job }: { job: JobWithEmployer }) {
  const nonce = (await headers()).get("x-nonce");

  const isRemote = job.remote_type && job.remote_type.toLowerCase() !== "on-site";
  const jobLocation = isRemote
    ? {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Remote",
          addressCountry: "MT",
        },
      }
    : {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location?.split(",")[0]?.trim() || "Malta",
          addressCountry: "MT",
        },
      };

  const schema = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: sanitizeJobDescription(job.description),
    datePosted: job.created_at,
    validThrough: job.expires_at || addDaysIso(30),
    employmentType: mapEmploymentTypeToSchema(job.job_type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.employers?.name,
      sameAs: job.employers?.website || undefined,
      url: job.employers?.website || undefined,
      logo: job.employers?.logo_url || undefined,
    },
    jobLocation,
    ...(isRemote && { jobLocationType: "TELECOMMUTE" }),
    applicantLocationRequirements: isRemote
      ? { "@type": "Place", name: "Malta", address: { "@type": "PostalAddress", addressCountry: "MT" } }
      : undefined,
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
    identifier: {
      "@type": "PropertyValue",
      name: "Impjieg",
      value: job.id,
    },
    directApply: true,
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        href="/jobs"
        className="group mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to jobs
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.42fr]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Header */}
          <Card className="overflow-hidden">
            <div className={`h-1 w-full ${
              j.is_featured ? "bg-primary" : "bg-border/30"
            }`} />
            <div className="p-6 sm:p-7">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Role signal
                </p>
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
                          <h1 className="text-2xl font-bold tracking-[-0.05em] text-foreground sm:text-3xl">
                          {j.title}
                        </h1>
                        {j.is_featured ? <Badge variant="accent" className="border-primary/20 bg-primary/10 text-primary">Priority role</Badge> : null}
                      </div>
                      <Link
                        href={`/companies/${j.employers.slug}`}
                        className="mt-1 text-base text-muted-foreground transition-colors hover:text-foreground"
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
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/50 px-2.5 py-1">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {j.location}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/50 px-2.5 py-1">
                      <Briefcase className="h-4 w-4 shrink-0" />
                      {j.job_type}
                    </span>
                    {j.remote_type ? <Badge>{j.remote_type}</Badge> : null}
                    {j.visa_friendly ? <Badge variant="accent">Visa friendly</Badge> : null}
                    <span className="flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/50 px-2.5 py-1">
                      <Eye className="h-4 w-4 shrink-0" />
                      {j.views} views
                    </span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </Card>

          {/* Salary */}
          {salaryText ? (
            <Card className="marketplace-panel border-primary/20">
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Banknote className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Salary signal
                  </span>
                  <Badge variant="success" className="text-xs">Salary shown</Badge>
                </div>
                <p className="mt-2 font-mono text-2xl font-bold text-primary">
                  {salaryText}
                  <span className="text-base font-normal text-muted-foreground">
                    /year
                  </span>
                </p>
              </div>
            </Card>
          ) : (
            <Card className="marketplace-panel border-border/50 bg-muted/20">
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Salary
                  </span>
                  <Badge variant="secondary" className="text-xs">Salary not disclosed</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  The employer has not included salary information for this role.
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
          <div className="marketplace-panel rounded-[1.75rem] p-6">
            <h2 className="text-lg font-semibold text-foreground">
              About the Role
            </h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {safeDescription}
            </div>
          </div>

          {/* Skills */}
          {j.skills && j.skills.length > 0 && (
            <div className="marketplace-panel rounded-[1.75rem] p-6">
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
            <div className="marketplace-panel rounded-[1.75rem] p-6">
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
            <Card className="overflow-hidden border-border/70 bg-card shadow-[0_18px_55px_rgba(11,18,32,0.08)]">
              <div className="border-b border-border/60 bg-primary/5 p-5">
                <h2 className="text-base font-semibold text-foreground">
                  Apply for this role
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send your application through the marketplace.
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
                        <Button asChild variant="outline" size="sm">
                          <Link href={j.application_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-1.5 h-3.5 w-3.5" />
                            Company Site
                          </Link>
                        </Button>
                      )}
                      {j.application_email && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`mailto:${j.application_email}`}>
                            Email
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Company card */}
            <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
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

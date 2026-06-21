import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Banknote, ShieldCheck } from "lucide-react";
import { daysAgo, formatSalary } from "@/lib/utils";
import type { JobWithEmployer } from "@/lib/supabase/types";
import { SaveJobButton } from "@/components/jobs/save-job-button";

interface JobCardProps {
  job: JobWithEmployer;
  isSaved?: boolean;
  isAuthenticated?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function JobCard({ job, isSaved = false, isAuthenticated = false }: JobCardProps) {
  const salaryText = (job.salary_min || job.salary_max)
    ? `${formatSalary(job.salary_min ?? 0)}${job.salary_max ? ` - ${formatSalary(job.salary_max)}` : "+"}`
    : null;

  const employerName = job.employers?.name || "Unknown Company";
  const initials = getInitials(employerName);

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.5rem] border p-4 transition-all duration-150 hover:-translate-y-0.5 sm:p-5 shadow-[0_1px_2px_rgba(11,27,46,0.04),0_12px_32px_-14px_rgba(11,27,46,0.10)] hover:shadow-[0_2px_4px_rgba(11,27,46,0.05),0_24px_48px_-18px_rgba(11,27,46,0.16)] ${
        job.is_featured
          ? "border-primary/30 bg-primary/[0.04]"
          : "border-border bg-card"
      }`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <Link href={`/jobs/${job.employers.slug}/${job.slug}`} className="min-w-0 flex-1">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
              job.is_featured
                ? "bg-primary/10 ring-1 ring-primary/10"
                : "bg-muted"
            }`}
              {...(job.employers.logo_url
                ? { role: "img" as const, "aria-label": `${employerName} logo` }
                : { "aria-hidden": "true" }
              )}
            >
              {job.employers.logo_url ? (
                <Image
                  src={job.employers.logo_url}
                  alt={`${employerName} logo`}
                  width={32}
                  height={32}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover"
                />
              ) : (
                <span
                  className="text-base sm:text-lg font-bold uppercase text-foreground/70"
                  aria-hidden="true"
                >
                  {initials}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {job.title}
                </h2>
                  {job.is_featured ? <Badge variant="default">Priority role</Badge> : null}
              </div>

              <p className="mt-0.5 flex items-center gap-1 text-sm text-foreground/75">
                <span className="truncate">{job.employers.name}</span>
                {job.employers.is_verified && (
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
                )}
              </p>

              {salaryText ? (
                <div className="mt-3 flex items-center gap-1.5">
                  <Banknote className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-mono text-sm font-semibold text-primary sm:text-[0.95rem]">
                    {salaryText}
                  </span>
                  <Badge variant="success" className="text-[0.65rem] px-1.5 py-0">Salary shown</Badge>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-1.5">
                  <Banknote className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <span className="text-sm text-muted-foreground">Salary not disclosed</span>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {job.location}
                </span>
                <Badge variant="secondary">{job.job_type}</Badge>
                {job.remote_type ? <Badge variant="default">{job.remote_type}</Badge> : null}
                {job.visa_friendly ? <Badge variant="accent">Visa friendly</Badge> : null}
                {job.sector ? <Badge variant="outline">{job.sector}</Badge> : null}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Posted {daysAgo(job.created_at)}
                </span>
                {job.is_featured ? <span className="font-medium text-primary">Boosted marketplace placement</span> : null}
              </div>
            </div>
          </div>
        </Link>
        <div className="shrink-0 pt-0.5">
          <SaveJobButton
            jobId={job.id}
            saved={isSaved}
            authenticated={isAuthenticated}
            redirectTo={`/jobs/${job.employers.slug}/${job.slug}`}
            compact
          />
        </div>
      </div>
    </article>
  );
}

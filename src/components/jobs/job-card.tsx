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

export default function JobCard({ job, isSaved = false, isAuthenticated = false }: JobCardProps) {
  const salaryText = (job.salary_min || job.salary_max)
    ? `${formatSalary(job.salary_min ?? 0)}${job.salary_max ? ` - ${formatSalary(job.salary_max)}` : "+"}`
    : null;

  return (
    <article
      className={`group rounded-[1.5rem] border p-4 sm:p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-hover hover:shadow-md ${
        job.is_featured
          ? "border-primary/30 bg-[linear-gradient(180deg,rgba(30,99,255,0.04),rgba(20,199,183,0.02))]"
          : "border-border bg-card hover:bg-card-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link href={`/jobs/${job.employers.slug}/${job.slug}`} className="min-w-0 flex-1">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
              job.is_featured
                ? "bg-primary/10 ring-1 ring-primary/10"
                : "bg-muted"
            }`}>
              {job.employers.logo_url ? (
                <img
                  src={job.employers.logo_url}
                  alt={job.employers.name}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-base sm:text-lg font-semibold text-muted-foreground">
                  {job.employers.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {job.title}
                </h2>
                {job.is_featured ? <Badge variant="default">Featured</Badge> : null}
              </div>

              <p className="mt-0.5 flex items-center gap-1 text-sm text-foreground/75">
                <span className="truncate">{job.employers.name}</span>
                {job.employers.is_verified && (
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
                )}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {job.location}
                </span>
                <Badge variant="secondary">{job.job_type}</Badge>
                {job.remote_type ? <Badge variant="default">{job.remote_type}</Badge> : null}
                {job.visa_friendly ? <Badge variant="accent">Visa friendly</Badge> : null}
                {salaryText ? (
                  <span className="flex items-center gap-1 font-mono font-medium text-primary">
                    <Banknote className="h-3.5 w-3.5 shrink-0" />
                    {salaryText}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {daysAgo(job.created_at)}
                </span>
                {job.is_featured ? <span className="font-medium text-primary">Priority placement</span> : null}
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

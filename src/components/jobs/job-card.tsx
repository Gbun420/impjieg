import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Banknote, ShieldCheck, BookmarkPlus } from "lucide-react";
import { daysAgo, formatSalary } from "@/lib/utils";
import type { JobWithEmployer } from "@/lib/supabase/types";

interface JobCardProps {
  job: JobWithEmployer;
}

export default function JobCard({ job }: JobCardProps) {
  const salaryText = (job.salary_min || job.salary_max)
    ? `${formatSalary(job.salary_min ?? 0)}${job.salary_max ? ` - ${formatSalary(job.salary_max)}` : "+"}`
    : null;

  return (
    <Link
      href={`/jobs/${job.employers.slug}/${job.slug}`}
      className={`group block rounded-xl border p-4 sm:p-5 transition-all duration-150 hover:border-border-hover ${
        job.is_featured
          ? "border-primary/30 bg-primary/[0.03]"
          : "border-border bg-card hover:bg-card-hover"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg transition-all ${
          job.is_featured
            ? "bg-primary/10 ring-1 ring-primary/10"
            : "bg-muted"
        }`}>
          {job.employers.logo_url ? (
            <img
              src={job.employers.logo_url}
              alt={job.employers.name}
              className="h-6 w-6 sm:h-8 sm:w-8 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-base sm:text-lg font-semibold text-muted-foreground">
              {job.employers.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {job.title}
                </h2>
                {job.is_featured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>

              <p className="mt-0.5 flex items-center gap-1 text-sm text-foreground/75">
                {job.employers.name}
                {job.employers.is_verified && (
                  <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                )}
              </p>
            </div>

            <span
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Save job"
            >
              <BookmarkPlus className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-foreground/75">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {job.location}
            </span>
            <Badge variant="secondary">{job.job_type}</Badge>
            {job.remote_type && (
              <Badge variant="default">{job.remote_type}</Badge>
            )}
            {job.visa_friendly && (
              <Badge variant="accent">Visa Friendly</Badge>
            )}
            {salaryText && (
              <span className="flex items-center gap-1 font-mono font-medium text-primary">
                <Banknote className="h-3.5 w-3.5 shrink-0" />
                {salaryText}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {daysAgo(job.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

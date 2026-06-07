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

function getAvatarColor(name: string) {
  const colors = [
    "bg-primary/10 text-primary",
    "bg-secondary/10 text-secondary",
    "bg-accent/10 text-accent",
    "bg-success/10 text-success",
    "bg-warning/10 text-warning",
    "bg-purple-500/10 text-purple-500",
    "bg-pink-500/10 text-pink-500",
    "bg-orange-500/10 text-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function JobCard({ job, isSaved = false, isAuthenticated = false }: JobCardProps) {
  const salaryText = (job.salary_min || job.salary_max)
    ? `${formatSalary(job.salary_min ?? 0)}${job.salary_max ? ` - ${formatSalary(job.salary_max)}` : "+"}`
    : null;

  const employerName = job.employers?.name || "Unknown Company";
  const initials = getInitials(employerName);
  const avatarColor = getAvatarColor(employerName);

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.5rem] border p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-border-hover hover:shadow-lg sm:p-5 ${
        job.is_featured
          ? "border-primary/30 bg-[linear-gradient(135deg,rgba(30,99,255,0.08),rgba(20,199,183,0.04)_50%,rgba(255,255,255,0.84))]"
          : "border-border/80 bg-white/82 backdrop-blur hover:bg-white"
      }`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#1E63FF,#14C7B7)] opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <Link href={`/jobs/${job.employers.slug}/${job.slug}`} className="min-w-0 flex-1">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl transition-all ${
              job.is_featured
                ? "bg-primary/10 ring-1 ring-primary/10"
                : "bg-muted"
            }`}
              role="img"
              aria-label={`${employerName} logo`}
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
                  className={`text-base sm:text-lg font-semibold uppercase ${avatarColor}`}
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
                </div>
              ) : null}

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

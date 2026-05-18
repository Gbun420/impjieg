import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Banknote } from "lucide-react";
import { daysAgo, formatSalary } from "@/lib/utils";
import type { JobWithEmployer } from "@/lib/supabase/types";

interface JobCardProps {
  job: JobWithEmployer;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.employers.slug}/${job.slug}`}
      className={`group block rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${
        job.is_featured
          ? "border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
          : "border-border/50 bg-card/50 hover:border-primary/20"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
          job.is_featured
            ? "bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-primary/10"
            : "bg-muted/50"
        }`}>
          {job.employers.logo_url ? (
            <img
              src={job.employers.logo_url}
              alt={job.employers.name}
              className="h-8 w-8 rounded-lg object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {job.employers.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {job.title}
            </h3>
            {job.is_featured && (
              <Badge variant="default">Featured</Badge>
            )}
          </div>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {job.employers.name}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <Badge variant="secondary">{job.job_type}</Badge>
            {job.remote_type && (
              <Badge variant="default">{job.remote_type}</Badge>
            )}
            {job.visa_friendly && (
              <Badge variant="accent">Visa Friendly</Badge>
            )}
            {(job.salary_min || job.salary_max) && (
              <span className="flex items-center gap-1 font-mono font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <Banknote className="h-3.5 w-3.5 text-primary" />
                {formatSalary(job.salary_min ?? 0)}
                {job.salary_max ? ` - ${formatSalary(job.salary_max)}` : "+"}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {daysAgo(job.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

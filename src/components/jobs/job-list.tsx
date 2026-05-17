import JobCard from "./job-card";
import type { JobWithEmployer } from "@/lib/supabase/types";

interface JobListProps {
  jobs: JobWithEmployer[];
}

export default function JobList({ jobs }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
        <p className="text-lg font-medium text-foreground">
          No jobs found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

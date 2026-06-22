import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import JobCard from "@/components/jobs/job-card";
import type { Employer, JobWithEmployer } from "@/lib/supabase/types";
import type { CompanyProfileDisplay } from "@/lib/company-profile-display";

type CompanyOpenRolesProps = {
  emp: Pick<Employer, "industry">;
  jobs: JobWithEmployer[];
  display: CompanyProfileDisplay;
};

export default function CompanyOpenRoles({
  emp,
  jobs,
  display,
}: CompanyOpenRolesProps) {
  return (
    <section id="open-roles" aria-labelledby="open-roles-heading">
      <div className="flex items-center gap-3">
        <h2
          id="open-roles-heading"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Open roles
        </h2>
        <Badge variant="secondary">{jobs.length}</Badge>
      </div>

      {jobs.length === 0 ? (
        <Card className="mt-5 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-semibold text-foreground">
            No open roles right now
          </h3>
          <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground">
            This employer does not currently have active jobs on Impjieg.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/candidate/alerts"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--primary)_0%,#E0A400_100%)] px-4 text-sm font-medium text-primary-foreground shadow-[0_12px_28px_rgba(255,196,0,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(255,196,0,0.28)]"
            >
              Create job alert
            </Link>
            <Link
              href={display.sectorLinkHref}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface/90 px-4 text-sm font-medium text-foreground shadow-[0_8px_20px_rgba(20,17,13,0.04)] transition-all hover:border-border-hover hover:bg-muted/60"
            >
              {display.sectorLinkLabel}
            </Link>
          </div>
        </Card>
      ) : (
        <div className="mt-5 space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}

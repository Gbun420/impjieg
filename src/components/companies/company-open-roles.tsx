import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            <Button asChild variant="default">
              <Link href="/candidate/alerts">Create job alert</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={display.sectorLinkHref}>
                {display.sectorLinkLabel}
              </Link>
            </Button>
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

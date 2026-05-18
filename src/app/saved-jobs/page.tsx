import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Clock, Banknote, BookmarkCheck, ArrowRight } from "lucide-react";
import { formatSalary, daysAgo } from "@/lib/utils";
import { unsaveJob } from "@/lib/actions/saved-jobs";

export default async function SavedJobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/saved-jobs");
  }

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("*, jobs(*, employers(id, name, slug, logo_url, location))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const jobs = (savedJobs || []) as any[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Saved Jobs
        </h1>
        <p className="mt-2 text-muted-foreground">
          {jobs.length} job{jobs.length !== 1 ? "s" : ""} saved
        </p>
      </header>

      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <BookmarkCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No saved jobs yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse jobs and click the bookmark icon to save them for later
          </p>
          <Link href="/jobs" className="mt-6 inline-block">
            <Button variant="primary">
              Browse Jobs
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map(({ jobs: job }) => (
            <Card
              key={job.id}
              className={`group p-5 transition-all hover:shadow-md ${
                job.is_featured
                  ? "border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
                  : "hover:border-primary/20"
              }`}
            >
              <Link href={`/jobs/${job.employers?.slug}/${job.slug}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    job.is_featured
                      ? "bg-gradient-to-br from-primary/20 to-secondary/20"
                      : "bg-muted/50"
                  }`}>
                    {job.employers?.logo_url ? (
                      <img
                        src={job.employers.logo_url}
                        alt={job.employers.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">
                        {job.employers?.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      {job.is_featured && <Badge variant="default">Featured</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {job.employers?.name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {job.job_type}
                      </span>
                      {job.remote_type && (
                        <Badge variant="secondary" className="text-xs">{job.remote_type}</Badge>
                      )}
                      {job.salary_min && (
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Banknote className="h-3.5 w-3.5" />
                          {formatSalary(job.salary_min)}
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

              <div className="mt-4 flex justify-end">
                <form action={async () => {
                  "use server";
                  await unsaveJob(job.id);
                }}>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

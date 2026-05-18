import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Users, Briefcase, TrendingUp, Clock, ExternalLink, Copy, Zap, Trash2, BarChart3 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/lib/supabase/types";
import { duplicateJob, boostJob, deleteJob } from "@/lib/actions/applications";

export default async function EmployerJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!employer) return null;

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", (employer as any).id)
    .order("created_at", { ascending: false });

  const typedJobs = (jobs || []) as Job[];

  const activeJobs = typedJobs.filter((j) => j.status === "active");
  const draftJobs = typedJobs.filter((j) => j.status === "draft");
  const totalViews = typedJobs.reduce((sum, j) => sum + (j.views || 0), 0);
  const totalApplications = typedJobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
  const avgApplicationRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Jobs</h1>
        <div className="flex gap-2">
          <Link href="/employer/bulk-upload">
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Bulk Upload
            </Button>
          </Link>
          <Link href="/employer/post-job">
            <Button variant="primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{activeJobs.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <Briefcase className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalViews}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalApplications}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Apply Rate</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{avgApplicationRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      {typedJobs.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center">
          <p className="text-lg font-medium text-foreground">
            No jobs posted yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Post your first job to start receiving applications
          </p>
          <Link href="/employer/post-job" className="mt-4 inline-block">
            <Button variant="primary">Post Your First Job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {typedJobs.map((job) => {
            const daysLeft = job.expires_at
              ? Math.max(0, Math.ceil((new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : 0;
            const appRate = job.views > 0 ? ((job.applications_count / job.views) * 100).toFixed(1) : "0";

            return (
              <Card
                key={job.id}
                className={`p-5 transition-all hover:shadow-sm ${
                  job.is_featured
                    ? "border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
                    : "hover:border-primary/20"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
                        {job.is_featured && <Badge variant="default">Featured</Badge>}
                        {job.status === "draft" && <Badge variant="secondary">Draft</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {job.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {job.applications_count} applications
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {appRate}% apply rate
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Link href={`/employer/jobs/${job.id}/analytics`}>
                      <Button variant="ghost" size="sm" title="View analytics">
                        <BarChart3 className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    {job.status === "active" && !job.is_featured && (
                      <form action={async () => {
                        "use server";
                        await boostJob(job.id);
                      }}>
                        <Button variant="outline" size="sm" title="Boost to Featured">
                          <Zap className="mr-1 h-3.5 w-3.5" />
                          Boost
                        </Button>
                      </form>
                    )}
                    <form action={async () => {
                      "use server";
                      await duplicateJob(job.id);
                    }}>
                      <Button variant="ghost" size="sm" title="Duplicate job">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                    <Link href={`/jobs/${job.slug.split("-").slice(0, -2).join("-")}/${job.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" title="View live">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    {job.status !== "deleted" && (
                      <form action={async () => {
                        "use server";
                        await deleteJob(job.id);
                      }}>
                        <Button variant="ghost" size="sm" title="Delete job">
                          <Trash2 className="h-3.5 w-3.5 text-error" />
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

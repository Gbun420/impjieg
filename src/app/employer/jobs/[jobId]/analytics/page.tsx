import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Users, TrendingUp, Calendar, FileText } from "lucide-react";
import { formatDate, formatSalary, daysAgo, daysSince, daysUntil } from "@/lib/utils";
import type { Job, Application, Employer } from "@/lib/supabase/types";

export default async function JobAnalyticsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/employer/jobs/${jobId}/analytics`);
  }

  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const employer = employerData as Pick<Employer, "id"> | null;

  if (!employer) {
    redirect("/employer/dashboard");
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("employer_id", (employer as Employer).id)
    .single();

  if (!job) {
    redirect("/employer/jobs?error=job-not-found");
  }

  const j = job as Job;

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  const apps = (applications || []) as Application[];

  const appRate = j.views > 0 ? ((j.applications_count / j.views) * 100).toFixed(1) : "0";
  const daysSincePosted = daysSince(j.created_at);
  const daysLeft = j.expires_at ? daysUntil(j.expires_at) : 0;
  const avgApplicationsPerDay = (j.applications_count / daysSincePosted).toFixed(1);

  const statusBreakdown = apps.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentApps = [...apps].reverse().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/employer/jobs" className="shrink-0">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{j.title}</h1>
            <p className="text-sm text-muted-foreground">Performance analytics</p>
          </div>
          {j.is_featured && <Badge variant="default">Featured</Badge>}
        </div>
        <Link href={`/employer/jobs/${jobId}/report`} className="self-start sm:self-auto">
          <Button variant="outline" size="sm">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Export Report
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{j.views}</p>
              <p className="text-xs text-muted-foreground">~{(j.views / daysSincePosted).toFixed(1)}/day</p>
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
              <p className="mt-1 text-2xl font-bold text-foreground">{j.applications_count}</p>
              <p className="text-xs text-muted-foreground">{avgApplicationsPerDay}/day avg</p>
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
              <p className="mt-1 text-2xl font-bold text-foreground">{appRate}%</p>
              <p className="text-xs text-muted-foreground">views to applications</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{daysLeft}</p>
              <p className="text-xs text-muted-foreground">of 30 day listing</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Job Details</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={j.status === "active" ? "success" : "secondary"}>{j.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sector</span>
              <span className="font-medium text-foreground">{j.sector}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium text-foreground">{j.job_type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium text-foreground">{j.location}</span>
            </div>
            {j.salary_min && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Salary</span>
                <span className="font-medium text-foreground">
                  {formatSalary(j.salary_min)}{j.salary_max ? ` - ${formatSalary(j.salary_max)}` : "+"}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Posted</span>
              <span className="font-medium text-foreground">{formatDate(j.created_at)} ({daysAgo(j.created_at)})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-medium text-foreground">{j.expires_at ? formatDate(j.expires_at) : "-"}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Application Pipeline</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      status === "shortlisted"
                        ? "success"
                        : status === "rejected"
                          ? "error"
                          : status === "reviewed"
                            ? "warning"
                            : status === "interview"
                              ? "accent"
                              : status === "hired"
                                ? "success"
                                : "secondary"
                    }
                  >
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 rounded-full bg-muted/50">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(count / apps.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-foreground">{count}</span>
                </div>
              </div>
            ))}
            {apps.length === 0 && (
              <p className="text-sm text-muted-foreground">No applications yet</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
        {recentApps.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-xl border border-border/30 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{app.candidate_name}</p>
                  <p className="text-xs text-muted-foreground">{app.candidate_email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      app.status === "shortlisted"
                        ? "success"
                        : app.status === "rejected"
                          ? "error"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {app.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{daysAgo(app.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

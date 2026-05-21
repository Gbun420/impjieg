import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Eye, Users, TrendingUp, Calendar, Briefcase, Clock } from "lucide-react";
import { formatDate, daysAgo, formatSalary } from "@/lib/utils";
import type { Job, Application } from "@/lib/supabase/types";

export default async function JobReportPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: employer } = await supabase
    .from("employers")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!employer) return null;

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("employer_id", (employer as any).id)
    .single();

  if (!job) notFound();

  const j = job as Job;

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  const apps = (applications || []) as Application[];

  const appRate = j.views > 0 ? ((j.applications_count / j.views) * 100).toFixed(1) : "0";
  const daysSincePosted = Math.max(1, Math.ceil((Date.now() - new Date(j.created_at).getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeft = j.expires_at
    ? Math.max(0, Math.ceil((new Date(j.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const avgApplicationsPerDay = (j.applications_count / daysSincePosted).toFixed(1);

  const statusBreakdown = apps.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const generatedAt = new Date().toLocaleString("en-MT", {
    timeZone: "Europe/Malta",
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between" data-print-hide>
        <Link href={`/employer/jobs/${jobId}/analytics`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Analytics
          </Button>
        </Link>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-1.5 h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      {/* Report Header */}
      <div className="mb-8 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{j.title}</h1>
            <p className="text-sm text-muted-foreground">Hiring Report • Generated {generatedAt}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Employer: {employer.name}</span>
          <span>•</span>
          <span>Job ID: {j.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border/30 p-4">
          <p className="text-xs text-muted-foreground">Total Views</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{j.views}</p>
        </div>
        <div className="rounded-xl border border-border/30 p-4">
          <p className="text-xs text-muted-foreground">Applications</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{j.applications_count}</p>
        </div>
        <div className="rounded-xl border border-border/30 p-4">
          <p className="text-xs text-muted-foreground">Apply Rate</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{appRate}%</p>
        </div>
        <div className="rounded-xl border border-border/30 p-4">
          <p className="text-xs text-muted-foreground">Days Active</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{daysSincePosted}</p>
        </div>
      </div>

      {/* Job Details */}
      <div className="mb-8 rounded-xl border border-border/30 p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Job Details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={j.status === "active" ? "success" : "secondary"}>{j.status}</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Sector</span>
            <span className="text-sm font-medium text-foreground">{j.sector}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="text-sm font-medium text-foreground">{j.job_type}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Location</span>
            <span className="text-sm font-medium text-foreground">{j.location}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Salary</span>
            <span className="text-sm font-medium text-foreground">
              {j.salary_min ? `${formatSalary(j.salary_min)}${j.salary_max ? ` - ${formatSalary(j.salary_max)}` : "+"}` : "Not specified"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Featured</span>
            <span className="text-sm font-medium text-foreground">{j.is_featured ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Posted</span>
            <span className="text-sm font-medium text-foreground">{formatDate(j.created_at)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <span className="text-sm text-muted-foreground">Expires</span>
            <span className="text-sm font-medium text-foreground">{j.expires_at ? formatDate(j.expires_at) : "-"}</span>
          </div>
        </div>
      </div>

      {/* Pipeline Breakdown */}
      <div className="mb-8 rounded-xl border border-border/30 p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Application Pipeline</h2>
        <div className="space-y-2">
          {["new", "reviewed", "shortlisted", "interview", "offered", "hired", "rejected"].map((status) => {
            const count = statusBreakdown[status] || 0;
            const percentage = apps.length > 0 ? ((count / apps.length) * 100).toFixed(0) : "0";
            return (
              <div key={status} className="flex items-center justify-between py-2">
                <span className="text-sm capitalize text-foreground">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 rounded-full bg-muted/50">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-foreground">{count}</span>
                  <span className="w-10 text-right text-xs text-muted-foreground">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applications List */}
      <div className="mb-8 rounded-xl border border-border/30 p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">All Applications ({apps.length})</h2>
        {apps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Candidate</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Email</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Applied</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.id} className="border-b border-border/20">
                    <td className="py-2 font-medium text-foreground">{app.candidate_name}</td>
                    <td className="py-2 text-muted-foreground">{app.candidate_email}</td>
                    <td className="py-2">
                      <Badge
                        variant={
                          app.status === "shortlisted" || app.status === "hired"
                            ? "success"
                            : app.status === "rejected"
                              ? "error"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground">{formatDate(app.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
        <p>Impjieg Hiring Report • {employer.name} • Generated on {generatedAt}</p>
        <p className="mt-1">impjieg.vercel.app</p>
      </div>
    </div>
  );
}

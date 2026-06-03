import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buildEmployerPromotionLinks } from "@/lib/job-promotion";
import { deriveJobQuality } from "@/lib/job-quality";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Users, Briefcase, TrendingUp, Clock, ExternalLink, Copy, Zap, Trash2, BarChart3, Mail, Globe } from "lucide-react";
import { daysUntil } from "@/lib/utils";
import type { Employer, Job } from "@/lib/supabase/types";
import { duplicateJob, boostJob, deleteJob } from "@/lib/actions/applications";

type EmployerJob = Job & { employers: { slug: string | null } | null };

export default async function EmployerJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const employer = employerData as Pick<Employer, "id"> | null;

  if (!employer) return null;

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employers(slug)")
    .eq("employer_id", (employer as Employer).id)
    .order("created_at", { ascending: false });

  const typedJobs = (jobs || []) as EmployerJob[];

  const activeJobs = typedJobs.filter((j) => j.status === "active");
  const totalViews = typedJobs.reduce((sum, j) => sum + (j.views || 0), 0);
  const totalApplications = typedJobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
  const avgApplicationRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Jobs</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/employer/bulk-upload" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Bulk Upload
            </Button>
          </Link>
          <Link href="/employer/post-job" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
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
              ? daysUntil(job.expires_at)
              : 0;
            const appRate = job.views > 0 ? ((job.applications_count / job.views) * 100).toFixed(1) : "0";
            const quality = deriveJobQuality(job);
            const promotionLinks = job.employers?.slug
              ? buildEmployerPromotionLinks({
                  baseUrl: SITE.url,
                  employerSlug: job.employers.slug,
                  jobSlug: job.slug,
                  title: job.title,
                })
              : null;

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
                        <Badge
                          variant={
                            quality.level === "high"
                              ? "success"
                              : quality.level === "medium"
                                ? "warning"
                                : "error"
                          }
                        >
                          {quality.level === "high"
                            ? "High quality"
                            : quality.level === "medium"
                              ? "Needs polish"
                              : "Needs attention"}
                        </Badge>
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
                      {quality.issues.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Improve this listing: {quality.issues.slice(0, 2).join(" ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {promotionLinks && (
                      <>
                        <Link href={promotionLinks.linkedinUrl} target="_blank">
                          <Button variant="ghost" size="sm" title="Share on LinkedIn">
                            <Globe className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={promotionLinks.emailUrl}>
                          <Button variant="ghost" size="sm" title="Share by email">
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </>
                    )}
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
                    {promotionLinks && (
                      <Link href={promotionLinks.jobUrl} target="_blank">
                        <Button variant="ghost" size="sm" title="View live">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                    {!promotionLinks && (
                      <Button variant="ghost" size="sm" title="View live">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
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

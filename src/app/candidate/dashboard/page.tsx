import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Dashboard",
  description: "Manage your job applications, saved roles, and career alerts on Impjieg.",
};

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Eye,
  TrendingUp,
  Clock,
  ArrowRight,
  FileText,
  Bell,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  Calendar,
  Star,
} from "lucide-react";
import { daysAgo, formatSalary } from "@/lib/utils";
import { applyCandidateJobFilters } from "../candidate-queries";
import type {
  CandidateAlert,
  CandidateApplication,
  CandidateProfile,
  JobWithEmployer,
} from "@/lib/supabase/types";

type CandidateApplicationWithJob = CandidateApplication & {
  jobs: { title: string; location: string; employers: { name: string } | null } | null;
};

export default async function CandidateDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/candidate/dashboard");
  }

  // Get candidate profile
  const { data: profileData } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  const profile = profileData as CandidateProfile | null;

  // Get saved jobs count
  const { count: savedCount } = await supabase
    .from("saved_jobs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get application tracking
  const { data: applications } = await supabase
    .from("candidate_applications")
    .select("*, jobs(title, location, employers(name))")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  // Get job alerts
  const { data: alertsData } = await supabase
    .from("candidate_alerts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);
  const alerts = (alertsData || []) as CandidateAlert[];

  const typedApps = (applications || []) as CandidateApplicationWithJob[];
  const statusCounts = {
    applied: typedApps.filter((a) => a.status === "applied").length,
    viewed: typedApps.filter((a) => a.status === "viewed").length,
    shortlisted: typedApps.filter((a) => a.status === "shortlisted").length,
    interview: typedApps.filter((a) => a.status === "interview").length,
    offered: typedApps.filter((a) => a.status === "offered").length,
    rejected: typedApps.filter((a) => a.status === "rejected").length,
  };

  const responseRate =
    typedApps.length > 0
      ? (
          ((typedApps.length - statusCounts.applied) / typedApps.length) *
          100
        ).toFixed(0)
      : "0";

  const recentApps = typedApps.slice(0, 5);

  // Get recommended jobs based on profile
  let recommendedJobs: JobWithEmployer[] = [];
  if (profile?.sectors && profile.sectors.length > 0) {
    const { data: jobs } = await applyCandidateJobFilters(
      supabase
      .from("jobs")
      .select("*, employers(name, slug, logo_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),
      profile
    );
    recommendedJobs = jobs || [];
  }

  const profileComplete = profile
    ? [
        profile.full_name,
        profile.headline,
        profile.bio,
        profile.skills?.length > 0,
        profile.experience_years,
      ].filter(Boolean).length
    : 0;
  const profileCompletion = Math.round((profileComplete / 5) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}` : "Job Seeker Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your applications and discover new opportunities
          </p>
        </div>
        <Button asChild variant="primary">
          <Link href="/jobs">
            <Briefcase className="mr-2 h-4 w-4" />
            Browse Jobs
          </Link>
        </Button>
      </div>

      {/* Profile Completion Banner */}
      {!profile || profileCompletion < 100 ? (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                Complete your profile
              </h3>
              <p className="text-sm text-muted-foreground">
                {profileCompletion}% complete — add more details to get better job matches
              </p>
              <div className="mt-2 h-2 w-full max-w-xs rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
            <Button asChild variant="primary" size="sm">
              <Link href="/candidate/profile">
                <FileText className="mr-1.5 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {typedApps.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saved Jobs</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {savedCount || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Star className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {responseRate}%
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Interviews</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {statusCounts.interview}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Application Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Status Breakdown */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Application Status
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/candidate/applications">
                  View All
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {[
                { label: "Applied", count: statusCounts.applied, color: "bg-blue-500", icon: FileText },
                { label: "Viewed", count: statusCounts.viewed, color: "bg-gray-500", icon: Eye },
                { label: "Shortlisted", count: statusCounts.shortlisted, color: "bg-purple-500", icon: Star },
                { label: "Interview", count: statusCounts.interview, color: "bg-amber-500", icon: Calendar },
                { label: "Offered", count: statusCounts.offered, color: "bg-green-500", icon: CheckCircle2 },
                { label: "Rejected", count: statusCounts.rejected, color: "bg-red-500", icon: XCircle },
              ].map(({ label, count, color, icon: Icon }) => (
                <Card key={label} className="p-3 text-center">
                  <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${color}/10`}>
                    <Icon className={`h-4 w-4 ${color.replace("bg-", "text-")}`} />
                  </div>
                  <p className="mt-2 text-lg font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent Applications
            </h2>

            {recentApps.length === 0 ? (
              <Card className="mt-4 p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-muted-foreground">
                  No applications yet. Start applying to jobs!
                </p>
                <Button asChild variant="primary" size="sm">
                  <Link href="/jobs" className="mt-4 inline-block">
                    Find Jobs
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="mt-4 space-y-3">
                {recentApps.map((app) => (
                  <Card key={app.id} className="p-4 transition-all hover:shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">
                            {app.jobs?.title}
                          </h3>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {app.jobs?.employers?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.jobs?.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysAgo(app.applied_at)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          app.status === "offered"
                            ? "success"
                            : app.status === "rejected"
                              ? "error"
                              : app.status === "interview"
                                ? "warning"
                                : app.status === "shortlisted"
                                  ? "default"
                                  : "secondary"
                        }
                        className="text-xs shrink-0"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommended Jobs */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                <Sparkles className="mr-1.5 inline h-4 w-4 text-primary" />
                Recommended
              </h2>
            </div>

            {recommendedJobs.length === 0 ? (
              <Card className="mt-4 p-6 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete your profile to get personalized job recommendations
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/candidate/profile" className="mt-3 inline-block">
                    Edit Profile
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="mt-4 space-y-3">
                {recommendedJobs.map((job) => (
                  <Card key={job.id} className="p-4 transition-all hover:shadow-sm">
                    <Link href={`/jobs/${job.employers?.slug}/${job.slug}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                          <span className="text-sm font-bold text-muted-foreground">
                            {job.employers?.name?.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-medium text-foreground hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {job.employers?.name}
                          </p>
                          {job.salary_min && (
                            <p className="mt-1 text-xs font-medium text-primary">
                              {formatSalary(job.salary_min)}
                              {job.salary_max ? ` - ${formatSalary(job.salary_max)}` : "+"}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href="/candidate/profile">
                  <FileText className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href="/candidate/applications">
                  <Briefcase className="mr-2 h-4 w-4" />
                  My Applications
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href="/candidate/alerts">
                  <Bell className="mr-2 h-4 w-4" />
                  Job Alerts
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href="/saved-jobs">
                  <Star className="mr-2 h-4 w-4" />
                  Saved Jobs
                </Link>
              </Button>
            </div>
          </Card>

          {/* Active Alerts */}
          {alerts && alerts.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Active Alerts</h3>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/candidate/alerts">
                    Manage
                  </Link>
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {(alerts as CandidateAlert[]).slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center gap-2 text-sm">
                    <Bell className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate text-muted-foreground">
                      {alert.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Eye,
  Star,
  Calendar,
  CheckCircle2,
  XCircle,
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { daysAgo } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { CandidateApplication } from "@/lib/supabase/types";

type CandidateApplicationWithJob = CandidateApplication & {
  jobs: {
    title: string;
    slug: string;
    location: string;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
    employers: { name: string; slug: string; logo_url: string | null } | null;
  } | null;
};

const statusConfig: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  applied: { color: "bg-blue-500", icon: FileText, label: "Applied" },
  viewed: { color: "bg-gray-500", icon: Eye, label: "Viewed" },
  shortlisted: { color: "bg-purple-500", icon: Star, label: "Shortlisted" },
  interview: { color: "bg-amber-500", icon: Calendar, label: "Interview" },
  offered: { color: "bg-green-500", icon: CheckCircle2, label: "Offered" },
  rejected: { color: "bg-red-500", icon: XCircle, label: "Rejected" },
  withdrawn: { color: "bg-gray-400", icon: XCircle, label: "Withdrawn" },
};

export default async function CandidateApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/candidate/applications");
  }

  const { data: applications } = await supabase
    .from("candidate_applications")
    .select("*, jobs(title, slug, location, job_type, salary_min, salary_max, employers(name, slug, logo_url))")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  const typedApps = (applications || []) as CandidateApplicationWithJob[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/candidate/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Applications
          </h1>
          <p className="text-sm text-muted-foreground">
            {typedApps.length} application{typedApps.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
      </div>

      {/* Status Summary */}
      {typedApps.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Object.entries(statusConfig).map(([key, { color, icon: Icon, label }]) => {
            const count = typedApps.filter((a) => a.status === key).length;
            return (
              <Card key={key} className="p-3 text-center">
                <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${color}/10`}>
                  <Icon className={`h-4 w-4 ${color.replace("bg-", "text-")}`} />
                </div>
                <p className="mt-2 text-lg font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Applications List */}
      {typedApps.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No applications yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start applying to jobs and track your progress here
          </p>
          <Link href="/jobs" className="mt-6 inline-block">
            <Button variant="primary">
              Browse Jobs
              <ExternalLink className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {typedApps.map((app) => {
            const config = statusConfig[app.status] || statusConfig.applied;
            const Icon = config.icon;
            return (
              <Card key={app.id} className="p-5 transition-all hover:shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <Link
                    href={`/jobs/${app.jobs?.employers?.slug}/${app.jobs?.slug}`}
                    className="flex-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.color}/10`}>
                        <Icon className={`h-5 w-5 ${config.color.replace("bg-", "text-")}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                          {app.jobs?.title}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {app.jobs?.employers?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {app.jobs?.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Applied {daysAgo(app.applied_at)}
                          </span>
                        </div>
                        {app.notes && (
                          <p className="mt-2 text-sm text-muted-foreground italic">
                            &quot;{app.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
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
                    >
                      {config.label}
                    </Badge>
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

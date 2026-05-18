import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Users, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/lib/supabase/types";

export default async function EmployerDashboardPage() {
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
  const totalViews = typedJobs.reduce((sum, j) => sum + (j.views || 0), 0);
  const totalApplications = typedJobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
  const avgViews = typedJobs.length > 0 ? Math.round(totalViews / typedJobs.length) : 0;

  const stats = [
    { label: "Active Jobs", value: activeJobs.length, icon: Briefcase },
    {
      label: "Total Applications",
      value: totalApplications,
      icon: Users,
    },
    { label: "Total Views", value: totalViews, icon: Eye },
    { label: "Avg Views/Job", value: avgViews, icon: Eye },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <Link href="/employer/post-job">
          <Button variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post a New Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-secondary/50" />
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Recent Jobs
        </h2>
        {!typedJobs || typedJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t posted any jobs yet.
            </p>
            <Link href="/employer/post-job" className="mt-4 inline-block">
              <Button variant="primary">Post Your First Job</Button>
            </Link>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Views</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Applications
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Posted</th>
                </tr>
              </thead>
              <tbody>
                {typedJobs.slice(0, 10).map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{job.title}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          job.status === "active" ? "success" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{job.views}</td>
                    <td className="px-4 py-3">{job.applications_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(job.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

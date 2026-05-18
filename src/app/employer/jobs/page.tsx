import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/lib/supabase/types";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
        <Link href="/employer/post-job">
          <Button variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      {typedJobs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
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
                <th className="px-4 py-3 text-left font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {typedJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{job.title}</span>
                      {job.is_featured && (
                        <Badge variant="success">Featured</Badge>
                      )}
                    </div>
                  </td>
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
                  <td className="px-4 py-3 text-muted-foreground">
                    {job.expires_at ? formatDate(job.expires_at) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Mail, Phone, FileText } from "lucide-react";
import type { Application } from "@/lib/supabase/types";

export default async function ApplicationsPage() {
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

  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(title)")
    .eq("employer_id", (employer as any).id)
    .order("created_at", { ascending: false });

  const typedApps = (applications || []) as (Application & { jobs: { title: string } | null })[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Applications</h1>

      {typedApps.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center">
          <p className="text-lg font-medium text-foreground">
            No applications yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Applications will appear here when candidates apply to your jobs
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {typedApps.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {app.candidate_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Applied for: {app.jobs?.title}
                  </p>
                </div>
                <Badge
                  variant={
                    app.status === "shortlisted"
                      ? "success"
                      : app.status === "rejected"
                        ? "error"
                        : app.status === "reviewed"
                          ? "warning"
                          : "secondary"
                  }
                >
                  {app.status}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {app.candidate_email}
                </span>
                {app.candidate_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {app.candidate_phone}
                  </span>
                )}
                {app.candidate_cv_url && (
                  <a
                    href={app.candidate_cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View CV
                  </a>
                )}
              </div>

              {app.cover_letter && (
                <div className="mt-4 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                  {app.cover_letter}
                </div>
              )}

              <div className="mt-3 text-xs text-muted-foreground">
                {formatDate(app.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

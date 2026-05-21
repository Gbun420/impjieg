import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Briefcase,
  Banknote,
  Clock,
  Bookmark,
  Building2,
  Zap,
} from "lucide-react";
import { formatSalary, daysAgo } from "@/lib/utils";

export default async function RecommendationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/candidate/recommendations");
  }

  // Get candidate profile for matching
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get saved job IDs to exclude
  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", user.id);
  const savedJobIds = (savedJobs || []).map((s: any) => s.job_id);

  // Get applied job IDs to exclude
  const { data: appliedJobs } = await supabase
    .from("candidate_applications")
    .select("job_id")
    .eq("user_id", user.id);
  const appliedJobIds = (appliedJobs || []).map((a: any) => a.job_id);
  const excludedIds = [...savedJobIds, ...appliedJobIds];

  // Build query based on profile
  let query = supabase
    .from("jobs")
    .select("*, employers(name, slug, logo_url, location)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  if (profile?.sectors && profile.sectors.length > 0) {
    query = query.overlaps("sector", profile.sectors);
  }

  if (profile?.job_types && profile.job_types.length > 0) {
    query = query.overlaps("job_type", profile.job_types);
  }

  if (profile?.remote_preference && profile.remote_preference !== "No preference") {
    query = query.eq("remote_type", profile.remote_preference);
  }

  if (profile?.desired_salary_min) {
    query = query.gte("salary_max", profile.desired_salary_min);
  }

  const { data: jobs } = await query;

  // Filter out excluded jobs
  const filteredJobs = (jobs || []).filter(
    (j: any) => !excludedIds.includes(j.id)
  );

  // Score jobs based on profile match
  const scoredJobs = filteredJobs.map((job: any) => {
    let score = 0;
    if (profile) {
      if (profile.sectors?.includes(job.sector)) score += 30;
      if (profile.job_types?.includes(job.job_type)) score += 20;
      if (profile.remote_preference === job.remote_type) score += 15;
      if (profile.skills?.length > 0 && job.skills?.length > 0) {
        const matchingSkills = profile.skills.filter((s: string) =>
          job.skills.some((js: string) => js.toLowerCase().includes(s.toLowerCase()))
        );
        score += matchingSkills.length * 5;
      }
      if (profile.desired_salary_min && job.salary_min) {
        if (job.salary_min >= profile.desired_salary_min) score += 10;
      }
      if (job.is_featured) score += 5;
    }
    return { ...job, matchScore: Math.min(score, 100) };
  });

  // Sort by match score
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Recommended Jobs
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered matches based on your profile
          </p>
        </div>
      </div>

      {!profile || (profile.sectors?.length === 0 && profile.job_types?.length === 0) ? (
        <Card className="p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Complete your profile for better matches
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your skills, preferred sectors, and job types to get personalized recommendations
          </p>
          <Link href="/candidate/profile" className="mt-6 inline-block">
            <Button variant="primary">
              Edit Profile
            </Button>
          </Link>
        </Card>
      ) : scoredJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No new recommendations
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve seen all matching jobs. Try broadening your preferences.
          </p>
          <Link href="/jobs" className="mt-6 inline-block">
            <Button variant="outline">
              Browse All Jobs
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {scoredJobs.map((job: any) => (
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
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {job.matchScore}% match
                      </Badge>
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
                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">
                        {job.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

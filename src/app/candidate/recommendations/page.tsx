import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { analyzeJobMatchWithAI, type AIJobMatchAnalysis } from "@/lib/ai-match.service";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Briefcase,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatSalary, daysAgo } from "@/lib/utils";
import { applyCandidateJobFilters } from "../candidate-queries";
import type { CandidateApplication, CandidateProfile, JobWithEmployer } from "@/lib/supabase/types";

type SavedJobRef = { job_id: string };
type AppliedJobRef = Pick<CandidateApplication, "job_id">;
type ScoredJob = JobWithEmployer & { matchScore: number; matchLevel: string; matchStrengths: string[]; matchGaps: string[] };

export default async function RecommendationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/candidate/recommendations");
  }

  // Get candidate profile for matching
  const { data: profileData } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  const profile = profileData as CandidateProfile | null;

  // Get saved job IDs to exclude
  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", user.id);
  const savedJobIds = (savedJobs || [] as SavedJobRef[]).map((s) => s.job_id);

  // Get applied job IDs to exclude
  const { data: appliedJobs } = await supabase
    .from("candidate_applications")
    .select("job_id")
    .eq("user_id", user.id);
  const appliedJobIds = (appliedJobs || [] as AppliedJobRef[]).map((a) => a.job_id);
  const excludedIds = [...savedJobIds, ...appliedJobIds];

  // Build query based on profile
  let query = supabase
    .from("jobs")
    .select("*, employers(name, slug, logo_url, location)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  query = applyCandidateJobFilters(query, profile);

  const { data: jobs } = await query;

  // Filter out excluded jobs
  const filteredJobs = ((jobs || []) as JobWithEmployer[]).filter(
    (j) => !excludedIds.includes(j.id)
  );

  // Score jobs based on profile match
    const scoredJobs: ScoredJob[] = await Promise.all(
      filteredJobs.map(async (job) => {
        if (!profile) {
          return { ...job, matchScore: 0, matchLevel: "Low", matchStrengths: [], matchGaps: [] };
        }

        const match = await analyzeJobMatchWithAI(job, {
          skills: profile.skills,
          sectors: profile.sectors,
          job_types: profile.job_types,
          remote_preference: profile.remote_preference,
          experience_years: profile.experience_years,
          desired_salary_min: profile.desired_salary_min,
          full_name: profile.full_name,
          headline: profile.headline,
        });

        return {
          ...job,
          matchScore: match.score,
          matchLevel: match.matchLevel,
          matchStrengths: match.strengths,
          matchGaps: match.gaps,
        };
      })
    );

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
          {scoredJobs.map((job) => (
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
                    {/* Match analysis */}
                    {(job.matchStrengths.length > 0 || job.matchGaps.length > 0) && (
                      <div className="mt-3 pt-3 border-t border-border/50 grid gap-2 sm:grid-cols-2">
                        {job.matchStrengths.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 text-xs font-medium text-success mb-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Why it matches
                            </div>
                            <ul className="space-y-0.5">
                              {job.matchStrengths.slice(0, 3).map((s, i) => (
                                <li key={i} className="text-xs text-muted-foreground">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {job.matchGaps.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 text-xs font-medium text-warning mb-1">
                              <AlertCircle className="h-3 w-3" />
                              Gaps to consider
                            </div>
                            <ul className="space-y-0.5">
                              {job.matchGaps.slice(0, 2).map((g, i) => (
                                <li key={i} className="text-xs text-muted-foreground">{g}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      job.matchScore >= 80 ? "bg-success/10" :
                      job.matchScore >= 60 ? "bg-primary/10" :
                      job.matchScore >= 40 ? "bg-warning/10" : "bg-muted"
                    }`}>
                      <span className={`text-sm font-bold ${
                        job.matchScore >= 80 ? "text-success" :
                        job.matchScore >= 60 ? "text-primary" :
                        job.matchScore >= 40 ? "text-warning" : "text-muted-foreground"
                      }`}>
                        {job.matchScore}%
                      </span>
                    </div>
                    <Badge variant={
                      job.matchScore >= 80 ? "success" :
                      job.matchScore >= 60 ? "default" :
                      job.matchScore >= 40 ? "warning" : "secondary"
                    } className="text-[10px]">
                      {job.matchLevel}
                    </Badge>
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

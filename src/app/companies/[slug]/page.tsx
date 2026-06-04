import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deriveCompanyInsights } from "@/lib/company-insights";
import { deriveEmployerProfileCompleteness } from "@/lib/employer-profile-completeness";
import { deriveEmployerTrustSignals } from "@/lib/employer-trust-signals";
import { formatDate, formatSalary, daysAgo } from "@/lib/utils";
import {
  MapPin,
  Globe,
  Users,
  Building2,
  ArrowLeft,
  Briefcase,
  ShieldCheck,
  Banknote,
  Sparkles,
  Clock3,
} from "lucide-react";
import JobCard from "@/components/jobs/job-card";
import type { Employer, JobWithEmployer } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: employer } = await supabase
    .from("employers")
    .select("name, description")
    .eq("slug", slug)
    .single();

  const emp = employer as Employer | null;

  if (!emp) {
    return { title: "Company Not Found" };
  }

  return {
    title: `${emp.name} - Jobs & Company Profile | Impjieg`,
    description: emp.description || `View open roles at ${emp.name} on Impjieg Malta's job board.`,
  };
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: employer } = await supabase
    .from("employers")
    .select("*")
    .eq("slug", slug)
    .single();

  const emp = employer as Employer | null;

  if (!emp) {
    notFound();
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("employer_id", emp.id)
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const typedJobs = (jobs || []) as unknown as JobWithEmployer[];
  const insights = deriveCompanyInsights(typedJobs);
  const salaryCoverage = insights.activeRoles > 0
    ? Math.round((insights.salaryTransparentRoles / insights.activeRoles) * 100)
    : 0;
  const profileCompleteness = deriveEmployerProfileCompleteness(emp);
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
  const { data: employerApplications } = await serviceSupabase
    .from("applications")
    .select("status, created_at, updated_at")
    .eq("employer_id", emp.id)
    .limit(100);
  const trustSignals = deriveEmployerTrustSignals({
    activeJobsCount: typedJobs.length,
    applications: employerApplications || [],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/companies"
        className="group mb-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to companies
      </Link>

      <Card className="overflow-hidden border-primary/20">
        {emp.cover_image_url && (
          <div className="h-40 w-full overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 sm:h-48">
            <img
              src={emp.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
              emp.cover_image_url
                ? "-mt-12 border-4 border-background bg-background shadow-lg"
                : "bg-muted/50"
            }`}>
              {emp.logo_url ? (
                <img
                  src={emp.logo_url}
                  alt={emp.name}
                  className="h-10 w-10 rounded-xl object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">
                  {emp.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {emp.name}
              </h1>
              {emp.is_verified && (
                <ShieldCheck className="h-5 w-5 text-success" />
              )}
              {emp.description && (
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {emp.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {emp.location && (
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5">
                <MapPin className="h-4 w-4" />
                {emp.location}
              </span>
            )}
            {emp.company_size && (
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5">
                <Users className="h-4 w-4" />
                {emp.company_size} employees
              </span>
            )}
            {emp.industry && (
              <span className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5">
                <Building2 className="h-4 w-4" />
                {emp.industry}
              </span>
            )}
            {emp.website && (
              <a
                href={emp.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/20 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {emp.culture_summary && (
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Team & culture</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {emp.culture_summary}
            </p>
            {emp.workplace_highlights && emp.workplace_highlights.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {emp.workplace_highlights.map((item) => (
                  <Badge key={item} variant="secondary">{item}</Badge>
                ))}
              </div>
            )}
          </Card>
        )}

        {(emp.hiring_process || emp.response_time_days) && (
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground">Hiring process</h2>
            {emp.hiring_process && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {emp.hiring_process}
              </p>
            )}
            {emp.response_time_days && (
              <p className="mt-4 text-sm text-muted-foreground">
                Expected response time:{" "}
                <span className="font-medium text-foreground">
                  {emp.response_time_days} day{emp.response_time_days === 1 ? "" : "s"}
                </span>
              </p>
            )}
          </Card>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Open roles</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{insights.activeRoles}</p>
          <p className="mt-1 text-xs text-muted-foreground">Currently hiring on Impjieg</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Salary transparency</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{salaryCoverage}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {insights.salaryTransparentRoles} of {insights.activeRoles} roles show salary ranges
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Featured hiring</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{insights.featuredRoles}</p>
          <p className="mt-1 text-xs text-muted-foreground">Roles currently boosted for visibility</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Latest posting</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {insights.latestPostingDate ? formatDate(insights.latestPostingDate) : "No active jobs"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {insights.latestPostingDate ? `${daysAgo(insights.latestPostingDate)} ago` : "No current hiring activity"}
          </p>
        </Card>
      </div>

      {(insights.topSectors.length > 0 || insights.averageSalaryMin || insights.averageSalaryMax) && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Hiring snapshot</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {insights.topSectors.map((sector) => (
                <Badge key={sector} variant="secondary">
                  {sector}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Most active sectors from this employer&apos;s current openings.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Published pay ranges</h2>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Typical advertised range across transparent roles:
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {insights.averageSalaryMin
                ? `${formatSalary(insights.averageSalaryMin)}${insights.averageSalaryMax ? ` - ${formatSalary(insights.averageSalaryMax)}` : "+"}`
                : "Not enough salary data yet"}
            </p>
          </Card>
        </div>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            {emp.is_verified ? (
              <ShieldCheck className="h-5 w-5 text-success" />
            ) : (
              <Clock3 className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Candidate trust signals
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                {emp.is_verified
                  ? "Verified employer badge is active on this company and its listings."
                  : "Employer identity is not yet verified on Impjieg."}
              </li>
              <li>
                {salaryCoverage > 0
                  ? `${salaryCoverage}% of active roles publish salary information.`
                  : "No active roles currently publish salary information."}
              </li>
              <li>
                {insights.latestPostingDate
                  ? `The most recent active role was posted ${daysAgo(insights.latestPostingDate)} ago.`
                  : "No current open roles are listed on Impjieg."}
              </li>
              <li>
                Employer profile completeness: {profileCompleteness.score}/100.
              </li>
              <li>
                Response signal: {trustSignals.responseBadge}
                {trustSignals.averageResponseHours !== null
                  ? ` (avg. first response ${trustSignals.averageResponseHours}h)`
                  : ""}
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Open Roles
          </h2>
          <Badge variant="secondary">{typedJobs.length}</Badge>
        </div>
        {typedJobs.length === 0 ? (
          <Card className="mt-5 p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">
              No open roles at this company right now.
            </p>
          </Card>
        ) : (
          <div className="mt-5 space-y-3">
            {typedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

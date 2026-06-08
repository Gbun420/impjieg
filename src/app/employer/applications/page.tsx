import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import ApplicationPipeline from "@/components/jobs/application-pipeline";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Application, CandidateProfile, Database, Employer } from "@/lib/supabase/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Applications",
  description: "Review and manage candidate applications for your job listings on Impjieg.",
};
import { normalizeApplicationScorecardData } from "@/lib/application-scorecard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CandidateApplicationRef = {
  application_id: string | null;
  user_id: string;
};

type CandidateProfileRef = Pick<
  CandidateProfile,
  "user_id" | "full_name" | "headline" | "skills" | "experience_years" | "sectors" | "job_types" | "remote_preference" | "desired_salary_min"
>;

type ScreeningServiceRef = {
  application_id: string;
  service_type: "backgroundCheck" | "skillsAssessment" | "referenceCheck";
  status: "pending" | "completed" | "failed";
  purchased_at: string;
  completed_at: string | null;
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/employer/dashboard");
  }

  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const employer = employerData as Pick<Employer, "id"> | null;

  if (!employer) {
    redirect("/auth/signup");
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(title, skills, sector, job_type, remote_type, seniority), recruiter_notes, scorecard_data")
    .eq("employer_id", (employer as Employer).id)
    .order("created_at", { ascending: false });

  const typedApps = (applications || []) as (Application & {
    jobs: {
      title: string;
      skills: string[];
      sector: string;
      job_type: string;
      remote_type: string | null;
      seniority: string | null;
    } | null;
  })[];

  let enrichedApps = typedApps.map((app) => ({
    ...app,
    candidateProfile: null as CandidateProfileRef | null,
    matchSummary: normalizeApplicationScorecardData(app.scorecard_data),
    recruiterNotes: app.recruiter_notes,
    scorecardData: app.scorecard_data,
    screeningServices: [] as ScreeningServiceRef[],
  }));

  const applicationIds = typedApps.map((app) => app.id);

  if (applicationIds.length > 0) {
    const serviceSupabase = createServiceClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    const { data: candidateApplications } = await serviceSupabase
      .from("candidate_applications")
      .select("application_id, user_id")
      .in("application_id", applicationIds);

    const applicationMap = new Map(
      ((candidateApplications || []) as CandidateApplicationRef[])
        .filter((record) => record.application_id)
        .map((record) => [record.application_id as string, record.user_id])
    );

    const userIds = [...new Set(applicationMap.values())];

    const { data: screeningServices } = await serviceSupabase
      .from("screening_services")
      .select("application_id, service_type, status, purchased_at, completed_at")
      .in("application_id", applicationIds);

    const screeningServiceMap = new Map<string, ScreeningServiceRef[]>();
    for (const service of (screeningServices || []) as ScreeningServiceRef[]) {
      const servicesForApplication = screeningServiceMap.get(service.application_id) ?? [];
      servicesForApplication.push(service);
      screeningServiceMap.set(service.application_id, servicesForApplication);
    }

    if (userIds.length > 0) {
      const { data: candidateProfiles } = await serviceSupabase
        .from("candidate_profiles")
        .select("user_id, full_name, headline, skills, experience_years, sectors, job_types, remote_preference, desired_salary_min")
        .in("user_id", userIds);

      const profileMap = new Map(
        ((candidateProfiles || []) as CandidateProfileRef[]).map((profile) => [profile.user_id, profile])
      );

      enrichedApps = typedApps.map((app) => {
        const userId = applicationMap.get(app.id);
        const candidateProfile = userId ? profileMap.get(userId) || null : null;

        return {
          ...app,
          candidateProfile,
          matchSummary: normalizeApplicationScorecardData(app.scorecard_data),
          recruiterNotes: app.recruiter_notes,
          scorecardData: app.scorecard_data,
          screeningServices: screeningServiceMap.get(app.id) ?? [],
        };
      });
    } else {
      enrichedApps = typedApps.map((app) => ({
        ...app,
        candidateProfile: null,
        matchSummary: normalizeApplicationScorecardData(app.scorecard_data),
        recruiterNotes: app.recruiter_notes,
        scorecardData: app.scorecard_data,
        screeningServices: screeningServiceMap.get(app.id) ?? [],
      }));
    }
  } else {
    enrichedApps = typedApps.map((app) => ({
      ...app,
      candidateProfile: null,
      matchSummary: normalizeApplicationScorecardData(app.scorecard_data),
      recruiterNotes: app.recruiter_notes,
      scorecardData: app.scorecard_data,
      screeningServices: [],
    }));
  }

  return <ApplicationPipeline applications={enrichedApps} />;
}

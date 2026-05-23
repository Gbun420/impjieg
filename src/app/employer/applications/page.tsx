import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import ApplicationPipeline from "@/components/jobs/application-pipeline";
import { scoreCandidateJobMatch } from "@/lib/candidate-job-match";
import type { Application, CandidateProfile, Database, Employer, Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type CandidateApplicationRef = {
  application_id: string | null;
  user_id: string;
};

type CandidateProfileRef = Pick<
  CandidateProfile,
  "user_id" | "headline" | "skills" | "experience_years" | "sectors" | "job_types" | "remote_preference" | "desired_salary_min"
>;

export default async function ApplicationsPage() {
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
     matchSummary: null as ReturnType<typeof scoreCandidateJobMatch> | null,
     recruiterNotes: null as string | null,
     scorecardData: null as Json | null,
   }));

  const applicationIds = typedApps.map((app) => app.id);

  if (applicationIds.length > 0) {
    const serviceSupabase = createServiceClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    if (userIds.length > 0) {
      const { data: candidateProfiles } = await serviceSupabase
        .from("candidate_profiles")
        .select("user_id, headline, skills, experience_years, sectors, job_types, remote_preference, desired_salary_min")
        .in("user_id", userIds);

      const profileMap = new Map(
        ((candidateProfiles || []) as CandidateProfileRef[]).map((profile) => [profile.user_id, profile])
      );

      enrichedApps = typedApps.map((app) => {
        const userId = applicationMap.get(app.id);
        const candidateProfile = userId ? profileMap.get(userId) || null : null;

        const matchSummary =
          candidateProfile && app.jobs
            ? scoreCandidateJobMatch({
                candidate: candidateProfile,
                job: {
                  sector: app.jobs.sector,
                  job_type: app.jobs.job_type,
                  remote_type: app.jobs.remote_type,
                  salary_min: null,
                  skills: app.jobs.skills || [],
                  seniority: app.jobs.seniority,
                  is_featured: false,
                },
              })
            : null;

         return {
           ...app,
           candidateProfile,
           matchSummary,
           recruiterNotes: null,
           scorecardData: null,
         };
      });
    }
  }

  return <ApplicationPipeline applications={enrichedApps} />;
}

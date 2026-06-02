import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import ApplicationPipeline from "@/components/jobs/application-pipeline";
import { analyzeJobMatchWithAI, type AIJobMatchAnalysis } from "@/lib/ai-match.service";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Application, CandidateProfile, Database, Employer, Json, JobWithEmployer } from "@/lib/supabase/types";

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
     matchSummary: null as AIJobMatchAnalysis | null,
     recruiterNotes: null as string | null,
     scorecardData: null as Json | null,
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

    if (userIds.length > 0) {
      const { data: candidateProfiles } = await serviceSupabase
        .from("candidate_profiles")
        .select("user_id, headline, skills, experience_years, sectors, job_types, remote_preference, desired_salary_min")
        .in("user_id", userIds);

      const profileMap = new Map(
        ((candidateProfiles || []) as CandidateProfileRef[]).map((profile) => [profile.user_id, profile])
      );

      enrichedApps = await Promise.all(
        typedApps.map(async (app) => {
          const userId = applicationMap.get(app.id);
          const candidateProfile = userId ? profileMap.get(userId) || null : null;

          let matchSummary: AIJobMatchAnalysis | null = null;
          if (candidateProfile && app.jobs) {
            // Construct minimal JobWithEmployer object for AI matching
            const jobForAI: JobWithEmployer = {
              id: '',
              employer_id: '',
              title: app.jobs.title || '',
              slug: '',
              description: '',
              location: '',
              sector: app.jobs.sector,
              job_type: app.jobs.job_type,
              seniority: app.jobs.seniority,
              remote_type: app.jobs.remote_type,
              salary_min: null,
              salary_max: null,
              skills: app.jobs.skills || [],
              benefits: [],
              visa_friendly: false,
              is_featured: false,
              status: 'active',
              expires_at: null,
              application_email: null,
              application_url: null,
              views: 0,
              applications_count: 0,
              created_at: '',
              updated_at: '',
              employers: {
                id: '',
                name: '',
                slug: '',
                logo_url: null,
                location: '',
                website: null,
                is_verified: false
              }
            };

            // Fetch full profile data for AI matching (includes full_name and headline)
            const { data: fullProfileData } = await serviceSupabase
              .from("candidate_profiles")
              .select("full_name, headline, skills, sectors, job_types, remote_preference, experience_years, desired_salary_min")
              .eq("user_id", candidateProfile.user_id)
              .single();
            
            const fullProfile = fullProfileData as Pick<
              CandidateProfile,
              "full_name" | "headline" | "skills" | "sectors" | "job_types" | "remote_preference" | "experience_years" | "desired_salary_min"
            > | null;
            
            matchSummary = await analyzeJobMatchWithAI(jobForAI, {
              skills: fullProfile?.skills || [],
              sectors: fullProfile?.sectors || [],
              job_types: fullProfile?.job_types || [],
              remote_preference: fullProfile?.remote_preference || null,
              experience_years: fullProfile?.experience_years || null,
              desired_salary_min: fullProfile?.desired_salary_min || null,
              full_name: fullProfile?.full_name || null,
              headline: fullProfile?.headline || null,
            });
          }

           return {
             ...app,
             candidateProfile,
             matchSummary,
             recruiterNotes: null,
             scorecardData: null,
           };
        })
      );
    }
  }

  return <ApplicationPipeline applications={enrichedApps} />;
}

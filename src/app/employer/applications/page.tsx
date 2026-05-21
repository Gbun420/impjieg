import { createClient } from "@/lib/supabase/server";
import ApplicationPipeline from "@/components/jobs/application-pipeline";
import type { Application, Employer } from "@/lib/supabase/types";

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
    .select("*, jobs(title)")
    .eq("employer_id", (employer as Employer).id)
    .order("created_at", { ascending: false });

  const typedApps = (applications || []) as (Application & { jobs: { title: string } | null })[];

  return <ApplicationPipeline applications={typedApps} />;
}

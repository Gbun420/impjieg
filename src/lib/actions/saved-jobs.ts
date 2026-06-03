"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type SavedJobInsert = Database["public"]["Tables"]["saved_jobs"]["Insert"];
type SavedJobsMutationTable = {
  insert(values: SavedJobInsert[]): Promise<{
    error: {
      code?: string;
      message: string;
    } | null;
  }>;
};

export async function saveJob(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to save jobs" };
  }

  const savedJobsTable = supabase.from("saved_jobs") as unknown as SavedJobsMutationTable;

  const { error } = await savedJobsTable.insert([{ user_id: user.id, job_id: jobId }]);

  if (error) {
    if (error.code === "23505") {
      return { error: "Job already saved" };
    }
    return { error: error.message };
  }

  revalidatePath("/jobs");
  revalidatePath("/saved-jobs");
  revalidatePath("/candidate/dashboard");
  return { success: true };
}

export async function unsaveJob(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/jobs");
  revalidatePath("/saved-jobs");
  revalidatePath("/candidate/dashboard");
  return { success: true };
}

export async function getSavedJobs() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: [] };
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, jobs(*, employers(id, name, slug, logo_url, location))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: [] };
  }

  return { success: true, data };
}

export async function isJobSaved(jobId: string): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .single();

  return !!data;
}

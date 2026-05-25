import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type CandidateProfileInsert = Database["public"]["Tables"]["candidate_profiles"]["Insert"];
type CandidateProfileUpdate = Database["public"]["Tables"]["candidate_profiles"]["Update"];
type CandidateProfileRecord = Database["public"]["Tables"]["candidate_profiles"]["Row"];

type CandidateProfilesMutationTable = {
  update(
    values: CandidateProfileUpdate
  ): {
    eq(column: "user_id", value: string): {
      select(): {
        single(): Promise<{
          data: CandidateProfileRecord | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
  insert(
    values: CandidateProfileInsert[]
  ): {
    select(): {
      single(): Promise<{
        data: CandidateProfileRecord | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ profile });
}

import { z } from "zod";

const candidateProfileSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").optional(),
  headline: z.string().trim().max(100).optional().nullable(),
  skills: z.array(z.string()).optional(),
  sectors: z.array(z.string()).optional(),
  job_types: z.array(z.string()).optional(),
  remote_preference: z.string().optional().nullable(),
  desired_salary_min: z.number().int().min(0).optional().nullable(),
  experience_years: z.number().int().min(0).optional().nullable(),
  bio: z.string().trim().optional().nullable(),
  resume_url: z.string().trim().url().or(z.literal("")).optional().nullable(),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = candidateProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile data", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const body = parsed.data;

  const { data: existing } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let result;
  if (existing) {
    const candidateProfilesTable = supabase.from(
      "candidate_profiles"
    ) as unknown as CandidateProfilesMutationTable;

    result = await candidateProfilesTable
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();
  } else {
    const candidateProfilesTable = supabase.from(
      "candidate_profiles"
    ) as unknown as CandidateProfilesMutationTable;

    result = await candidateProfilesTable
      .insert([
        {
          user_id: user.id,
          ...body,
        } satisfies CandidateProfileInsert,
      ])
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: result.data });
}

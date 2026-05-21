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

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CandidateProfileUpdate;

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
        ...(body as CandidateProfileUpdate),
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
          ...(body as Omit<CandidateProfileInsert, "user_id">),
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

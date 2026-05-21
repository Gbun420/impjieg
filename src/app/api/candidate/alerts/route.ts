import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type CandidateAlertInsert = Database["public"]["Tables"]["candidate_alerts"]["Insert"];
type CandidateAlertUpdate = Database["public"]["Tables"]["candidate_alerts"]["Update"];

type CandidateAlertRecord = Database["public"]["Tables"]["candidate_alerts"]["Row"];
type CandidateAlertsMutationTable = {
  insert(
    values: CandidateAlertInsert[]
  ): {
    select(): {
      single(): Promise<{
        data: CandidateAlertRecord | null;
        error: { message: string } | null;
      }>;
    };
  };
  update(
    values: CandidateAlertUpdate
  ): {
    eq(column: "id", value: string): {
      eq(column: "user_id", value: string): {
        select(): {
          single(): Promise<{
            data: CandidateAlertRecord | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
};

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data: alert } = await supabase
      .from("candidate_alerts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    return NextResponse.json({ alert });
  }

  const { data: alerts } = await supabase
    .from("candidate_alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ alerts: alerts || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Omit<CandidateAlertInsert, "user_id">;

  const candidateAlertsTable = supabase.from(
    "candidate_alerts"
  ) as unknown as CandidateAlertsMutationTable;

  const { data, error } = await candidateAlertsTable
    .insert([
      {
        user_id: user.id,
        ...body,
      } satisfies CandidateAlertInsert,
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alert: data });
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
  }

  const body = (await request.json()) as CandidateAlertUpdate;

  const candidateAlertsTable = supabase.from(
    "candidate_alerts"
  ) as unknown as CandidateAlertsMutationTable;

  const { data, error } = await candidateAlertsTable
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alert: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("candidate_alerts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

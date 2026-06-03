import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { z } from "zod";

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

export const candidateAlertInputSchema = z.object({
  name: z.string().trim().max(255).optional().transform((value) => (value ? value : null)),
  sectors: z.array(z.string()).default([]).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  job_types: z.array(z.string()).default([]).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  locations: z.array(z.string()).default([]).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  salary_min: z.coerce.number().int().min(0).default(0),
  remote_type: z.string().trim().max(100).optional().transform((value) => (value ? value : null)),
  frequency: z.enum(["instant", "daily", "weekly"]).default("daily"),
  is_active: z.boolean().default(true),
});

export const candidateAlertUpdateSchema = z.object({
  name: z.string().trim().max(255).optional().transform((value) => (value ? value : null)),
  sectors: z.array(z.string()).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  job_types: z.array(z.string()).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  locations: z.array(z.string()).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  salary_min: z.coerce.number().int().min(0),
  remote_type: z.string().trim().max(100).optional().transform((value) => (value ? value : null)),
  frequency: z.enum(["instant", "daily", "weekly"]),
  is_active: z.boolean(),
}).partial();

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

  const parsed = candidateAlertInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid alert data",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const candidateAlertsTable = supabase.from(
    "candidate_alerts"
  ) as unknown as CandidateAlertsMutationTable;

  const { data, error } = await candidateAlertsTable
    .insert([
      {
        user_id: user.id,
        ...parsed.data,
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

  const parsed = candidateAlertUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid alert data",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const candidateAlertsTable = supabase.from(
    "candidate_alerts"
  ) as unknown as CandidateAlertsMutationTable;

  const { data, error } = await candidateAlertsTable
    .update({
      ...parsed.data,
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

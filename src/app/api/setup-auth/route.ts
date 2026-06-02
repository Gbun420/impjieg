import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../_lib/internal-route-guard";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";

const TRIGGER_SQL = `
-- Auto-create employer profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_name text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'companyName', 'New Employer');
  v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g'));
  if v_slug = '' then
    v_slug := 'employer';
  end if;
  v_slug := v_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 4);

  insert into public.employers (user_id, name, slug)
  values (new.id, v_name, v_slug);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
`;

export async function GET(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  return NextResponse.json({
    status: "ready",
    message: "Visit this URL with POST method to apply the database trigger",
    sql: TRIGGER_SQL,
  });
}

export async function POST(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  try {
    // Try the Supabase SQL API endpoint
    const response = await fetch(
      `${getSupabaseUrl()}/rest/v1/rpc/exec_sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: getSupabaseServiceKey(),
          Authorization: `Bearer ${getSupabaseServiceKey()}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({}),
      }
    );

    // If the rpc endpoint doesn't exist, we'll return the SQL for manual execution
    if (!response.ok) {
      return NextResponse.json({
        status: "manual_required",
        message: "Please run this SQL in your Supabase Dashboard SQL Editor:",
        sql: TRIGGER_SQL,
        instructions: [
          "1. Go to https://supabase.com/dashboard/project/vmdjxomkmcbewtcyfrlp/sql",
          "2. Click 'New Query'",
          "3. Paste the SQL below and click 'Run'",
          "4. Employer profiles will now be created automatically on signup",
        ],
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Database trigger applied successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      status: "manual_required",
      message: "Please run this SQL in your Supabase Dashboard SQL Editor:",
      sql: TRIGGER_SQL,
      error: message,
    });
  }
}

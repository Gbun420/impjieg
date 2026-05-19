import { NextResponse } from "next/server";

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

export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "POST to apply the database trigger for auto employer profile creation",
  });
}

export async function POST() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        method: "GET",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: "Failed to connect to Supabase" },
        { status: 500 }
      );
    }

    // Use the postgres meta endpoint to execute raw SQL
    // Supabase exposes this at /pgmeta/v1/query
    const pgmetaResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/pgmeta/v1/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({ query: TRIGGER_SQL }),
      }
    );

    const result = await pgmetaResponse.json();

    if (!pgmetaResponse.ok) {
      return NextResponse.json(
        { status: "error", message: result.error || "Failed to apply trigger" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Database trigger applied successfully. Employer profiles will now be created automatically on signup.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../_lib/internal-route-guard";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";

const MIGRATION_SQL = `
-- Candidate profiles for job seekers
create table if not exists candidate_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text,
  headline text,
  bio text,
  phone text,
  location text,
  website text,
  linkedin_url text,
  skills text[] default '{}',
  experience_years integer,
  desired_salary_min integer,
  desired_salary_max integer,
  job_types text[] default '{}',
  sectors text[] default '{}',
  remote_preference text,
  is_open_to_work boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_candidate_profiles_user on candidate_profiles(user_id);
create index if not exists idx_candidate_profiles_skills on candidate_profiles using gin(skills);
create index if not exists idx_candidate_profiles_sectors on candidate_profiles using gin(sectors);

-- CV versions for candidates
create table if not exists candidate_cvs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_url text not null,
  file_type text,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_candidate_cvs_user on candidate_cvs(user_id);

-- Application tracking for candidates (personal ATS)
create table if not exists candidate_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  application_id uuid references applications(id) on delete set null,
  status text default 'applied' check (status in ('applied', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn')),
  notes text,
  applied_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_candidate_applications_user on candidate_applications(user_id);
create index if not exists idx_candidate_applications_job on candidate_applications(job_id);
create index if not exists idx_candidate_applications_status on candidate_applications(status);

-- Job alert preferences for candidates
create table if not exists candidate_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text default 'My Job Alert',
  sectors text[] default '{}',
  job_types text[] default '{}',
  locations text[] default '{}',
  salary_min integer,
  remote_type text,
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'instant')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_candidate_alerts_user on candidate_alerts(user_id);
`;

export async function GET(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  return NextResponse.json({
    status: "ready",
    message: "POST to apply the candidate portal database migration",
    sql: MIGRATION_SQL,
  });
}

export async function POST(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  try {
    const projectRef = new URL(getSupabaseUrl()).hostname.split(".")[0];
    const response = await fetch(
      `${getSupabaseUrl()}/rest/v1/`,
      {
        method: "GET",
        headers: {
          apikey: getSupabaseServiceKey(),
          Authorization: `Bearer ${getSupabaseServiceKey()}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        status: "manual_required",
        message: "Please run this SQL in your Supabase Dashboard SQL Editor:",
        sql: MIGRATION_SQL,
        instructions: [
          `1. Go to https://supabase.com/dashboard/project/${projectRef}/sql`,
          "2. Click 'New Query'",
          "3. Paste the SQL and click 'Run'",
        ],
      });
    }

    return NextResponse.json({
      status: "manual_required",
      message: "Please run this SQL in your Supabase Dashboard SQL Editor:",
      sql: MIGRATION_SQL,
      instructions: [
        `1. Go to https://supabase.com/dashboard/project/${projectRef}/sql`,
        "2. Click 'New Query'",
        "3. Paste the SQL and click 'Run'",
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      status: "manual_required",
      message: "Please run this SQL in your Supabase Dashboard SQL Editor:",
      sql: MIGRATION_SQL,
      error: message,
    });
  }
}

-- Candidate profiles for job seekers
create table candidate_profiles (
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

create index idx_candidate_profiles_user on candidate_profiles(user_id);
create index idx_candidate_profiles_skills on candidate_profiles using gin(skills);
create index idx_candidate_profiles_sectors on candidate_profiles using gin(sectors);

-- CV versions for candidates
create table candidate_cvs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_url text not null,
  file_type text,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index idx_candidate_cvs_user on candidate_cvs(user_id);

-- Application tracking for candidates (personal ATS)
create table candidate_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  application_id uuid references applications(id) on delete set null,
  status text default 'applied' check (status in ('applied', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn')),
  notes text,
  applied_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_candidate_applications_user on candidate_applications(user_id);
create index idx_candidate_applications_job on candidate_applications(job_id);
create index idx_candidate_applications_status on candidate_applications(status);

-- Job alert preferences for candidates
create table candidate_alerts (
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

create index idx_candidate_alerts_user on candidate_alerts(user_id);

-- Updated_at triggers
create trigger update_candidate_profiles_updated_at
  before update on candidate_profiles
  for each row
  execute function update_updated_at_column();

create trigger update_candidate_applications_updated_at
  before update on candidate_applications
  for each row
  execute function update_updated_at_column();

create trigger update_candidate_alerts_updated_at
  before update on candidate_alerts
  for each row
  execute function update_updated_at_column();

-- RLS Policies
alter table candidate_profiles enable row level security;
alter table candidate_cvs enable row level security;
alter table candidate_applications enable row level security;
alter table candidate_alerts enable row level security;

-- Candidate profiles policies
create policy "Users can view own profile"
  on candidate_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on candidate_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on candidate_profiles for update
  using (auth.uid() = user_id);

-- Public read for profile data (for employer viewing)
create policy "Anyone can view candidate profiles"
  on candidate_profiles for select
  using (true);

-- CV policies
create policy "Users can view own CVs"
  on candidate_cvs for select
  using (auth.uid() = user_id);

create policy "Users can insert own CVs"
  on candidate_cvs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own CVs"
  on candidate_cvs for update
  using (auth.uid() = user_id);

create policy "Users can delete own CVs"
  on candidate_cvs for delete
  using (auth.uid() = user_id);

-- Application tracking policies
create policy "Users can view own applications"
  on candidate_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on candidate_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on candidate_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on candidate_applications for delete
  using (auth.uid() = user_id);

-- Job alerts policies
create policy "Users can view own alerts"
  on candidate_alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert own alerts"
  on candidate_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alerts"
  on candidate_alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete own alerts"
  on candidate_alerts for delete
  using (auth.uid() = user_id);

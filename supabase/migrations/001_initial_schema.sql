-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Employers table
create table employers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  website text,
  logo_url text,
  cover_image_url text,
  location text,
  company_size text,
  industry text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs table
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references employers(id) on delete cascade not null,
  title text not null,
  slug text not null,
  description text not null,
  location text not null,
  sector text not null,
  job_type text not null,
  seniority text,
  remote_type text,
  salary_min integer,
  salary_max integer,
  skills text[] default '{}',
  benefits text[] default '{}',
  visa_friendly boolean default false,
  is_featured boolean default false,
  status text default 'active' check (status in ('active', 'draft', 'expired', 'closed')),
  expires_at timestamptz,
  application_email text,
  application_url text,
  views integer default 0,
  applications_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(employer_id, slug)
);

-- Applications table
create table applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  employer_id uuid references employers(id) on delete cascade not null,
  candidate_name text not null,
  candidate_email text not null,
  candidate_phone text,
  candidate_cv_url text,
  cover_letter text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Payments table
create table payments (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references employers(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete set null,
  amount integer not null,
  currency text default 'eur',
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text unique,
  listing_type text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job alerts table
create table job_alerts (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  sectors text[] default '{}',
  job_type text,
  remote_type text,
  salary_min integer,
  notification_method text default 'email' check (notification_method in ('email', 'whatsapp')),
  whatsapp_number text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_jobs_status on jobs(status);
create index idx_jobs_sector on jobs(sector);
create index idx_jobs_location on jobs(location);
create index idx_jobs_created_at on jobs(created_at desc);
create index idx_jobs_is_featured on jobs(is_featured);
create index idx_jobs_expires_at on jobs(expires_at);
create index idx_jobs_employer_id on jobs(employer_id);
create index idx_applications_job_id on applications(job_id);
create index idx_applications_employer_id on applications(employer_id);
create index idx_payments_employer_id on payments(employer_id);
create index idx_employers_user_id on employers(user_id);
create index idx_employers_slug on employers(slug);

-- Updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_employers_updated_at
  before update on employers
  for each row
  execute function update_updated_at_column();

create trigger update_jobs_updated_at
  before update on jobs
  for each row
  execute function update_updated_at_column();

create trigger update_applications_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

create trigger update_payments_updated_at
  before update on payments
  for each row
  execute function update_updated_at_column();

create trigger update_job_alerts_updated_at
  before update on job_alerts
  for each row
  execute function update_updated_at_column();

-- RLS Policies
alter table employers enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table payments enable row level security;
alter table job_alerts enable row level security;

-- Employers policies
create policy "Anyone can view employers"
  on employers for select using (true);

create policy "Users can insert own employer"
  on employers for insert with check (auth.uid() = user_id);

create policy "Users can update own employer"
  on employers for update using (auth.uid() = user_id);

-- Jobs policies
create policy "Anyone can view active jobs"
  on jobs for select using (status = 'active');

create policy "Employers can view own jobs"
  on jobs for select using (
    exists (
      select 1 from employers
      where employers.id = jobs.employer_id
      and employers.user_id = auth.uid()
    )
  );

create policy "Employers can insert jobs"
  on jobs for insert with check (
    exists (
      select 1 from employers
      where employers.id = employer_id
      and employers.user_id = auth.uid()
    )
  );

create policy "Employers can update own jobs"
  on jobs for update using (
    exists (
      select 1 from employers
      where employers.id = jobs.employer_id
      and employers.user_id = auth.uid()
    )
  );

-- Applications policies
create policy "Anyone can insert applications"
  on applications for insert with check (true);

create policy "Employers can view own applications"
  on applications for select using (
    exists (
      select 1 from employers
      where employers.id = applications.employer_id
      and employers.user_id = auth.uid()
    )
  );

-- Payments policies
create policy "Employers can view own payments"
  on payments for select using (
    exists (
      select 1 from employers
      where employers.id = payments.employer_id
      and employers.user_id = auth.uid()
    )
  );

create policy "Service role can insert payments"
  on payments for insert with check (auth.role() = 'service_role');

create policy "Service role can update payments"
  on payments for update using (auth.role() = 'service_role');

-- Job alerts policies
create policy "Anyone can create job alerts"
  on job_alerts for insert with check (true);

create policy "Service role can read job alerts"
  on job_alerts for select using (auth.role() = 'service_role');

create policy "Service role can update job alerts"
  on job_alerts for update using (auth.role() = 'service_role');

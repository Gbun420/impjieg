-- Saved jobs (bookmarks) for job seekers
create table saved_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, job_id)
);

create index idx_saved_jobs_user on saved_jobs(user_id);
create index idx_saved_jobs_job on saved_jobs(job_id);

-- Employer verification and notification fields
alter table employers add column if not exists is_verified boolean default false;
alter table employers add column if not exists email_notifications boolean default true;
alter table employers add column if not exists whatsapp_notifications boolean default false;
alter table employers add column if not exists whatsapp_number text;

-- Application status check constraint update
alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check check (status in ('new', 'pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'));

-- RLS policies for saved_jobs
alter table saved_jobs enable row level security;

create policy "Users can view their own saved jobs"
  on saved_jobs for select
  using (auth.uid() = user_id);

create policy "Users can save jobs"
  on saved_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave jobs"
  on saved_jobs for delete
  using (auth.uid() = user_id);

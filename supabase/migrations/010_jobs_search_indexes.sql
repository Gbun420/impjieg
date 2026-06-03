-- Jobs search and filtering indexes for public browse pages
create index if not exists idx_jobs_status_expires_at_created_at
  on jobs(status, expires_at, created_at desc);

create index if not exists idx_jobs_remote_type
  on jobs(remote_type)
  where remote_type is not null;

create index if not exists idx_jobs_job_type
  on jobs(job_type);

create index if not exists idx_jobs_seniority
  on jobs(seniority)
  where seniority is not null;

create index if not exists idx_jobs_is_featured_created_at
  on jobs(is_featured, created_at desc);

create index if not exists idx_jobs_sector_lower
  on jobs(lower(sector));

create index if not exists idx_jobs_location_lower
  on jobs(lower(location));

alter table employers
  add column if not exists culture_summary text,
  add column if not exists hiring_process text,
  add column if not exists workplace_highlights text[] default '{}',
  add column if not exists response_time_days integer;

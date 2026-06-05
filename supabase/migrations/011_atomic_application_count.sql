create or replace function increment_job_applications_count(job_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update jobs
  set applications_count = coalesce(applications_count, 0) + 1,
      updated_at = now()
  where id = job_uuid;
end;
$$;

grant execute on function increment_job_applications_count(uuid) to authenticated;
grant execute on function increment_job_applications_count(uuid) to anon;

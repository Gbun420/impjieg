-- Remove public candidate profile access
drop policy if exists "Anyone can view candidate profiles" on candidate_profiles;

-- Replace overly broad payment policies with service-role-only policies
drop policy if exists "System can insert payments" on payments;
drop policy if exists "System can update payments" on payments;

create policy "Service role can insert payments"
  on payments for insert
  with check (auth.role() = 'service_role');

create policy "Service role can update payments"
  on payments for update
  using (auth.role() = 'service_role');

-- Restrict job alert reads to service role only
drop policy if exists "System can read job alerts" on job_alerts;

create policy "Service role can read job alerts"
  on job_alerts for select
  using (auth.role() = 'service_role');

create policy "Service role can update job alerts"
  on job_alerts for update
  using (auth.role() = 'service_role');

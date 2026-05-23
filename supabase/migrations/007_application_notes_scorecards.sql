-- Add notes and scorecards to applications table

-- Add columns for recruiter notes and scorecards
alter table applications
  add column if not exists recruiter_notes text,
  add column if not exists scorecard_data jsonb default '{}'::jsonb;

-- Add index for faster querying of applications with notes
create index if not exists idx_applications_recruiter_notes on applications(recruiter_notes) where recruiter_notes is not null;

-- Update the updated_at trigger to include the new columns
drop trigger if exists update_applications_updated_at on applications;
create trigger update_applications_updated_at
  before update on applications
  for each row
  execute function update_updated_at_column();

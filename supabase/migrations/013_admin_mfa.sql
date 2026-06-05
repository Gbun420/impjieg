create table if not exists admin_mfa_factors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null unique,
  secret_encrypted text not null,
  enabled boolean default true,
  last_used_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_admin_mfa_factors_user_id on admin_mfa_factors(user_id);
create index if not exists idx_admin_mfa_factors_email on admin_mfa_factors(email);

alter table admin_mfa_factors enable row level security;

create trigger update_admin_mfa_factors_updated_at
  before update on admin_mfa_factors
  for each row
  execute function update_updated_at_column();

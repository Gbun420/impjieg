create table if not exists public.admin_mfa_factors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  secret_encrypted text not null,
  enabled boolean not null default true,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_mfa_factors_email_idx
  on public.admin_mfa_factors (lower(email));

alter table public.admin_mfa_factors enable row level security;

revoke all on table public.admin_mfa_factors from anon;
revoke all on table public.admin_mfa_factors from authenticated;

grant select, insert, update, delete on table public.admin_mfa_factors to service_role;

create or replace function public.set_admin_mfa_factors_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_admin_mfa_factors_updated_at
  on public.admin_mfa_factors;

create trigger set_admin_mfa_factors_updated_at
before update on public.admin_mfa_factors
for each row
execute function public.set_admin_mfa_factors_updated_at();

notify pgrst, 'reload schema';

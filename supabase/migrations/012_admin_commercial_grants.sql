-- Admin commercial grants: controlled temporary entitlements for employer monetization

create or replace function is_admin_user()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists admin_commercial_grants (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  granted_by uuid not null references auth.users(id),
  grant_type text not null check (
    grant_type in (
      'free_trial',
      'plan_access',
      'job_credit',
      'featured_credit',
      'boost_credit',
      'ai_screening_credit',
      'percent_discount',
      'fixed_discount',
      'custom_entitlement'
    )
  ),
  product_id text,
  entitlement_key text,
  plan_key text,
  credits_total integer,
  credits_used integer not null default 0 check (credits_used >= 0),
  discount_percent numeric,
  discount_amount_cents integer,
  currency text default 'eur',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active' check (
    status in ('active', 'expired', 'revoked', 'consumed')
  ),
  reason text not null,
  internal_notes text,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id),
  revoke_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_commercial_grants_reason_length check (char_length(reason) >= 10),
  constraint admin_commercial_grants_expiry_after_start check (
    expires_at is null or expires_at > starts_at
  ),
  constraint admin_commercial_grants_revoked_requires_audit_fields check (
    status <> 'revoked'
    or (revoked_at is not null and revoked_by is not null and revoke_reason is not null and char_length(revoke_reason) >= 10)
  ),
  constraint admin_commercial_grants_discount_shape check (
    grant_type not in ('percent_discount', 'fixed_discount')
    or num_nonnulls(discount_percent, discount_amount_cents) = 1
  ),
  constraint admin_commercial_grants_discount_percent_range check (
    discount_percent is null or (discount_percent >= 1 and discount_percent <= 100)
  ),
  constraint admin_commercial_grants_discount_amount_positive check (
    discount_amount_cents is null or discount_amount_cents > 0
  ),
  constraint admin_commercial_grants_credit_shape check (
    grant_type not in ('job_credit', 'featured_credit', 'boost_credit', 'ai_screening_credit')
    or credits_total is not null
  ),
  constraint admin_commercial_grants_credit_total_positive check (
    credits_total is null or credits_total > 0
  ),
  constraint admin_commercial_grants_credit_usage_within_total check (
    credits_total is null or credits_used <= credits_total
  ),
  constraint admin_commercial_grants_trial_requires_expiry check (
    grant_type not in ('free_trial', 'plan_access') or expires_at is not null
  )
);

create table if not exists admin_commercial_grant_audit_logs (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid references admin_commercial_grants(id) on delete cascade,
  employer_id uuid not null references employers(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null check (
    action in (
      'grant_created',
      'grant_updated',
      'grant_revoked',
      'grant_expired',
      'grant_consumed',
      'credit_used',
      'discount_applied'
    )
  ),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_commercial_grants_employer_id
  on admin_commercial_grants(employer_id);

create index if not exists idx_admin_commercial_grants_granted_by
  on admin_commercial_grants(granted_by);

create index if not exists idx_admin_commercial_grants_status
  on admin_commercial_grants(status);

create index if not exists idx_admin_commercial_grants_grant_type
  on admin_commercial_grants(grant_type);

create index if not exists idx_admin_commercial_grants_expires_at
  on admin_commercial_grants(expires_at);

create index if not exists idx_admin_commercial_grants_product_id
  on admin_commercial_grants(product_id);

create index if not exists idx_admin_commercial_grants_entitlement_key
  on admin_commercial_grants(entitlement_key);

create index if not exists idx_admin_commercial_grant_audit_logs_grant_id
  on admin_commercial_grant_audit_logs(grant_id);

create index if not exists idx_admin_commercial_grant_audit_logs_employer_id
  on admin_commercial_grant_audit_logs(employer_id);

create index if not exists idx_admin_commercial_grant_audit_logs_actor_id
  on admin_commercial_grant_audit_logs(actor_id);

create index if not exists idx_admin_commercial_grant_audit_logs_action
  on admin_commercial_grant_audit_logs(action);

create index if not exists idx_admin_commercial_grant_audit_logs_created_at
  on admin_commercial_grant_audit_logs(created_at desc);

drop trigger if exists update_admin_commercial_grants_updated_at on admin_commercial_grants;
create trigger update_admin_commercial_grants_updated_at
  before update on admin_commercial_grants
  for each row
  execute function update_updated_at_column();

alter table admin_commercial_grants enable row level security;
alter table admin_commercial_grant_audit_logs enable row level security;

revoke all on admin_commercial_grants from anon, authenticated;
revoke all on admin_commercial_grant_audit_logs from anon, authenticated;

grant select (
  id,
  employer_id,
  grant_type,
  product_id,
  entitlement_key,
  plan_key,
  credits_total,
  credits_used,
  discount_percent,
  discount_amount_cents,
  currency,
  starts_at,
  expires_at,
  status,
  reason,
  revoked_at,
  revoke_reason,
  created_at,
  updated_at
) on admin_commercial_grants to authenticated;

grant insert, update, delete on admin_commercial_grants to authenticated;

create policy "Admins can manage commercial grants"
  on admin_commercial_grants
  for all
  using (is_admin_user())
  with check (is_admin_user());

create policy "Employers can view own commercial grants"
  on admin_commercial_grants
  for select
  using (
    exists (
      select 1
      from employers
      where employers.id = admin_commercial_grants.employer_id
        and employers.user_id = auth.uid()
    )
  );

create policy "Admins can manage commercial grant audit logs"
  on admin_commercial_grant_audit_logs
  for all
  using (is_admin_user())
  with check (is_admin_user());

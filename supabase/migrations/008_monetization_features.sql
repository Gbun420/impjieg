-- Add monetization features: subscriptions, credit packs, promotion bundles, and screening upsells

-- Create subscriptions table
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete cascade not null,
  plan_type text check (plan_type in ('basic', 'professional', 'enterprise')) not null,
  billing_cycle text check (billing_cycle in ('monthly', 'annual')) default 'monthly' not null,
  status text check (status in ('active', 'canceled', 'past_due', 'trialing')) default 'active' not null,
  current_period_end timestamptz,
  trial_end timestamptz,
  job_credits_used integer default 0 not null,
  job_credits_reset_date timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create subscription_job_credits table to track credit usage
create table if not exists subscription_job_credits (
  id uuid default gen_random_uuid() primary key,
  subscription_id uuid references subscriptions(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete set null,
  credit_type text check (credit_type in ('standard', 'featured')) not null,
  used_at timestamptz default now() not null
);

-- Create credit_packs table
create table if not exists credit_packs (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete cascade not null,
  pack_type text check (pack_type in ('starter', 'standard', 'premium')) not null,
  credits_purchased integer not null,
  credits_remaining integer not null,
  purchased_at timestamptz default now() not null,
  expires_at timestamptz
);

-- Create promotion_bundles table
create table if not exists promotion_bundles (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  bundle_type text check (bundle_type in ('featuredBoost', 'socialPromotion', 'emailBlast')) not null,
  purchased_at timestamptz default now() not null,
  expires_at timestamptz
);

-- Create screening_services table
create table if not exists screening_services (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references employers(id) on delete cascade not null,
  application_id uuid references applications(id) on delete cascade not null,
  service_type text check (service_type in ('backgroundCheck', 'skillsAssessment', 'referenceCheck')) not null,
  status text check (status in ('pending', 'completed', 'failed')) default 'pending' not null,
  result jsonb,
  purchased_at timestamptz default now() not null,
  completed_at timestamptz
);

-- Add indexes for better performance
create index if not exists idx_subscriptions_employer_id on subscriptions(employer_id);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_subscription_job_credits_subscription_id on subscription_job_credits(subscription_id);
create index if not exists idx_credit_packs_employer_id on credit_packs(employer_id);
create index if not exists idx_promotion_bundles_employer_id on promotion_bundles(employer_id);
create index if not exists idx_promotion_bundles_job_id on promotion_bundles(job_id);
create index if not exists idx_screening_services_employer_id on screening_services(employer_id);
create index if not exists idx_screening_services_application_id on screening_services(application_id);

-- Update the updated_at trigger for new tables
drop trigger if exists update_subscriptions_updated_at on subscriptions;
create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_subscription_job_credits_updated_at on subscription_job_credits;
create trigger update_subscription_job_credits_updated_at
  before update on subscription_job_credits
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_credit_packs_updated_at on credit_packs;
create trigger update_credit_packs_updated_at
  before update on credit_packs
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_promotion_bundles_updated_at on promotion_bundles;
create trigger update_promotion_bundles_updated_at
  before update on promotion_bundles
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_screening_services_updated_at on screening_services;
create trigger update_screening_services_updated_at
  before update on screening_services
  for each row
  execute function update_updated_at_column();
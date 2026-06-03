-- Admin audit trail
create table if not exists admin_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_value jsonb,
  after_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now() not null
);

create index if not exists idx_admin_audit_logs_admin_email on admin_audit_logs(admin_email);
create index if not exists idx_admin_audit_logs_action on admin_audit_logs(action);
create index if not exists idx_admin_audit_logs_entity on admin_audit_logs(entity_type, entity_id);
create index if not exists idx_admin_audit_logs_created_at on admin_audit_logs(created_at desc);

-- Core admin roles
create table if not exists admin_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null unique,
  role text not null default 'super_admin' check (role in ('super_admin', 'admin', 'moderator')),
  is_active boolean default true not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_admin_roles_email on admin_roles(email);
create index if not exists idx_admin_roles_role on admin_roles(role);

-- Aggregator sources
create table if not exists job_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('xml_feed', 'rss_feed', 'api', 'html_scraper', 'ats_feed', 'manual_csv')),
  base_url text,
  feed_url text,
  enabled boolean default true not null,
  priority integer default 100 not null,
  active_jobs_limit integer default 100 not null,
  default_status text default 'needs_confirmation' not null check (default_status in ('confirmed', 'needs_confirmation', 'rejected')),
  default_category_id uuid,
  default_company_id uuid,
  employer_assignment_mode text default 'source_company' not null check (employer_assignment_mode in ('manual_company', 'extract_from_post', 'source_company')),
  posting_date_mode text default 'original_date' not null check (posting_date_mode in ('original_date', 'import_date')),
  expiry_days integer default 30 not null,
  crawl_frequency_minutes integer default 1440 not null,
  respect_robots_txt boolean default true not null,
  rate_limit_per_hour integer default 60 not null,
  timeout_seconds integer default 30 not null,
  retry_count integer default 3 not null,
  user_agent text,
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_error_at timestamptz,
  health_status text default 'unknown' not null check (health_status in ('healthy', 'degraded', 'offline', 'unknown')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_job_sources_enabled on job_sources(enabled);
create index if not exists idx_job_sources_priority on job_sources(priority);
create index if not exists idx_job_sources_health_status on job_sources(health_status);

-- Aggregator runs
create table if not exists job_source_runs (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references job_sources(id) on delete cascade not null,
  status text default 'queued' not null check (status in ('queued', 'running', 'succeeded', 'failed', 'partial')),
  fetched_count integer default 0 not null,
  imported_count integer default 0 not null,
  updated_count integer default 0 not null,
  duplicate_count integer default 0 not null,
  rejected_count integer default 0 not null,
  error_count integer default 0 not null,
  error_messages jsonb default '[]'::jsonb not null,
  runtime_ms integer,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_job_source_runs_source_id on job_source_runs(source_id);
create index if not exists idx_job_source_runs_status on job_source_runs(status);
create index if not exists idx_job_source_runs_started_at on job_source_runs(started_at desc);

-- Aggregator errors
create table if not exists job_source_errors (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references job_sources(id) on delete cascade not null,
  run_id uuid references job_source_runs(id) on delete set null,
  source_url text,
  raw_title text,
  raw_company text,
  raw_payload jsonb,
  validation_error text,
  stack_trace text,
  resolved_at timestamptz,
  resolved_by text,
  resolution_note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_job_source_errors_source_id on job_source_errors(source_id);
create index if not exists idx_job_source_errors_run_id on job_source_errors(run_id);
create index if not exists idx_job_source_errors_created_at on job_source_errors(created_at desc);

-- Imported job snapshots and duplicate tracking
create table if not exists job_import_snapshots (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references job_sources(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete set null,
  external_id text,
  canonical_url text,
  apply_url text,
  content_hash text,
  fuzzy_hash text,
  raw_payload jsonb,
  normalized_job jsonb,
  status text default 'needs_review' not null check (status in ('needs_review', 'approved', 'rejected', 'duplicate', 'error', 'expired')),
  imported_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create unique index if not exists idx_job_import_snapshots_external_id on job_import_snapshots(source_id, external_id) where external_id is not null;
create index if not exists idx_job_import_snapshots_canonical_url on job_import_snapshots(canonical_url) where canonical_url is not null;
create index if not exists idx_job_import_snapshots_apply_url on job_import_snapshots(apply_url) where apply_url is not null;
create index if not exists idx_job_import_snapshots_content_hash on job_import_snapshots(content_hash) where content_hash is not null;
create index if not exists idx_job_import_snapshots_status on job_import_snapshots(status);

create table if not exists job_duplicates (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  duplicate_job_id uuid references jobs(id) on delete cascade not null,
  match_type text not null,
  confidence numeric(5,2),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(job_id, duplicate_job_id, match_type)
);

create index if not exists idx_job_duplicates_job_id on job_duplicates(job_id);
create index if not exists idx_job_duplicates_duplicate_job_id on job_duplicates(duplicate_job_id);
create index if not exists idx_job_duplicates_match_type on job_duplicates(match_type);

-- Category, tag, and location taxonomies
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  parent_category_id uuid references categories(id) on delete set null,
  is_malta_default boolean default false not null,
  is_active boolean default true not null,
  sort_order integer default 100 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  country text default 'Malta' not null,
  region text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_malta boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists job_source_mappings (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references job_sources(id) on delete cascade not null,
  external_category text,
  category_id uuid,
  default_job_type text,
  default_work_mode text,
  employer_name_pattern text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_job_source_mappings_source_id on job_source_mappings(source_id);
create index if not exists idx_job_source_mappings_category_id on job_source_mappings(category_id);

-- Auto-tagger
create table if not exists auto_tagger_rules (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  enabled boolean default true not null,
  priority integer default 100 not null,
  match_mode text default 'all' not null check (match_mode in ('all', 'any')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists auto_tagger_conditions (
  id uuid primary key default uuid_generate_v4(),
  rule_id uuid references auto_tagger_rules(id) on delete cascade not null,
  field text not null,
  operator text not null,
  value text not null,
  created_at timestamptz default now() not null
);

create table if not exists auto_tagger_actions (
  id uuid primary key default uuid_generate_v4(),
  rule_id uuid references auto_tagger_rules(id) on delete cascade not null,
  action text not null,
  value text,
  created_at timestamptz default now() not null
);

create index if not exists idx_auto_tagger_rules_enabled on auto_tagger_rules(enabled);
create index if not exists idx_auto_tagger_rules_priority on auto_tagger_rules(priority);
create index if not exists idx_auto_tagger_conditions_rule_id on auto_tagger_conditions(rule_id);
create index if not exists idx_auto_tagger_actions_rule_id on auto_tagger_actions(rule_id);

-- Standard updated_at triggers
create trigger update_admin_roles_updated_at
  before update on admin_roles
  for each row
  execute function update_updated_at_column();

create trigger update_job_sources_updated_at
  before update on job_sources
  for each row
  execute function update_updated_at_column();

create trigger update_job_source_runs_updated_at
  before update on job_source_runs
  for each row
  execute function update_updated_at_column();

create trigger update_job_source_errors_updated_at
  before update on job_source_errors
  for each row
  execute function update_updated_at_column();

create trigger update_job_import_snapshots_updated_at
  before update on job_import_snapshots
  for each row
  execute function update_updated_at_column();

create trigger update_job_duplicates_updated_at
  before update on job_duplicates
  for each row
  execute function update_updated_at_column();

create trigger update_categories_updated_at
  before update on categories
  for each row
  execute function update_updated_at_column();

create trigger update_tags_updated_at
  before update on tags
  for each row
  execute function update_updated_at_column();

create trigger update_locations_updated_at
  before update on locations
  for each row
  execute function update_updated_at_column();

create trigger update_job_source_mappings_updated_at
  before update on job_source_mappings
  for each row
  execute function update_updated_at_column();

create trigger update_auto_tagger_rules_updated_at
  before update on auto_tagger_rules
  for each row
  execute function update_updated_at_column();

-- Keep admin and aggregator tables service-role only.
alter table admin_audit_logs enable row level security;
alter table admin_roles enable row level security;
alter table job_sources enable row level security;
alter table job_source_runs enable row level security;
alter table job_source_errors enable row level security;
alter table job_import_snapshots enable row level security;
alter table job_duplicates enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table locations enable row level security;
alter table job_source_mappings enable row level security;
alter table auto_tagger_rules enable row level security;
alter table auto_tagger_conditions enable row level security;
alter table auto_tagger_actions enable row level security;

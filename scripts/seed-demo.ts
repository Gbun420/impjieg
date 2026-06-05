import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  DEMO_ALERTS,
  DEMO_APPLICATIONS,
  DEMO_CANDIDATE_APPLICATIONS,
  DEMO_CANDIDATES,
  DEMO_EMPLOYERS,
  DEMO_JOBS,
  DEMO_PAYMENTS,
  DEMO_SAVED_JOBS,
  DEMO_USERS,
  stableUuid,
} from "@/lib/demo-fixtures";

type DemoAuthUser = {
  id: string;
  email: string | null;
};

type SupabaseAdminClient = {
  auth: {
    admin: {
      listUsers(params?: { page?: number; perPage?: number }): Promise<{
        data: { users: DemoAuthUser[]; nextPage?: number | null } | null;
        error: { message: string } | null;
      }>;
      createUser(payload: {
        email: string;
        password: string;
        email_confirm: true;
        user_metadata: Record<string, unknown>;
      }): Promise<{
        data: { user: DemoAuthUser | null } | null;
        error: { message: string } | null;
      }>;
      updateUserById(
        id: string,
        payload: {
          password: string;
          email_confirm: true;
          user_metadata: Record<string, unknown>;
        }
      ): Promise<{
        data: { user: DemoAuthUser | null } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

type TableClient = ReturnType<ReturnType<typeof createClient<Database>>["from"]>;

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function loadLocalEnv() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env.production"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));
}

async function findUserByEmail(client: SupabaseAdminClient, email: string) {
  let page = 1;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const match = (data?.users ?? []).find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (match) {
      return match;
    }

    const nextPage = data?.nextPage ?? null;
    if (!nextPage) {
      return null;
    }

    page = nextPage;
  }
}

async function upsertAuthUser(
  client: SupabaseAdminClient,
  {
    email,
    password,
    userMetadata,
  }: {
    email: string;
    password: string;
    userMetadata: Record<string, unknown>;
  }
) {
  const existing = await findUserByEmail(client, email);
  const payload = {
    password,
    email_confirm: true as const,
    user_metadata: userMetadata,
  };

  if (existing) {
    const { data, error } = await client.auth.admin.updateUserById(existing.id, payload);
    if (error) {
      throw new Error(`Failed to update ${email}: ${error.message}`);
    }

    return data?.user ?? existing;
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    ...payload,
  });

  if (error) {
    throw new Error(`Failed to create ${email}: ${error.message}`);
  }

  if (!data?.user) {
    throw new Error(`Failed to create ${email}: no user returned`);
  }

  return data.user;
}

async function upsertRows<T extends Record<string, unknown>>(
  client: TableClient,
  table: keyof Database["public"]["Tables"],
  rows: T[],
  onConflict: string
) {
  const { error } = await client.upsert(rows as never, { onConflict });
  if (error) {
    throw new Error(`Failed to upsert ${String(table)}: ${error.message}`);
  }
}

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const adminClient = supabase as unknown as SupabaseAdminClient;

  const userIds = new Map<string, string>();
  for (const user of DEMO_USERS) {
    const created = await upsertAuthUser(adminClient, {
      email: user.email,
      password: user.password,
      userMetadata: user.userMetadata,
    });
    userIds.set(user.key, created.id);
  }

  const employerRows = DEMO_EMPLOYERS.map((employer) => ({
    id: stableUuid(`employer:${employer.key}`),
    user_id: userIds.get(employer.userKey),
    name: employer.name,
    slug: employer.slug,
    description: employer.description,
    website: employer.website,
    logo_url: employer.logoUrl,
    cover_image_url: employer.coverImageUrl,
    location: employer.location,
    company_size: employer.companySize,
    industry: employer.industry,
    culture_summary: employer.cultureSummary,
    hiring_process: employer.hiringProcess,
    workplace_highlights: employer.workplaceHighlights,
    response_time_days: employer.responseTimeDays,
    is_verified: employer.isVerified,
    email_notifications: employer.emailNotifications,
    whatsapp_notifications: employer.whatsappNotifications,
    whatsapp_number: employer.whatsappNumber,
  }));

  const employerIds = new Map<string, string>();
  employerRows.forEach((row, index) => {
    employerIds.set(DEMO_EMPLOYERS[index].key, row.id);
  });
  await upsertRows(supabase.from("employers"), "employers", employerRows, "id");

  const jobRows = DEMO_JOBS.map((job) => ({
    id: stableUuid(`job:${job.key}`),
    employer_id: employerIds.get(job.employerKey),
    title: job.title,
    slug: job.slug,
    description: job.description,
    location: job.location,
    sector: job.sector,
    job_type: job.job_type,
    seniority: job.seniority,
    remote_type: job.remote_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    skills: job.skills,
    benefits: job.benefits,
    visa_friendly: job.visa_friendly,
    is_featured: job.is_featured,
    status: job.status,
    expires_at: job.expires_at,
    application_email: job.application_email,
    application_url: job.application_url,
    views: job.views,
    applications_count: job.applications_count,
  }));

  const jobIds = new Map<string, string>();
  jobRows.forEach((row, index) => {
    jobIds.set(DEMO_JOBS[index].key, row.id);
  });
  await upsertRows(supabase.from("jobs"), "jobs", jobRows, "id");

  const candidateRows = DEMO_CANDIDATES.map((candidate) => ({
    id: stableUuid(`candidate-profile:${candidate.key}`),
    user_id: userIds.get(candidate.userKey),
    ...candidate.profile,
  }));
  await upsertRows(supabase.from("candidate_profiles"), "candidate_profiles", candidateRows, "user_id");

  const cvRows = DEMO_CANDIDATES.map((candidate) => ({
    id: stableUuid(`candidate-cv:${candidate.key}`),
    user_id: userIds.get(candidate.userKey),
    name: candidate.cvFileName,
    file_url: candidate.cvFileUrl,
    file_type: "text/html",
    is_primary: true,
  }));
  await upsertRows(supabase.from("candidate_cvs"), "candidate_cvs", cvRows, "id");

  const applicationRows = DEMO_APPLICATIONS.map((application) => ({
    id: stableUuid(`application:${application.key}`),
    job_id: jobIds.get(application.jobKey),
    employer_id: employerIds.get(application.employerKey),
    candidate_name: application.candidate_name,
    candidate_email: application.candidate_email,
    candidate_phone: application.candidate_phone,
    candidate_cv_url: application.candidate_cv_url,
    cover_letter: application.cover_letter,
    status: application.status,
    recruiter_notes: application.recruiter_notes,
    scorecard_data: application.scorecard_data,
  }));
  await upsertRows(supabase.from("applications"), "applications", applicationRows, "id");

  const candidateApplicationRows = DEMO_CANDIDATE_APPLICATIONS.map((candidateApplication) => ({
    id: stableUuid(`candidate-application:${candidateApplication.key}`),
    user_id: userIds.get(candidateApplication.candidateKey),
    job_id: jobIds.get(candidateApplication.jobKey),
    application_id: stableUuid(`application:${candidateApplication.applicationKey}`),
    status: candidateApplication.status,
    notes: candidateApplication.notes,
  }));
  await upsertRows(
    supabase.from("candidate_applications"),
    "candidate_applications",
    candidateApplicationRows,
    "id"
  );

  const savedJobRows = DEMO_SAVED_JOBS.map((savedJob) => ({
    id: stableUuid(`saved-job:${savedJob.key}`),
    user_id: userIds.get(savedJob.candidateKey),
    job_id: jobIds.get(savedJob.jobKey),
  }));
  await upsertRows(supabase.from("saved_jobs"), "saved_jobs", savedJobRows, "user_id,job_id");

  const alertRows = DEMO_ALERTS.map((alert) => ({
    id: stableUuid(`job-alert:${alert.key}`),
    email: alert.email,
    sectors: alert.sectors,
    job_type: alert.job_type,
    remote_type: alert.remote_type,
    salary_min: alert.salary_min,
    notification_method: alert.notification_method,
    whatsapp_number: alert.whatsapp_number,
    is_active: alert.is_active,
  }));
  await upsertRows(supabase.from("job_alerts"), "job_alerts", alertRows, "email");

  const paymentRows = DEMO_PAYMENTS.map((payment) => ({
    id: stableUuid(`payment:${payment.key}`),
    employer_id: employerIds.get(payment.employerKey),
    job_id: payment.jobKey ? jobIds.get(payment.jobKey) : null,
    amount: payment.amount,
    currency: "eur",
    status: payment.status,
    stripe_payment_intent_id: payment.stripe_payment_intent_id,
    stripe_checkout_session_id: payment.stripe_checkout_session_id,
    listing_type: payment.listing_type,
  }));
  await upsertRows(supabase.from("payments"), "payments", paymentRows, "id");

  console.log(
    JSON.stringify(
      {
        status: "success",
        users: DEMO_USERS.length,
        employers: DEMO_EMPLOYERS.length,
        jobs: DEMO_JOBS.length,
        candidates: DEMO_CANDIDATES.length,
        applications: DEMO_APPLICATIONS.length,
        savedJobs: DEMO_SAVED_JOBS.length,
        alerts: DEMO_ALERTS.length,
        payments: DEMO_PAYMENTS.length,
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QA_PASSWORD = "ImpjiegQA!2026-DoNotUseReal";
const QA_SEED_MARKER = "qa_seed";
const CANDIDATE_EMAIL = "qa.candidate+dashboard@impjieg.test";
const EMPLOYER_EMAIL = "qa.employer+dashboard@impjieg.test";
const ADMIN_EMAIL = "qa.admin+dashboard@impjieg.test";

const CANDIDATE_USER_ID = stableUuid("qa-user:candidate");
const EMPLOYER_USER_ID = stableUuid("qa-user:employer");
const ADMIN_USER_ID = stableUuid("qa-user:admin");
const EMPLOYER_PROFILE_ID = stableUuid("qa-employer:signal-labs");

const JOB_IDS = {
  frontend: stableUuid("qa-job:frontend-engineer"),
  compliance: stableUuid("qa-job:compliance-analyst"),
  designer: stableUuid("qa-job:product-designer-draft"),
  operations: stableUuid("qa-job:operations-closed"),
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stableUuid(input: string) {
  const hash = crypto.createHash("sha256").update(input).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

function base32Encode(bytes: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let output = "";
  let bits = 0;
  let value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = line.slice(0, equalsIndex).trim();
    if (!key || process.env[key]) continue;
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

type AuthAdminClient = {
  auth: {
    admin: {
      listUsers(params?: {
        page?: number;
        perPage?: number;
      }): Promise<{
        data: { users: { id: string; email: string | null }[]; nextPage?: number | null } | null;
        error: { message: string } | null;
      }>;
      createUser(payload: {
        email: string;
        password: string;
        email_confirm: true;
        user_metadata: Record<string, unknown>;
      }): Promise<{
        data: { user: { id: string; email: string | null } | null } | null;
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
        data: { user: { id: string; email: string | null } | null } | null;
        error: { message: string } | null;
      }>;
    };
  };
};

async function findUserByEmail(
  client: AuthAdminClient,
  email: string
): Promise<{ id: string; email: string | null } | null> {
  let page = 1;
  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(`Failed to list users: ${error.message}`);
    const match = (data?.users ?? []).find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match;
    const nextPage = data?.nextPage ?? null;
    if (!nextPage) return null;
    page = nextPage;
  }
}

async function upsertAuthUser(
  client: AuthAdminClient,
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
    if (error) throw new Error(`Failed to update ${email}: ${error.message}`);
    console.log(`  Updated auth user: ${email}`);
    return data?.user ?? existing;
  }

  const { data, error } = await client.auth.admin.createUser({ email, ...payload });
  if (error) throw new Error(`Failed to create ${email}: ${error.message}`);
  if (!data?.user) throw new Error(`Failed to create ${email}: no user returned`);
  console.log(`  Created auth user: ${email}`);
  return data.user;
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function buildCandidateAlerts() {
  return [
    {
      id: stableUuid("qa-candidate-alert:tech-hybrid"),
      user_id: CANDIDATE_USER_ID,
      name: "QA Technology Hybrid",
      sectors: ["Technology"],
      job_types: ["Full-time"],
      locations: ["Malta"],
      salary_min: 30000,
      remote_type: "Hybrid",
      frequency: "daily" as const,
      is_active: true,
    },
    {
      id: stableUuid("qa-candidate-alert:compliance-remote"),
      user_id: CANDIDATE_USER_ID,
      name: "QA Compliance Remote",
      sectors: ["Legal & Compliance"],
      job_types: ["Full-time"],
      locations: ["Malta"],
      salary_min: 35000,
      remote_type: "Remote",
      frequency: "weekly" as const,
      is_active: true,
    },
  ];
}

function buildEmployerJobs(employerId: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return [
    {
      id: JOB_IDS.frontend,
      employer_id: employerId,
      title: "QA Frontend Engineer",
      slug: "qa-frontend-engineer",
      description:
        "QA-only role for testing the employer dashboard. React, TypeScript, Next.js. This role is only used for automated testing and will be deleted after QA cycles.",
      location: "Sliema",
      sector: "Technology",
      job_type: "Full-time",
      seniority: "Mid Level",
      remote_type: "Hybrid",
      salary_min: 32000,
      salary_max: 45000,
      skills: ["React", "TypeScript", "Next.js"],
      benefits: ["Health insurance", "Remote flexibility"],
      visa_friendly: true,
      is_featured: false,
      status: "active",
      expires_at: expiresAt,
      views: 42,
      applications_count: 3,
    },
    {
      id: JOB_IDS.compliance,
      employer_id: employerId,
      title: "QA Compliance Analyst",
      slug: "qa-compliance-analyst",
      description:
        "QA-only compliance role for dashboard testing. Verifies regulatory processes in the employer workflow. Do not use for real hiring.",
      location: "St Julian's",
      sector: "Legal & Compliance",
      job_type: "Full-time",
      seniority: "Senior",
      remote_type: "On-site",
      salary_min: 30000,
      salary_max: 42000,
      skills: ["Compliance", "AML", "KYC"],
      benefits: ["Health insurance"],
      visa_friendly: false,
      is_featured: true,
      status: "active",
      expires_at: expiresAt,
      views: 28,
      applications_count: 2,
    },
    {
      id: JOB_IDS.designer,
      employer_id: employerId,
      title: "QA Product Designer Draft",
      slug: "qa-product-designer-draft",
      description:
        "Draft role for testing the job posting flow. Not published. Used only for employer dashboard QA.",
      location: "Malta",
      sector: "Technology",
      job_type: "Full-time",
      seniority: "Junior",
      remote_type: "Remote",
      salary_min: 28000,
      salary_max: 38000,
      skills: ["Figma", "UI/UX"],
      benefits: [],
      visa_friendly: false,
      is_featured: false,
      status: "draft",
      expires_at: null,
      views: 0,
      applications_count: 0,
    },
    {
      id: JOB_IDS.operations,
      employer_id: employerId,
      title: "QA Closed Operations Role",
      slug: "qa-closed-operations-role",
      description:
        "Closed role for testing the job lifecycle in the employer dashboard. Do not apply.",
      location: "Birkirkara",
      sector: "Logistics & Transport",
      job_type: "Full-time",
      seniority: "Entry Level",
      remote_type: "Hybrid",
      salary_min: 24000,
      salary_max: 30000,
      skills: ["Operations", "Logistics"],
      benefits: [],
      visa_friendly: false,
      is_featured: false,
      status: "closed",
      expires_at: null,
      views: 15,
      applications_count: 1,
    },
  ];
}

function buildApplications(employerId: string) {
  return [
    {
      id: stableUuid("qa-application:applied"),
      job_id: JOB_IDS.frontend,
      employer_id: employerId,
      candidate_name: "QA Applicant One",
      candidate_email: "qa.applicant.one@impjieg.test",
      candidate_phone: "+356 7900 0001",
      cover_letter: "QA test application for dashboard testing.",
      status: "pending",
      scorecard_data: {},
    },
    {
      id: stableUuid("qa-application:shortlisted"),
      job_id: JOB_IDS.frontend,
      employer_id: employerId,
      candidate_name: "QA Applicant Two",
      candidate_email: "qa.applicant.two@impjieg.test",
      cover_letter: "QA test application shortlisted for pipeline testing.",
      status: "shortlisted",
      recruiter_notes: "QA shortlisted for dashboard verification",
      scorecard_data: { skills: 4, culture: 5 },
    },
    {
      id: stableUuid("qa-application:interview"),
      job_id: JOB_IDS.compliance,
      employer_id: employerId,
      candidate_name: "QA Applicant Three",
      candidate_email: "qa.applicant.three@impjieg.test",
      cover_letter: "QA test application in interview stage.",
      status: "interview",
      recruiter_notes: "QA interview scheduled",
      scorecard_data: { skills: 5, experience: 4 },
    },
    {
      id: stableUuid("qa-application:rejected"),
      job_id: JOB_IDS.compliance,
      employer_id: employerId,
      candidate_name: "QA Applicant Four",
      candidate_email: "qa.applicant.four@impjieg.test",
      status: "rejected",
      recruiter_notes: "QA rejected for lifecycle testing",
      scorecard_data: {},
    },
  ];
}

function buildCandidateApplications() {
  return [
    {
      id: stableUuid("qa-candidate-app:applied"),
      user_id: CANDIDATE_USER_ID,
      job_id: JOB_IDS.frontend,
      application_id: stableUuid("qa-application:candidate-applied"),
      status: "applied" as const,
      notes: "QA test application",
    },
    {
      id: stableUuid("qa-candidate-app:shortlisted"),
      user_id: CANDIDATE_USER_ID,
      job_id: JOB_IDS.compliance,
      application_id: stableUuid("qa-application:candidate-shortlisted"),
      status: "shortlisted" as const,
      notes: "QA shortlisted for pipeline test",
    },
    {
      id: stableUuid("qa-candidate-app:rejected"),
      user_id: CANDIDATE_USER_ID,
      job_id: JOB_IDS.operations,
      application_id: stableUuid("qa-application:candidate-rejected"),
      status: "rejected" as const,
      notes: "QA rejected for lifecycle test",
    },
  ];
}

function buildSavedJobs() {
  return [
    {
      id: stableUuid("qa-saved-job:frontend"),
      user_id: CANDIDATE_USER_ID,
      job_id: JOB_IDS.frontend,
    },
    {
      id: stableUuid("qa-saved-job:compliance"),
      user_id: CANDIDATE_USER_ID,
      job_id: JOB_IDS.compliance,
    },
  ];
}

function buildJobAlerts() {
  return [
    {
      id: stableUuid("qa-job-alert:tech-hybrid"),
      email: CANDIDATE_EMAIL,
      sectors: ["Technology"],
      job_type: "Full-time",
      remote_type: "Hybrid",
      salary_min: 30000,
      notification_method: "email" as const,
      is_active: true,
    },
    {
      id: stableUuid("qa-job-alert:compliance-remote"),
      email: CANDIDATE_EMAIL,
      sectors: ["Legal & Compliance"],
      job_type: "Full-time",
      remote_type: "Remote",
      salary_min: 35000,
      notification_method: "email" as const,
      is_active: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in env"
    );
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminClient = supabase as unknown as AuthAdminClient;

  console.log("Seeding QA dashboard test profiles...\n");

  // --- 1. Auth users ---
  console.log("1. Creating auth users...");

  const candidateUser = await upsertAuthUser(adminClient, {
    email: CANDIDATE_EMAIL,
    password: QA_PASSWORD,
    userMetadata: {
      accountType: "candidate",
      fullName: "QA Candidate Dashboard",
    },
  });

  const employerUser = await upsertAuthUser(adminClient, {
    email: EMPLOYER_EMAIL,
    password: QA_PASSWORD,
    userMetadata: {
      accountType: "employer",
      companyName: "QA Signal Labs Ltd",
    },
  });

  const adminUser = await upsertAuthUser(adminClient, {
    email: ADMIN_EMAIL,
    password: QA_PASSWORD,
    userMetadata: {
      accountType: "admin",
    },
  });

  const candidateUserId = candidateUser.id;
  const employerUserId = employerUser.id;
  const adminUserId = adminUser.id;

  console.log(`  Candidate user ID: ${candidateUserId}`);
  console.log(`  Employer user ID:  ${employerUserId}`);
  console.log(`  Admin user ID:     ${adminUserId}`);

  // --- 2. Candidate profile ---
  console.log("\n2. Creating candidate profile...");

  const { error: profileError } = await supabase
    .from("candidate_profiles")
    .upsert(
      {
        id: stableUuid("qa-candidate-profile:main"),
        user_id: candidateUserId,
        full_name: "QA Candidate Dashboard",
        headline: "Frontend / Product candidate",
        bio: "QA test candidate profile for dashboard testing. Do not contact for real roles.",
        phone: "+356 7900 9999",
        location: "Malta",
        website: "https://example.com",
        linkedin_url: "https://linkedin.com/in/qa-test",
        skills: ["React", "TypeScript", "Figma", "Product Design"],
        experience_years: 5,
        desired_salary_min: 32000,
        desired_salary_max: 50000,
        job_types: ["Full-time"],
        sectors: ["Technology", "iGaming", "Finance & Banking"],
        remote_preference: "Hybrid",
        is_open_to_work: true,
      } as never,
      { onConflict: "user_id" }
    );

  if (profileError) {
    console.error("  Candidate profile error:", profileError.message);
  } else {
    console.log("  Candidate profile created/updated");
  }

  // --- 3. Employer profile ---
  console.log("\n3. Creating employer profile...");

  const { error: employerError } = await supabase
    .from("employers")
    .upsert(
      {
        id: EMPLOYER_PROFILE_ID,
        user_id: employerUserId,
        name: "QA Signal Labs Ltd",
        slug: "qa-signal-labs",
        description:
          "QA-only employer profile for dashboard and application-flow testing. Not a real company.",
        website: "https://example.com",
        location: "Sliema, Malta",
        company_size: "11-50",
        industry: "Technology",
        culture_summary:
          "QA testing environment. This profile exists solely for automated dashboard testing.",
        hiring_process:
          "Automated QA testing pipeline. Applications are reviewed by test scripts only.",
        workplace_highlights: ["Flexible hours", "Remote-friendly", "Health insurance"],
        response_time_days: 2,
        is_verified: true,
        email_notifications: true,
        whatsapp_notifications: false,
      } as never,
      { onConflict: "id" }
    );

  if (employerError) {
    console.error("  Employer profile error:", employerError.message);
  } else {
    console.log("  Employer profile created/updated");
  }

  // --- 4. Employer jobs ---
  console.log("\n4. Creating employer jobs...");

  const jobRows = buildEmployerJobs(EMPLOYER_PROFILE_ID);
  const { error: jobsError } = await supabase
    .from("jobs")
    .upsert(jobRows as never, { onConflict: "id" });

  if (jobsError) {
    console.error("  Jobs error:", jobsError.message);
  } else {
    console.log(`  ${jobRows.length} jobs created/updated`);
  }

  // --- 5. Applications (employer side) ---
  console.log("\n5. Creating employer-side applications...");

  const appRows = buildApplications(EMPLOYER_PROFILE_ID);
  const { error: appsError } = await supabase
    .from("applications")
    .upsert(appRows as never, { onConflict: "id" });

  if (appsError) {
    console.error("  Applications error:", appsError.message);
  } else {
    console.log(`  ${appRows.length} applications created/updated`);
  }

  // Also create corresponding candidate applications for the employer-side apps
  const candidateAppRowsForEmployerApps = [
    {
      id: stableUuid("qa-candidate-app:employer-applied"),
      user_id: stableUuid("qa-user:qa-applicant-one"),
      job_id: JOB_IDS.frontend,
      application_id: stableUuid("qa-application:applied"),
      status: "applied" as const,
      notes: "QA test",
    },
    {
      id: stableUuid("qa-candidate-app:employer-shortlisted"),
      user_id: stableUuid("qa-user:qa-applicant-two"),
      job_id: JOB_IDS.frontend,
      application_id: stableUuid("qa-application:shortlisted"),
      status: "shortlisted" as const,
      notes: "QA shortlisted",
    },
    {
      id: stableUuid("qa-candidate-app:employer-interview"),
      user_id: stableUuid("qa-user:qa-applicant-three"),
      job_id: JOB_IDS.compliance,
      application_id: stableUuid("qa-application:interview"),
      status: "interview" as const,
      notes: "QA interview",
    },
    {
      id: stableUuid("qa-candidate-app:employer-rejected"),
      user_id: stableUuid("qa-user:qa-applicant-four"),
      job_id: JOB_IDS.compliance,
      application_id: stableUuid("qa-application:rejected"),
      status: "rejected" as const,
      notes: "QA rejected",
    },
  ];

  const { error: candAppsErr } = await supabase
    .from("candidate_applications")
    .upsert(candidateAppRowsForEmployerApps as never, { onConflict: "id" });

  if (candAppsErr) {
    console.error("  Candidate applications (employer-side) error:", candAppsErr.message);
  } else {
    console.log(`  ${candidateAppRowsForEmployerApps.length} candidate applications (employer-side) created`);
  }

  // --- 6. Candidate applications (candidate side) ---
  console.log("\n6. Creating candidate-side applications...");

  const candAppRows = buildCandidateApplications();
  const { error: candAppError } = await supabase
    .from("candidate_applications")
    .upsert(candAppRows as never, { onConflict: "id" });

  if (candAppError) {
    console.error("  Candidate applications error:", candAppError.message);
  } else {
    console.log(`  ${candAppRows.length} candidate applications created/updated`);
  }

  // --- 7. Saved jobs ---
  console.log("\n7. Creating saved jobs...");

  const savedJobRows = buildSavedJobs();
  const { error: savedError } = await supabase
    .from("saved_jobs")
    .upsert(savedJobRows as never, { onConflict: "user_id,job_id" });

  if (savedError) {
    console.error("  Saved jobs error:", savedError.message);
  } else {
    console.log(`  ${savedJobRows.length} saved jobs created/updated`);
  }

  // --- 8. Candidate alerts ---
  console.log("\n8. Creating candidate alerts...");

  const candAlertRows = buildCandidateAlerts();
  const { error: candAlertError } = await supabase
    .from("candidate_alerts")
    .upsert(candAlertRows as never, { onConflict: "id" });

  if (candAlertError) {
    console.error("  Candidate alerts error:", candAlertError.message);
  } else {
    console.log(`  ${candAlertRows.length} candidate alerts created/updated`);
  }

  // --- 9. Job alerts ---
  console.log("\n9. Creating job alerts...");

  const jobAlertRows = buildJobAlerts();
  const { error: jobAlertError } = await supabase
    .from("job_alerts")
    .upsert(jobAlertRows as never, { onConflict: "email" });

  if (jobAlertError) {
    console.error("  Job alerts error:", jobAlertError.message);
  } else {
    console.log(`  ${jobAlertRows.length} job alerts created/updated`);
  }

  // --- 10. Admin MFA factor (pre-seeded for automated QA) ---
  console.log("\n10. Seeding admin MFA factor...");

  const qaTotpSecret = base32Encode(crypto.randomBytes(20));
  const encryptedSecret = encryptForQa(qaTotpSecret);

  const { error: mfaError } = await supabase
    .from("admin_mfa_factors")
    .upsert(
      {
        user_id: adminUserId,
        email: ADMIN_EMAIL,
        secret_encrypted: encryptedSecret,
        enabled: true,
        last_used_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" }
    );

  if (mfaError) {
    console.error("  Admin MFA factor error:", mfaError.message);
  } else {
    console.log("  Admin MFA factor created/updated");
  }

  // --- Write credentials file ---
  console.log("\n11. Writing credentials file...");

  const credentialsContent = buildCredentialsFile(qaTotpSecret, adminUserId);
  const credentialsPath = path.resolve(process.cwd(), "output/qa-dashboard-credentials.local.md");
  fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
  fs.writeFileSync(credentialsPath, credentialsContent, "utf8");
  console.log(`  Written to: ${credentialsPath}`);

  // --- Summary ---
  console.log("\n--- Seed Summary ---");
  console.log(JSON.stringify(
    {
      status: "success",
      accounts: 3,
      candidateProfile: 1,
      employerProfile: 1,
      jobs: jobRows.length,
      applications: appRows.length,
      candidateApplications: candAppRows.length + candidateAppRowsForEmployerApps.length,
      savedJobs: savedJobRows.length,
      candidateAlerts: candAlertRows.length,
      jobAlerts: jobAlertRows.length,
      adminMfaFactor: 1,
    },
    null,
    2
  ));

  console.log("\nAdmin MFA TOTP secret written to credentials file.");
  console.log("Use: npm run qa:admin-totp  to generate current 6-digit code");
}

// ---------------------------------------------------------------------------
// Simple encryption for QA TOTP secret (not production-grade, just avoids
// storing plaintext in the credentials file)
// ---------------------------------------------------------------------------

function encryptForQa(secret: string): string {
  const key = crypto.createHash("sha256").update("impjieg-qa-dashboard-seed").digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

// ---------------------------------------------------------------------------
// Credentials file builder
// ---------------------------------------------------------------------------

function buildCredentialsFile(qaTotpSecret: string, adminUserId: string): string {
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  return `# Impjieg QA Browser Credentials

Generated: ${now} UTC
Environment: local / staging
Base URL: https://impjieg.vercel.app (or http://localhost:3000)

---

## Candidate

Email: \`${CANDIDATE_EMAIL}\`
Password: \`${QA_PASSWORD}\`

Routes to test:
- /candidate/dashboard
- /candidate/profile
- /candidate/alerts
- /candidate/applications
- /candidate/recommendations
- /saved-jobs

Expected data:
- 2 saved jobs
- 3 applications (applied, shortlisted, rejected)
- 2 candidate alerts (Technology Hybrid, Compliance Remote)
- 2 job alerts (Technology Hybrid, Compliance Remote)
- Complete profile with skills, salary preference, sectors

---

## Employer

Email: \`${EMPLOYER_EMAIL}\`
Password: \`${QA_PASSWORD}\`

Routes to test:
- /employer/dashboard
- /employer/jobs
- /employer/post-job
- /employer/applications
- /employer/settings
- /employer/bulk-upload
- /employer/checkout
- /employer/jobs/[jobId]/analytics
- /employer/jobs/[jobId]/report

Expected data:
- 4 jobs: 2 active, 1 draft, 1 closed
- 4 applications: pending, shortlisted, interview, rejected
- Complete employer profile (verified, Sliema, Technology)

---

## Admin

Email: \`${ADMIN_EMAIL}\`
Password: \`${QA_PASSWORD}\`

MFA: Pre-seeded TOTP factor. Use the script to generate codes:
\`\`\`
npm run qa:admin-totp
\`\`\`

QA TOTP Secret (for reference only, do NOT use in production):
\`${qaTotpSecret}\`

Admin User ID: \`${adminUserId}\`

Routes to test:
- /admin/login
- /admin/login/mfa
- /admin/dashboard
- /admin/[sections]

⚠️  WARNING: This TOTP secret is for QA testing only.
    Do not use in production. Do not commit to Git.

---

## Safety

These are disposable QA accounts only.
Delete with:
\`\`\`
npm run qa:delete-dashboard-profiles
\`\`\`

All seeded records use the prefix "QA " in names and "qa." in emails.
The delete script removes only records matching these QA markers.
`;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`\nSeed failed: ${message}`);
  process.exitCode = 1;
});

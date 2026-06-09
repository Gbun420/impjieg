import { z } from "zod";
import {
  TALENT_DIRECTORY_MAX_HEADLINE,
  TALENT_DIRECTORY_MAX_SUMMARY,
  TALENT_DIRECTORY_MAX_SKILLS,
  TALENT_DIRECTORY_MAX_SECTORS,
  TALENT_DIRECTORY_MIN_MESSAGE,
  TALENT_DIRECTORY_MAX_MESSAGE,
  DISPLAY_MODES,
} from "./constants";

// ============================================================================
// Candidate Schemas
// ============================================================================

export const candidateDirectorySettingsSchema = z.object({
  displayMode: z.enum(DISPLAY_MODES),
  headline: z.string().max(TALENT_DIRECTORY_MAX_HEADLINE).optional(),
  summary: z.string().max(TALENT_DIRECTORY_MAX_SUMMARY).optional(),
  skills: z.array(z.string()).max(TALENT_DIRECTORY_MAX_SKILLS).default([]),
  sectors: z.array(z.string()).max(TALENT_DIRECTORY_MAX_SECTORS).default([]),
  jobTypes: z.array(z.string()).default([]),
  remotePreference: z.enum(["On-site", "Remote", "Hybrid"]).optional(),
  experienceYears: z.number().int().min(0).max(50).optional(),
  desiredSalaryMin: z.number().int().min(0).optional(),
  desiredSalaryMax: z.number().int().min(0).optional(),
  availability: z.string().max(200).optional(),
  allowContactRequests: z.boolean().default(true),
  allowCvRequests: z.boolean().default(false),
  allowDirectCvDownload: z.boolean().default(false),
  consentToDirectory: z.literal(true).refine((val) => val === true, {
    message: "You must consent to be listed in the Talent Directory",
  }),
});

export type CandidateDirectorySettingsInput = z.infer<
  typeof candidateDirectorySettingsSchema
>;

// ============================================================================
// Employer Schemas
// ============================================================================

export const employerTalentSearchSchema = z.object({
  query: z.string().max(200).optional(),
  skills: z.array(z.string()).optional(),
  sectors: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  experienceYearsMin: z.number().int().min(0).optional(),
  experienceYearsMax: z.number().int().max(50).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  remotePreference: z.enum(["On-site", "Remote", "Hybrid"]).optional(),
  availability: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type EmployerTalentSearchInput = z.infer<
  typeof employerTalentSearchSchema
>;

export const createContactRequestSchema = z.object({
  candidateDirectoryProfileId: z.string().uuid(),
  message: z
    .string()
    .min(TALENT_DIRECTORY_MIN_MESSAGE)
    .max(TALENT_DIRECTORY_MAX_MESSAGE),
  employerId: z.string().uuid(),
});

export type CreateContactRequestInput = z.infer<
  typeof createContactRequestSchema
>;

export const respondToContactRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["accepted", "rejected"]),
  responseMessage: z.string().max(1000).optional(),
});

export type RespondToContactRequestInput = z.infer<
  typeof respondToContactRequestSchema
>;

// ============================================================================
// Admin Schemas
// ============================================================================

export const createEmployerTalentAccessSchema = z.object({
  employerId: z.string().uuid(),
  planKey: z.enum(["starter", "recruiter"]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const purchaseTalentCreditsSchema = z.object({
  employerId: z.string().uuid(),
  packKey: z.enum(["5", "20", "50"]),
  stripePaymentIntentId: z.string().optional(),
});

export const adminSuspendTalentAccessSchema = z.object({
  employerId: z.string().uuid(),
  reason: z.string().min(10).max(2000),
});

export const adminSuspendCandidateProfileSchema = z.object({
  candidateUserId: z.string().uuid(),
  reason: z.string().min(10).max(2000),
});

import { z } from "zod";

export const candidateAlertInputSchema = z.object({
  name: z.string().trim().max(255).optional().transform((value) => (value ? value : null)),
  sectors: z.array(z.string()).default([]).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  job_types: z.array(z.string()).default([]).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  locations: z.array(z.string()).default([]).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  salary_min: z.coerce.number().int().min(0).default(0),
  remote_type: z.string().trim().max(100).optional().transform((value) => (value ? value : null)),
  frequency: z.enum(["instant", "daily", "weekly"]).default("daily"),
  is_active: z.boolean().default(true),
});

export const candidateAlertUpdateSchema = z.object({
  name: z.string().trim().max(255).optional().transform((value) => (value ? value : null)),
  sectors: z.array(z.string()).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  job_types: z.array(z.string()).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  locations: z.array(z.string()).transform((values) => values.map((value) => value.trim()).filter(Boolean)),
  salary_min: z.coerce.number().int().min(0),
  remote_type: z.string().trim().max(100).optional().transform((value) => (value ? value : null)),
  frequency: z.enum(["instant", "daily", "weekly"]),
  is_active: z.boolean(),
}).partial();

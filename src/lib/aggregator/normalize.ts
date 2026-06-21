/**
 * Normalization: map a NormalizedJob from an external ATS into the shape the
 * `jobs` table expects, and decide whether it's a Malta-relevant role.
 *
 * Keeps the board Malta-focused (the whole product premise) and maps every
 * imported role onto the real `SECTORS` taxonomy so the sector landing pages
 * and filters keep working.
 */

import { createHash } from "node:crypto";
import { SECTORS } from "@/lib/constants";
import type { NormalizedJob } from "./types";

/** Common Malta localities used to recognise a Malta-based role from free text. */
const MALTA_LOCALITIES = [
  "malta", "valletta", "sliema", "st julian", "st. julian", "saint julian", "gzira",
  "msida", "birkirkara", "qormi", "mosta", "naxxar", "san gwann", "ta' xbiex",
  "ta xbiex", "marsa", "mriehel", "central business district", "floriana", "pieta",
  "swieqi", "gozo", "victoria gozo", "paola", "fgura", "zebbug", "attard", "balzan",
  "santa venera", "hamrun", "marsascala", "marsaskala", "luqa", "gudja", "kalkara",
];

/**
 * Keyword → sector mapping. Values are validated against SECTORS at runtime;
 * anything unmatched falls back to a safe default so `sector` is never invalid.
 */
const SECTOR_KEYWORDS: Array<{ sector: string; words: string[] }> = [
  { sector: "iGaming", words: ["igaming", "i-gaming", "gaming", "casino", "betting", "sportsbook", "poker", "slots", "wagering"] },
  { sector: "Technology", words: ["engineer", "developer", "software", "data", "devops", "qa ", "qa engineer", "it ", "frontend", "backend", "full stack", "fullstack", "sre", "cloud", "cyber", "security", "machine learning", "ai ", "product manager", "ux", "ui "] },
  { sector: "Finance & Banking", words: ["finance", "accountant", "accounting", "banking", "audit", "tax", "compliance", "aml", "kyc", "risk", "treasury", "payments", "fintech", "investment"] },
  { sector: "Healthcare", words: ["nurse", "doctor", "medical", "health", "clinical", "pharma", "care worker", "dental", "physio"] },
  { sector: "Marketing & Media", words: ["marketing", "seo", "content", "social media", "brand", "communications", "pr ", "copywriter", "media", "affiliate", "crm", "growth"] },
  { sector: "Legal & Compliance", words: ["legal", "lawyer", "solicitor", "paralegal", "counsel", "regulatory"] },
  { sector: "Tourism & Hospitality", words: ["hospitality", "hotel", "restaurant", "chef", "tourism", "travel", "front office", "concierge", "barista", "waiter"] },
  { sector: "Construction & Engineering", words: ["construction", "civil engineer", "mechanical", "electrical", "architect", "site manager", "surveyor", "hvac"] },
];

const SECTOR_VALUES: readonly string[] = SECTORS;

function fallbackSector(): string {
  if (SECTOR_VALUES.includes("Technology")) return "Technology";
  return SECTOR_VALUES[0] ?? "Technology";
}

export function mapSector(job: NormalizedJob): string {
  const haystack = `${job.title} ${job.department ?? ""}`.toLowerCase();
  for (const { sector, words } of SECTOR_KEYWORDS) {
    if (!SECTOR_VALUES.includes(sector)) continue;
    if (words.some((w) => haystack.includes(w))) return sector;
  }
  return fallbackSector();
}

/** True when the role is plausibly Malta-based (or remote hiring into Malta). */
export function isMaltaJob(job: NormalizedJob): boolean {
  const text = `${job.location} ${job.title}`.toLowerCase();
  if (MALTA_LOCALITIES.some((loc) => text.includes(loc))) return true;
  // A purely remote posting on a Malta employer's board is acceptable.
  if (job.remoteType === "Remote" && /remote/i.test(job.location || "")) return true;
  return false;
}

export function normalizeRemote(job: NormalizedJob): "Remote" | "Hybrid" | "On-site" {
  if (job.remoteType) return job.remoteType;
  const text = `${job.location} ${job.title} ${job.description}`.toLowerCase();
  if (/hybrid/.test(text)) return "Hybrid";
  if (/remote|work from home|telecommut/.test(text)) return "Remote";
  return "On-site";
}

export function normalizeJobType(raw: string | null): string {
  const v = (raw ?? "").toLowerCase().replace(/[_\s-]+/g, " ").trim();
  if (/part.?time/.test(v)) return "Part-time";
  if (/contract|contractor|freelance/.test(v)) return "Contract";
  if (/temp/.test(v)) return "Temporary";
  if (/intern/.test(v)) return "Internship";
  return "Full-time";
}

/** Best-effort salary extraction from free text (most ATS feeds omit pay). */
export function parseSalary(text: string): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null };
  const matches = text.match(/€\s?(\d{1,3}(?:[.,]\d{3})+|\d{4,6})/g);
  if (!matches || matches.length === 0) return { min: null, max: null };
  const nums = matches
    .map((m) => parseInt(m.replace(/[^\d]/g, ""), 10))
    .filter((n) => Number.isFinite(n) && n >= 8000 && n <= 500000)
    .sort((a, b) => a - b);
  if (nums.length === 0) return { min: null, max: null };
  if (nums.length === 1) return { min: nums[0], max: null };
  return { min: nums[0], max: nums[nums.length - 1] };
}

/** Stable content hash for change detection / dedupe. */
export function contentHash(job: NormalizedJob): string {
  const basis = [job.title, job.location, job.description].join("").toLowerCase();
  return createHash("sha256").update(basis).digest("hex");
}

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

/**
 * Canonical Malta localities/regions and their match aliases. Labels follow the
 * site's LOCATIONS taxonomy where possible so aggregated jobs line up with the
 * location filters; other common localities (and Gozo as a region) are also
 * recognised. This board is Malta-only — a job's location is always a Malta
 * locality or region, never another country.
 */
const MALTA_LOCALITIES: Array<{ label: string; aliases: string[] }> = [
  { label: "Valletta", aliases: ["valletta", "il-belt"] },
  { label: "Sliema", aliases: ["sliema"] },
  { label: "St. Julian's", aliases: ["st julian", "st. julian", "saint julian", "san giljan", "san ġiljan", "paceville"] },
  { label: "Gzira", aliases: ["gzira", "gżira"] },
  { label: "Ta' Xbiex", aliases: ["ta' xbiex", "ta xbiex"] },
  { label: "Msida", aliases: ["msida"] },
  { label: "Birkirkara", aliases: ["birkirkara", "b'kara"] },
  { label: "Mosta", aliases: ["mosta"] },
  { label: "Qormi", aliases: ["qormi"] },
  { label: "Zabbar", aliases: ["zabbar", "żabbar"] },
  { label: "San Gwann", aliases: ["san gwann"] },
  { label: "Marsa", aliases: ["marsa"] },
  { label: "Attard", aliases: ["attard"] },
  { label: "Mgarr", aliases: ["mgarr", "mġarr"] },
  { label: "Swieqi", aliases: ["swieqi"] },
  { label: "Naxxar", aliases: ["naxxar"] },
  { label: "St Paul's Bay", aliases: ["st paul", "st. paul", "san pawl", "bugibba", "qawra"] },
  { label: "Mellieha", aliases: ["mellieha", "mellieħa"] },
  { label: "Paola", aliases: ["paola"] },
  { label: "Hamrun", aliases: ["hamrun", "ħamrun"] },
  { label: "Marsascala", aliases: ["marsascala", "marsaskala"] },
  { label: "Floriana", aliases: ["floriana"] },
  { label: "Pieta", aliases: ["pieta", "pietà"] },
  { label: "Santa Venera", aliases: ["santa venera", "mriehel", "mrieħel", "central business district"] },
  { label: "Luqa", aliases: ["luqa"] },
  { label: "Zebbug", aliases: ["zebbug", "żebbuġ"] },
  { label: "Balzan", aliases: ["balzan"] },
  { label: "Gozo", aliases: ["gozo", "għawdex", "ghawdex", "victoria gozo", "rabat gozo", "marsalforn", "xlendi", "nadur", "xewkija", "ghajnsielem", "għajnsielem"] },
];

/** Canonical Malta locality/region for free text, or null if none recognised. */
function recognizeMaltaLocality(text: string): string | null {
  const t = text.toLowerCase();
  for (const { label, aliases } of MALTA_LOCALITIES) {
    if (aliases.some((a) => t.includes(a))) return label;
  }
  return null;
}

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

/** True only for Malta-based roles. This board is Malta-only — never other countries. */
export function isMaltaJob(job: NormalizedJob): boolean {
  const text = `${job.location} ${job.title}`;
  if (recognizeMaltaLocality(text)) return true;
  return /\bmalta\b/i.test(text);
}

/**
 * Normalize an imported job's location to a Malta locality/region. By the time
 * this runs the job has already passed isMaltaJob, so it always returns a Malta
 * value: a recognised locality/region, or "Malta" when only the country is given.
 */
export function normalizeMaltaLocation(raw: string): string {
  return recognizeMaltaLocality(raw || "") ?? "Malta";
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

import { SECTORS, LOCATIONS } from "@/lib/constants";

/**
 * URL-safe slug for a sector/location label.
 * "iGaming" -> "igaming", "Finance & Banking" -> "finance-banking",
 * "St. Julian's" -> "st-julian-s".
 */
export function toSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve a slug back to its CANONICAL sector label from the source of truth.
 * Returns null for unknown slugs. This avoids the lossy round-trip of
 * reconstructing a label from a slug (which mangled "iGaming" -> "Igaming"
 * and broke the `.eq("sector", ...)` query against the database).
 */
export function getSectorBySlug(slug: string): string | null {
  return SECTORS.find((sector) => toSlug(sector) === slug) ?? null;
}

/** Resolve a slug back to its canonical location label, or null if unknown. */
export function getLocationBySlug(slug: string): string | null {
  return LOCATIONS.find((location) => toSlug(location) === slug) ?? null;
}

/**
 * Map a human job-type string to a schema.org employmentType enum value.
 * schema.org requires the enum (e.g. "FULL_TIME"), not the display string.
 */
export function mapEmploymentTypeToSchema(type: string | null | undefined): string {
  if (!type) return "FULL_TIME";
  const t = type.toLowerCase();
  if (t.includes("full")) return "FULL_TIME";
  if (t.includes("part")) return "PART_TIME";
  if (t.includes("contract") || t.includes("freelance")) return "CONTRACTOR";
  if (t.includes("temp")) return "TEMPORARY";
  if (t.includes("intern")) return "INTERN";
  if (t.includes("volunteer")) return "VOLUNTEER";
  return "OTHER";
}

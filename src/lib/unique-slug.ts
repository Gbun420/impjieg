export const DEFAULT_SLUG_BASE = "item";
export const DEFAULT_SLUG_SUFFIX_LENGTH = 4;
export const DEFAULT_SLUG_MAX_ATTEMPTS = 25;

export type SlugExists = (slug: string) => Promise<boolean>;

export function createSlugCandidate(baseSlug: string, suffixLength = DEFAULT_SLUG_SUFFIX_LENGTH) {
  const normalizedBaseSlug = baseSlug.trim() || DEFAULT_SLUG_BASE;
  const suffix = Math.random().toString(36).substring(2, 2 + suffixLength);

  return `${normalizedBaseSlug}-${suffix}`;
}

export async function generateUniqueSlug(
  baseSlug: string,
  slugExists: SlugExists,
  options?: {
    fallbackBaseSlug?: string;
    maxAttempts?: number;
    suffixLength?: number;
  }
) {
  const fallbackBaseSlug = options?.fallbackBaseSlug ?? DEFAULT_SLUG_BASE;
  const maxAttempts = options?.maxAttempts ?? DEFAULT_SLUG_MAX_ATTEMPTS;
  const suffixLength = options?.suffixLength ?? DEFAULT_SLUG_SUFFIX_LENGTH;
  const normalizedBaseSlug = baseSlug.trim() || fallbackBaseSlug;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = createSlugCandidate(normalizedBaseSlug, suffixLength);
    if (!(await slugExists(candidate))) {
      return candidate;
    }
  }

  throw new Error(`Failed to generate a unique slug after ${maxAttempts} attempts`);
}

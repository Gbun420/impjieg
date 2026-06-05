export const DEFAULT_SLUG_BASE = "item";
export const DEFAULT_SLUG_SUFFIX_LENGTH = 4;
export const DEFAULT_SLUG_MAX_ATTEMPTS = 25;

export type SlugExists = (slug: string) => Promise<boolean>;

export type UniqueInsertError = {
  code?: string;
  message: string;
};

export type UniqueInsertResult<T> = {
  data: T | null;
  error: UniqueInsertError | null;
};

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

export function isUniqueConstraintError(error: UniqueInsertError | null) {
  if (!error) {
    return false;
  }

  const message = error.message.toLowerCase();
  return error.code === "23505" || message.includes("duplicate key value");
}

export async function insertWithUniqueSlugRetry<T>({
  baseSlug,
  insert,
  maxAttempts = DEFAULT_SLUG_MAX_ATTEMPTS,
  suffixLength = DEFAULT_SLUG_SUFFIX_LENGTH,
}: {
  baseSlug: string;
  insert: (slug: string) => Promise<UniqueInsertResult<T>>;
  maxAttempts?: number;
  suffixLength?: number;
}): Promise<UniqueInsertResult<T>> {
  let lastError: UniqueInsertError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateSlug = createSlugCandidate(baseSlug, suffixLength);
    const result = await insert(candidateSlug);

    if (result.error && isUniqueConstraintError(result.error)) {
      lastError = result.error;
      continue;
    }

    return result;
  }

  return {
    data: null,
    error: lastError ?? {
      message: `Failed to generate a unique slug after ${maxAttempts} attempts`,
    },
  };
}

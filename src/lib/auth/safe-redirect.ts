export function safeRedirectPath(
  input: string | null | undefined,
  fallback: string,
  options?: { allowAdmin?: boolean }
): string {
  if (!input || typeof input !== "string") {
    return fallback;
  }

  const trimmed = input.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return fallback;
  }

  if (trimmed.startsWith("//")) {
    return fallback;
  }

  if (trimmed.includes("\\")) {
    return fallback;
  }

  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallback;
  }

  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  const adminPaths = ["/admin", "/admin/"];
  if (!options?.allowAdmin) {
    for (const adminPath of adminPaths) {
      if (trimmed === adminPath || trimmed.startsWith(adminPath + "/")) {
        return fallback;
      }
    }
  }

  try {
    const url = new URL(trimmed, "http://localhost");
    if (url.pathname !== trimmed) {
      return fallback;
    }
  } catch {
    return fallback;
  }

  return trimmed;
}

export function resolvePostLoginDestination(
  redirectUrl: string | null,
  accountType: "candidate" | "employer" | "admin",
  hasEmployerProfile: boolean
): string {
  const safe = safeRedirectPath(redirectUrl, "/");

  if (safe !== "/") {
    return safe;
  }

  if (accountType === "admin") return "/admin/dashboard";
  if (accountType === "employer") return "/employer/dashboard";
  return "/candidate/dashboard";
}

export function buildSafeRedirectUrl(
  basePath: string,
  searchParams: Record<string, string>
): string {
  const url = new URL(basePath, "http://localhost");
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.pathname + url.search;
}
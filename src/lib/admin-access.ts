function getSuperAdminEmails(): readonly string[] {
  const configured = process.env.SUPER_ADMIN_EMAILS;
  if (configured) {
    return configured.split(",").map((e) => e.trim().toLowerCase()) as readonly string[];
  }
  return ["info@dopaminedigital.co"] as const;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isSuperAdminEmail(email: string) {
  const emails = getSuperAdminEmails();
  return emails.includes(normalizeEmail(email) as (typeof emails)[number]);
}

export function getSuperAdminEmailsList(): readonly string[] {
  return getSuperAdminEmails();
}

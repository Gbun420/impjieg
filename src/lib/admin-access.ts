function getSuperAdminEmails(): readonly string[] {
  const configured = process.env.SUPER_ADMIN_EMAILS;
  const primaryAdminEmail = process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL?.trim().toLowerCase();

  const emails = new Set<string>();

  if (configured) {
    for (const email of configured.split(",")) {
      const normalized = email.trim().toLowerCase();
      if (normalized) {
        emails.add(normalized);
      }
    }
  }

  if (primaryAdminEmail) {
    emails.add(primaryAdminEmail);
  }

  if (emails.size > 0) {
    return Array.from(emails);
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

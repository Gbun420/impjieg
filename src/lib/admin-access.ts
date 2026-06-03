const SUPER_ADMIN_EMAILS = [
  "bundyglenn@gmail.com",
  "anthonymackaymt@gmail.com",
] as const;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isSuperAdminEmail(email: string) {
  return SUPER_ADMIN_EMAILS.includes(normalizeEmail(email) as (typeof SUPER_ADMIN_EMAILS)[number]);
}

export { SUPER_ADMIN_EMAILS };

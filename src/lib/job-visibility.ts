export function isJobPubliclyLive(
  job: { status: string; expires_at: string | null },
  now = new Date()
) {
  if (job.status !== "active") {
    return false;
  }

  if (!job.expires_at) {
    return true;
  }

  return Date.parse(job.expires_at) >= now.getTime();
}

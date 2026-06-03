import {
  buildAbsoluteUrl,
  buildJobAlertUnsubscribeUrl,
  escapeHtml,
  safeUrlHref,
} from "@/lib/email-security";

type AlertFilter = {
  sectors: string[];
  job_type: string | null;
  remote_type: string | null;
  salary_min: number | null;
};

type JobForAlert = {
  sector: string;
  job_type: string;
  remote_type: string | null;
  salary_min: number | null;
};

type JobDigestItem = {
  title: string;
  employerName: string;
  location: string;
  jobType: string;
  remoteType: string | null;
  salaryMin: number | null;
  salaryMax?: number | null;
  url: string;
};

function formatSalary(value: number | null | undefined) {
  if (!value) {
    return "Salary not specified";
  }

  return `EUR ${value.toLocaleString()}`;
}

export function jobMatchesAlert(alert: AlertFilter, job: JobForAlert) {
  if (alert.sectors.length > 0 && !alert.sectors.includes(job.sector)) {
    return false;
  }

  if (alert.job_type && alert.job_type !== job.job_type) {
    return false;
  }

  if (alert.remote_type && alert.remote_type !== job.remote_type) {
    return false;
  }

  if (alert.salary_min && (!job.salary_min || job.salary_min < alert.salary_min)) {
    return false;
  }

  return true;
}

export function buildJobAlertDigestEmail({
  alertId,
  jobs,
  baseUrl,
}: {
  alertId: string;
  jobs: JobDigestItem[];
  baseUrl: string;
}) {
  const unsubscribeUrl = buildJobAlertUnsubscribeUrl({ baseUrl, alertId });
  const browseJobsUrl = buildAbsoluteUrl(baseUrl, "/jobs");

  const jobsHtml = jobs
    .map((job) => {
      const salary = job.salaryMin
        ? `${formatSalary(job.salaryMin)}${job.salaryMax ? ` - ${formatSalary(job.salaryMax)}` : "+"}`
        : "Salary not specified";
      const jobUrl = safeUrlHref(job.url, "#");

      return `
        <li style="margin-bottom:16px;">
          <a href="${jobUrl}" style="font-weight:600;color:#111827;text-decoration:none;">${escapeHtml(job.title)}</a><br>
          <span style="color:#4b5563;">${escapeHtml(job.employerName)} · ${escapeHtml(job.location)} · ${escapeHtml(job.jobType)}${job.remoteType ? ` · ${escapeHtml(job.remoteType)}` : ""}</span><br>
          <span style="color:#0f766e;">${escapeHtml(salary)}</span>
        </li>
      `;
    })
    .join("");

  return {
    subject: "New jobs matching your Impjieg alert",
    html: `
      <h2>New jobs matching your alert</h2>
      <p>We found ${jobs.length} new job${jobs.length === 1 ? "" : "s"} that match your preferences.</p>
      <ul style="padding-left:18px;">
        ${jobsHtml}
      </ul>
      <p><a href="${browseJobsUrl}">Browse all jobs on Impjieg</a></p>
      <hr>
      <p style="font-size:12px;color:#6b7280;">
        You are receiving this email because you created a job alert on Impjieg.
        <a href="${unsubscribeUrl}">Unsubscribe</a>
      </p>
    `,
  };
}

export function buildJobAlertConfirmationEmail({
  alertId,
  baseUrl,
}: {
  alertId: string;
  baseUrl: string;
}) {
  const unsubscribeUrl = buildJobAlertUnsubscribeUrl({ baseUrl, alertId });
  const browseJobsUrl = buildAbsoluteUrl(baseUrl, "/jobs");

  return {
    subject: "Your Impjieg job alert is active",
    html: `
      <h2>Your job alert is active</h2>
      <p>We will email you when new jobs match your alert preferences.</p>
      <p><a href="${browseJobsUrl}">Browse the latest jobs</a></p>
      <hr>
      <p style="font-size:12px;color:#6b7280;">
        If you no longer want these alerts, you can
        <a href="${unsubscribeUrl}">unsubscribe here</a>.
      </p>
    `,
  };
}

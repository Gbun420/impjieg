import {
  buildAbsoluteUrl,
  buildJobAlertUnsubscribeUrl,
  escapeHtml,
  safeUrlHref,
} from "@/lib/email-security";
import { buildBrandedEmailShell } from "@/lib/email-branding";

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
        <li style="margin:0 0 14px;padding:16px;border:1px solid #DBE4F0;border-radius:16px;background:#FFFFFF;list-style:none;">
          <a href="${jobUrl}" style="font-weight:800;color:#0B1220;text-decoration:none;">${escapeHtml(job.title)}</a><br>
          <span style="display:inline-block;margin-top:6px;color:#64748B;">${escapeHtml(job.employerName)} · ${escapeHtml(job.location)} · ${escapeHtml(job.jobType)}${job.remoteType ? ` · ${escapeHtml(job.remoteType)}` : ""}</span><br>
          <span style="display:inline-block;margin-top:8px;color:#1E63FF;font-weight:800;">${escapeHtml(salary)}</span>
        </li>
      `;
    })
    .join("");

  return {
    subject: "New jobs matching your Impjieg alert",
    html: buildBrandedEmailShell({
      eyebrow: "Job alert",
      title: "New roles match your alert",
      intro: `We found ${jobs.length} new job${jobs.length === 1 ? "" : "s"} aligned with your preferences.`,
      bodyHtml: `<ul style="margin:0;padding:0;">${jobsHtml}</ul>`,
      cta: {
        label: "Browse all jobs",
        href: browseJobsUrl,
      },
      footerHtml: `You are receiving this email because you created a job alert on Impjieg. <a href="${unsubscribeUrl}" style="color:#1E63FF;">Unsubscribe</a>`,
    }),
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
    html: buildBrandedEmailShell({
      eyebrow: "Alert activated",
      title: "Your job alert is active",
      intro: "We will email you when new jobs match your alert preferences.",
      bodyHtml: `<p style="margin:0;color:#334155;line-height:1.7;">Browse the latest jobs any time, or wait for the next matching digest.</p>`,
      cta: {
        label: "Browse the latest jobs",
        href: browseJobsUrl,
      },
      footerHtml: `If you no longer want these alerts, you can <a href="${unsubscribeUrl}" style="color:#1E63FF;">unsubscribe here</a>.`,
    }),
  };
}

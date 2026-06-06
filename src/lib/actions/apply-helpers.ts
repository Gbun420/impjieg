import { escapeHtml, sanitizeEmailHeader, safeUrlHref } from "@/lib/email-security";
import { buildBrandedEmailShell } from "@/lib/email-branding";

export function buildEmployerNotificationEmail({
  employerEmail,
  candidateEmail,
  candidateName,
  candidatePhone,
  coverLetter,
  cvUrl,
  jobTitle,
  dashboardUrl,
}: {
  employerEmail: string;
  candidateEmail: string;
  candidateName: string;
  candidatePhone?: string | null;
  coverLetter?: string | null;
  cvUrl?: string | null;
  jobTitle: string;
  dashboardUrl: string;
}) {
  const safeCandidateName = escapeHtml(candidateName);
  const safeCandidateEmail = escapeHtml(candidateEmail);
  const safeCandidatePhone = candidatePhone ? escapeHtml(candidatePhone) : null;
  const safeJobTitle = escapeHtml(jobTitle);
  const safeCoverLetter = coverLetter ? escapeHtml(coverLetter).replace(/\n/g, "<br>") : null;
  const safeCvUrl = cvUrl ? safeUrlHref(cvUrl) : null;
  const safeDashboardUrl = safeUrlHref(dashboardUrl, "https://impjieg.vercel.app");

  return {
    to: [sanitizeEmailHeader(employerEmail)],
    replyTo: [sanitizeEmailHeader(candidateEmail)],
    subject: sanitizeEmailHeader(`New Application: ${candidateName} applied for ${jobTitle}`),
    html: buildBrandedEmailShell({
      eyebrow: "Employer pipeline",
      title: "New application received",
      intro: `${candidateName} applied for ${jobTitle}.`,
      bodyHtml: `
        <div style="border:1px solid #DBE4F0;border-radius:18px;background:#F5F8FC;padding:18px;">
          <p style="margin:0 0 10px;"><strong>Candidate:</strong> ${safeCandidateName}</p>
          <p style="margin:0 0 10px;"><strong>Email:</strong> ${safeCandidateEmail}</p>
          ${safeCandidatePhone ? `<p style="margin:0 0 10px;"><strong>Phone:</strong> ${safeCandidatePhone}</p>` : ""}
          <p style="margin:0;"><strong>Job:</strong> ${safeJobTitle}</p>
        </div>
        ${safeCoverLetter ? `<h2 style="margin:24px 0 8px;font-size:16px;">Cover letter</h2><p style="margin:0;color:#334155;line-height:1.7;">${safeCoverLetter}</p>` : ""}
        ${safeCvUrl ? `<p style="margin:18px 0 0;"><a href="${safeCvUrl}" style="color:#1E63FF;font-weight:700;">View CV</a></p>` : ""}
      `,
      cta: {
        label: "View in dashboard",
        href: safeDashboardUrl,
      },
    }),
  };
}

export function buildCandidateConfirmationEmail({
  candidateName,
  jobTitle,
  employerName,
}: {
  candidateName: string;
  jobTitle: string;
  employerName: string;
}) {
  const safeCandidateName = escapeHtml(candidateName);
  const safeJobTitle = escapeHtml(jobTitle);
  const safeEmployerName = escapeHtml(employerName);

  return {
    subject: sanitizeEmailHeader(`Application Received: ${jobTitle} at ${employerName}`),
    html: buildBrandedEmailShell({
      eyebrow: "Application confirmation",
      title: "Application received",
      intro: `Thanks for applying to ${employerName}.`,
      bodyHtml: `
        <p style="margin:0 0 14px;color:#334155;line-height:1.7;">Hi ${safeCandidateName},</p>
        <p style="margin:0 0 14px;color:#334155;line-height:1.7;">Your application for <strong>${safeJobTitle}</strong> at <strong>${safeEmployerName}</strong> has been sent.</p>
        <p style="margin:0;color:#334155;line-height:1.7;">The employer has been notified and will contact you directly if they wish to proceed.</p>
      `,
      footerHtml: "This is an automated confirmation from Impjieg.",
    }),
  };
}

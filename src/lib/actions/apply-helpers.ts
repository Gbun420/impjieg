import { escapeHtml, sanitizeEmailHeader, safeUrlHref } from "@/lib/email-security";

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
    html: `
      <h2>New Application Received</h2>
      <p><strong>Candidate:</strong> ${safeCandidateName}</p>
      <p><strong>Email:</strong> ${safeCandidateEmail}</p>
      ${safeCandidatePhone ? `<p><strong>Phone:</strong> ${safeCandidatePhone}</p>` : ""}
      <p><strong>Job:</strong> ${safeJobTitle}</p>
      ${safeCoverLetter ? `<h3>Cover Letter</h3><p>${safeCoverLetter}</p>` : ""}
      ${safeCvUrl ? `<p><a href="${safeCvUrl}">View CV</a></p>` : ""}
      <hr>
      <p><a href="${safeDashboardUrl}">View in Dashboard</a></p>
    `,
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
    html: `
      <h2>Application Received</h2>
      <p>Hi ${safeCandidateName},</p>
      <p>Thank you for applying for the <strong>${safeJobTitle}</strong> position at <strong>${safeEmployerName}</strong>.</p>
      <p>The employer has been notified of your application and will contact you directly if they wish to proceed.</p>
      <p>Good luck with your application!</p>
      <hr>
      <p style="font-size:12px;color:#6b7280;">
        This is an automated confirmation from Impjieg.
      </p>
    `,
  };
}

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
  return {
    to: [employerEmail],
    replyTo: [candidateEmail],
    subject: `New Application: ${candidateName} applied for ${jobTitle}`,
    html: `
      <h2>New Application Received</h2>
      <p><strong>Candidate:</strong> ${candidateName}</p>
      <p><strong>Email:</strong> ${candidateEmail}</p>
      ${candidatePhone ? `<p><strong>Phone:</strong> ${candidatePhone}</p>` : ""}
      <p><strong>Job:</strong> ${jobTitle}</p>
      ${coverLetter ? `<h3>Cover Letter</h3><p>${coverLetter.replace(/\n/g, "<br>")}</p>` : ""}
      ${cvUrl ? `<p><a href="${cvUrl}">View CV</a></p>` : ""}
      <hr>
      <p><a href="${dashboardUrl}">View in Dashboard</a></p>
    `,
  };
}

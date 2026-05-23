export function buildEmployerPromotionLinks({
  baseUrl,
  employerSlug,
  jobSlug,
  title,
}: {
  baseUrl: string;
  employerSlug: string;
  jobSlug: string;
  title: string;
}) {
  const jobUrl = `${baseUrl}/jobs/${employerSlug}/${jobSlug}`;
  const shareText = `We are hiring: ${title}`;
  const emailBody = `We are hiring for ${title}. View the role here:\n\n${jobUrl}`;

  return {
    jobUrl,
    linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`,
    xUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`,
    emailUrl: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(emailBody)}`,
  };
}

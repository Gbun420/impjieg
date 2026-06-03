type TrustSignalApplication = {
  status: string;
  created_at: string;
  updated_at: string;
};

export function deriveEmployerTrustSignals({
  activeJobsCount,
  applications,
  now = new Date(),
}: {
  activeJobsCount: number;
  applications: TrustSignalApplication[];
  now?: Date;
}) {
  const responded = applications.filter((app) => app.status !== "new");
  const responseHours = responded.map((app) =>
    Math.max(
      0,
      (Date.parse(app.updated_at) - Date.parse(app.created_at)) / (60 * 60 * 1000)
    )
  );

  const averageResponseHours = responseHours.length
    ? Math.round(responseHours.reduce((sum, hours) => sum + hours, 0) / responseHours.length)
    : null;

  const staleNewApplications = applications.filter(
    (app) =>
      app.status === "new" &&
      now.getTime() - Date.parse(app.created_at) > 72 * 60 * 60 * 1000
  ).length;

  let responseBadge = "No response data";

  if (averageResponseHours !== null) {
    if (averageResponseHours <= 48) {
      responseBadge = "Responsive";
    } else if (averageResponseHours <= 96) {
      responseBadge = "Moderate response time";
    } else {
      responseBadge = "Slow to respond";
    }
  }

  return {
    averageResponseHours,
    staleNewApplications,
    responseBadge,
    hasFreshJobs: activeJobsCount > 0,
  };
}

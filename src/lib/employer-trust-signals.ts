type TrustSignalApplication = {
  status: string;
  created_at: string;
  updated_at: string;
};

export function deriveEmployerTrustSignals({
  activeJobsCount,
  applications,
  expectedResponseDays,
  now = new Date(),
}: {
  activeJobsCount: number;
  applications: TrustSignalApplication[];
  expectedResponseDays?: number | null;
  now?: Date;
}) {
  const responded = applications.filter((app) => app.status !== "new");
  const responseHours = responded.map((app) =>
    Math.max(
      0,
      (Date.parse(app.updated_at) - Date.parse(app.created_at)) /
        (60 * 60 * 1000)
    )
  );

  const averageResponseHours = responseHours.length
    ? Math.round(
        responseHours.reduce((sum, hours) => sum + hours, 0) /
          responseHours.length
      )
    : null;

  const staleNewApplications = applications.filter(
    (app) =>
      app.status === "new" &&
      now.getTime() - Date.parse(app.created_at) > 72 * 60 * 60 * 1000
  ).length;

  let responseBadge: string;
  let responseLabel: string;
  let responseDetail: string;
  let responseVariant: "success" | "warning" | "outline" | "info";

  if (averageResponseHours !== null) {
    if (averageResponseHours <= 48) {
      responseBadge = "Responsive";
      responseLabel = "Responsive";
      responseDetail = `Avg. first response in ${averageResponseHours}h`;
      responseVariant = "success";
    } else if (averageResponseHours <= 96) {
      responseBadge = "Moderate response time";
      responseLabel = "Moderate response time";
      responseDetail = `Avg. first response in ${averageResponseHours}h`;
      responseVariant = "warning";
    } else {
      responseBadge = "Slow to respond";
      responseLabel = "Slow to respond";
      responseDetail = `Avg. first response in ${averageResponseHours}h`;
      responseVariant = "warning";
    }
  } else if (expectedResponseDays && expectedResponseDays > 0) {
    responseBadge = "Expected response";
    responseLabel = "Employer responds";
    responseDetail = `Expected within ${expectedResponseDays} day${expectedResponseDays === 1 ? "" : "s"}`;
    responseVariant = "info";
  } else {
    responseBadge = "No response data";
    responseLabel = "No response history yet";
    responseDetail = "No response history available";
    responseVariant = "outline";
  }

  return {
    averageResponseHours,
    staleNewApplications,
    responseBadge,
    responseLabel,
    responseDetail,
    responseVariant,
    hasFreshJobs: activeJobsCount > 0,
  };
}

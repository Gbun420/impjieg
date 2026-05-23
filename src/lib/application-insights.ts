type ApplicationInsightSource = {
  status: string;
  created_at: string;
  updated_at: string;
};

export function deriveApplicationInsights(
  applications: ApplicationInsightSource[],
  now = new Date()
) {
  const newApplications = applications.filter((app) => app.status === "new");
  const staleNewApplications = newApplications.filter((app) => {
    return now.getTime() - Date.parse(app.created_at) > 72 * 60 * 60 * 1000;
  });

  const respondedApplications = applications.filter((app) => app.status !== "new");
  const firstActionHours = respondedApplications.map((app) => {
    const hours = (Date.parse(app.updated_at) - Date.parse(app.created_at)) / (60 * 60 * 1000);
    return Math.max(hours, 0);
  });

  return {
    newApplications: newApplications.length,
    staleNewApplications: staleNewApplications.length,
    respondedApplications: respondedApplications.length,
    averageFirstActionHours: firstActionHours.length
      ? Math.round(firstActionHours.reduce((sum, hours) => sum + hours, 0) / firstActionHours.length)
      : null,
  };
}

type JobInsightSource = {
  sector: string;
  is_featured: boolean;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
};

export function deriveCompanyInsights(jobs: JobInsightSource[]) {
  const sectorCounts = new Map<string, number>();
  const salaryMins: number[] = [];
  const salaryMaxs: number[] = [];

  for (const job of jobs) {
    sectorCounts.set(job.sector, (sectorCounts.get(job.sector) || 0) + 1);

    if (job.salary_min) {
      salaryMins.push(job.salary_min);
    }

    if (job.salary_max) {
      salaryMaxs.push(job.salary_max);
    }
  }

  const topSectors = [...sectorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sector]) => sector);

  const latestPostingDate = [...jobs]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0]
    ?.created_at ?? null;

  const activeRoles = jobs.length;
  const salaryTransparentRoles = jobs.filter(
    (job) => job.salary_min || job.salary_max
  ).length;

  return {
    activeRoles,
    featuredRoles: jobs.filter((job) => job.is_featured).length,
    salaryTransparentRoles,
    topSectors,
    averageSalaryMin: salaryMins.length
      ? Math.round(
          salaryMins.reduce((sum, value) => sum + value, 0) / salaryMins.length
        )
      : null,
    averageSalaryMax: salaryMaxs.length
      ? Math.round(
          salaryMaxs.reduce((sum, value) => sum + value, 0) / salaryMaxs.length
        )
      : null,
    latestPostingDate,
    hasActiveJobs: activeRoles > 0,
    hasSalaryData: salaryTransparentRoles > 0,
    salaryCoveragePercent:
      activeRoles > 0
        ? Math.round((salaryTransparentRoles / activeRoles) * 100)
        : 0,
  };
}

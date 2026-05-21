type CandidateProfileFilters = {
  sectors?: string[] | null;
  job_types?: string[] | null;
  remote_preference?: string | null;
  desired_salary_min?: number | null;
};

type FilterQuery = {
  in(column: string, values: string[]): FilterQuery;
  eq(column: string, value: string): FilterQuery;
  gte(column: string, value: number): FilterQuery;
};

export function applyCandidateJobFilters<T extends FilterQuery>(
  query: T,
  profile: CandidateProfileFilters | null | undefined
) {
  if (profile?.sectors?.length) {
    query = query.in("sector", profile.sectors) as T;
  }

  if (profile?.job_types?.length) {
    query = query.in("job_type", profile.job_types) as T;
  }

  if (
    profile?.remote_preference &&
    profile.remote_preference !== "No preference"
  ) {
    query = query.eq("remote_type", profile.remote_preference) as T;
  }

  if (profile?.desired_salary_min) {
    query = query.gte("salary_max", profile.desired_salary_min) as T;
  }

  return query;
}

export function resolvePostLoginDestination({
  redirectUrl,
  hasEmployerProfile,
}: {
  redirectUrl: string | null;
  hasEmployerProfile: boolean;
}) {
  if (redirectUrl) {
    return redirectUrl;
  }

  return hasEmployerProfile ? "/employer/dashboard" : "/candidate/dashboard";
}

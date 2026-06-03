type FilterableApplication = {
  id: string;
  status: string;
  created_at: string;
  candidate_name: string;
  candidate_email: string;
  jobs: { title: string } | null;
};

export function filterApplications<T extends FilterableApplication>(
  applications: T[],
  {
    search,
    attentionOnly,
  }: {
    search: string;
    attentionOnly: boolean;
  },
  now = new Date()
) {
  const normalizedSearch = search.trim().toLowerCase();

  return applications.filter((app) => {
    if (attentionOnly) {
      const isStaleNew =
        app.status === "new" &&
        now.getTime() - Date.parse(app.created_at) > 72 * 60 * 60 * 1000;

      if (!isStaleNew) {
        return false;
      }
    }

    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      app.candidate_name,
      app.candidate_email,
      app.jobs?.title || "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });
}

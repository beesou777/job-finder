export interface GetJobsOptions {
  jobType?: string | null;
  urgency?: string | null;
  type?: string | null;
  categoryId?: string | null;
  location?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}

export interface JobItem {
  id: string;
  [key: string]: unknown;
}

function query(options: object) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options) as Array<[
    string,
    string | number | null | undefined,
  ]>) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

/** Browser-only API client. Requests go through Next's /api rewrite to the backend. */
export async function getJobs(options: GetJobsOptions = {}) {
  const params = query(options);
  const response = await fetch(`/api/jobs${params ? `?${params}` : ""}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load jobs (${response.status})`);
  const payload = await response.json();
  return { jobs: (payload.data || []) as JobItem[], total: payload.total || payload.data?.length || 0 };
}

export async function getCategories(limit = 100) {
  const response = await fetch(`/api/categories?limit=${limit}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load categories (${response.status})`);
  const payload = await response.json();
  return payload.data || [];
}

export async function getRemoteJobs(options: { page?: number; limit?: number; search?: string } = {}) {
  const params = query(options);
  const response = await fetch(`/api/remote-jobs${params ? `?${params}` : ""}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load remote jobs (${response.status})`);
  const payload = await response.json();
  const rawData = payload.data ?? payload;
  const jobs = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.jobs)
      ? rawData.jobs
      : Array.isArray(payload.jobs)
        ? payload.jobs
        : [];
  const total =
    rawData?.pagination?.total ??
    payload.pagination?.total ??
    payload.total ??
    rawData?.total ??
    jobs.length;
  const pagination = rawData?.pagination ?? payload.pagination ?? null;
  return { jobs, total: typeof total === "number" ? total : 0, pagination };
}

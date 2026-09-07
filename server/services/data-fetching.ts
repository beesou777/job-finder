import { cache } from "react";

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:4000/api";

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
  title: string;
  company?: string;
  location?: string;
  source: string;
  category?: any;
  type?: "job" | "internship";
  jobType?: string;
  salaryText?: string;
  deadline?: string;
  expiresAt?: string | Date;
  applyUrl: string;
  createdAt?: string;
  postedAt?: string | Date;
  lastVerifiedAt?: string | Date;
  deadlineConfidence?: "exact" | "relative" | "inferred" | "unknown";
  [key: string]: any;
}

export async function getJobs(
  options: GetJobsOptions = {},
): Promise<{ jobs: JobItem[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (options.limit !== undefined && options.limit !== null) params.set("limit", String(options.limit));
    if (options.offset !== undefined && options.offset !== null) params.set("offset", String(options.offset));
    if (options.search) params.set("search", options.search);
    if (options.location) params.set("location", options.location);
    if (options.jobType) params.set("jobType", options.jobType);
    if (options.urgency) params.set("urgency", options.urgency);
    if (options.type) params.set("type", options.type);
    if (options.categoryId) params.set("categoryId", options.categoryId);

    const qs = params.toString();
    const url = `${API_BASE}/jobs${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ["jobs"] },
    });

    if (!res.ok) {
      console.error(`Failed to fetch jobs: ${res.status}`);
      return { jobs: [], total: 0 };
    }

    const json = await res.json();
    const rawData = json.data ?? json;
    const jobs = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.jobs)
        ? rawData.jobs
        : Array.isArray(json.jobs)
          ? json.jobs
          : [];
    const total =
      typeof json.total === "number"
        ? json.total
        : typeof rawData?.total === "number"
          ? rawData.total
          : jobs.length;

    return { jobs, total };
  } catch (error) {
    console.error("Error in getJobs:", error);
    return { jobs: [], total: 0 };
  }
}

export const getJobById = cache(async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`, {
      next: { revalidate: 300, tags: ["job-detail"] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Error in getJobById:", error);
    return null;
  }
});

export const getCategoryBySlug = cache(async (slug: string) => {
  try {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300, tags: ["category-detail"] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Error in getCategoryBySlug:", error);
    return null;
  }
});


export const getLinkedInJobDetails = cache(async (id: number | string) => {
  try {
    const res = await fetch(`${API_BASE}/linkedin-jobs/${id}`, {
      next: { revalidate: 3600, tags: ["linkedin-jobs"] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Error in getLinkedInJobDetails:", error);
    return null;
  }
});

export const getRemoteJobs = cache(
  async (options: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.page !== undefined) params.set("page", String(options.page));
      if (options.limit !== undefined) params.set("limit", String(options.limit));
      if (options.search) params.set("search", options.search);
      if (options.search) {
        params.set("search", options.search);
        params.set("q", options.search);
      }

      const qs = params.toString();
      const url = `${API_BASE}/remote-jobs${qs ? `?${qs}` : ""}`;
      const res = await fetch(url, {
        next: { revalidate: 3600, tags: ["remote-jobs"] },
      });

      if (!res.ok) {
        return { jobs: [], total: 0, pagination: null };
      }

      const json = await res.json();
      const rawData = json.data ?? json;
      const jobs = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.jobs)
          ? rawData.jobs
          : Array.isArray(json.jobs)
            ? json.jobs
            : [];
      const total =
        rawData?.pagination?.total ??
        json.pagination?.total ??
        json.total ??
        rawData?.total ??
        jobs.length;
      const pagination = rawData?.pagination ?? json.pagination ?? null;

      return { jobs, total: typeof total === "number" ? total : 0, pagination };
    } catch (error) {
      console.error("Error in getRemoteJobs:", error);
      return { jobs: [], total: 0, pagination: null };
    }
  },
);

export const getRemoteJobDetails = cache(async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/remote-jobs/${encodeURIComponent(id)}`, {
      next: { revalidate: 3600, tags: ["remote-jobs"] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Error in getRemoteJobDetails:", error);
    return null;
  }
});

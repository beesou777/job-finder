"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { LinkedInJobsFiltering } from "./LinkedInJobsFiltering";
import { LinkedInJobsList, LinkedInJobsSkeleton } from "./LinkedInJobsList";

const ITEMS_PER_PAGE = 20;

type Job = Record<string, unknown> & { id: string | number; title: string };
type FilterOption = { value: string; count?: number };
type Filters = { companies: FilterOption[]; places: FilterOption[] };
type JobsResponse = { jobs: Job[]; total: number; filters: Filters };

const emptyResponse: JobsResponse = {
  jobs: [],
  total: 0,
  filters: { companies: [], places: [] },
};

function normalizeResponse(payload: unknown): JobsResponse {
  if (!payload || typeof payload !== "object") return emptyResponse;

  const root = payload as Record<string, unknown>;
  const data = root.data;
  const body =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : root;
  const jobs = Array.isArray(data) ? data : body.jobs;
  const rawFilters = body.filters ?? root.filters;
  const filters =
    rawFilters && typeof rawFilters === "object" ? (rawFilters as Record<string, unknown>) : {};
  const total = body.total ?? root.total;

  const normalizeFilterOptions = (items: unknown): FilterOption[] =>
    Array.isArray(items)
      ? items.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const option = item as Record<string, unknown>;
          const value = option.value ?? option.name;
          return typeof value === "string"
            ? [{ value, ...(typeof option.count === "number" ? { count: option.count } : {}) }]
            : [];
        })
      : [];

  return {
    jobs: Array.isArray(jobs) ? (jobs as Job[]) : [],
    total: typeof total === "number" && Number.isFinite(total) ? total : 0,
    filters: {
      companies: normalizeFilterOptions(filters.companies),
      places: normalizeFilterOptions(filters.places),
    },
  };
}

export function LinkedInJobsClient() {
  const searchParams = useSearchParams();
  const query = searchParams?.toString() ?? "";
  const pageValue = Number.parseInt(searchParams?.get("page") ?? "1", 10);
  const page = Number.isFinite(pageValue) ? Math.min(500, Math.max(1, pageValue)) : 1;
  const [data, setData] = useState<JobsResponse>(emptyResponse);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(query);
    params.set("limit", String(ITEMS_PER_PAGE));
    params.set("offset", String((page - 1) * ITEMS_PER_PAGE));

    async function loadJobs() {
      setLoading(true);
      setError(null);

      try {
        // The browser calls this same-origin rewrite, so it is visible in DevTools
        // Network while avoiding a cross-origin browser request to the backend.
        const response = await fetch(`/api/linkedin-jobs?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`The jobs service returned ${response.status}.`);
        setData(normalizeResponse(await response.json()));
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setData(emptyResponse);
        setError(cause instanceof Error ? cause.message : "Unable to load LinkedIn jobs.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadJobs();
    return () => controller.abort();
  }, [page, query]);

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100">
      <LinkedInJobsFiltering companies={data.filters.companies} places={data.filters.places} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">
              External job discovery
            </p>
            <h1 className="text-4xl font-black tracking-tight text-zinc-50">LinkedIn Jobs</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Search LinkedIn-sourced opportunities by company, location, and posting date, then
              verify details on the source before applying.
            </p>
          </div>
          <p className="text-sm font-bold text-zinc-400">
            Total {data.total.toLocaleString()} Jobs found
          </p>
        </div>

        {loading ? (
          <LinkedInJobsSkeleton />
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            <AlertCircle className="h-5 w-5" />
            <p>Could not load jobs: {error}</p>
          </div>
        ) : (
          <LinkedInJobsList
            jobs={data.jobs}
            total={data.total}
            page={page}
            search={searchParams?.get("search") ?? undefined}
            company={searchParams?.get("company") ?? undefined}
            place={searchParams?.get("place") ?? undefined}
            datePosted={searchParams?.get("datePosted") ?? undefined}
          />
        )}
      </div>
    </div>
  );
}

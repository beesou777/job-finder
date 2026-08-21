import axios from "axios";
import { JobData, calculateExpirationDate, detectJobType } from "../core/types";

const API_URL = "https://www.kumarijob.com/search_mobile";

type KumariApiJob = {
  id: number;
  job_title: string;
  job_type?: string;
  job_location?: string;
  salary?: string;
  days_left?: string;
  job_url?: string;
  company_name?: string;
};

type KumariApiResponse = {
  data?: KumariApiJob[];
  meta?: { current_page?: number; last_page?: number };
  links?: { next?: string | null; last?: string | null };
};

function absoluteUrl(url: string) {
  return url.startsWith("http")
    ? url
    : `https://www.kumarijob.com${url.startsWith("/") ? "" : "/"}${url}`;
}

function mapJob(item: KumariApiJob): JobData | null {
  if (!item.job_title || !item.job_url) return null;
  const applyUrl = absoluteUrl(item.job_url);
  const deadline = item.days_left?.trim();
  const expiresAt = calculateExpirationDate(deadline);
  if (expiresAt && expiresAt <= new Date()) return null;
  return {
    title: item.job_title.trim(),
    applyUrl,
    company: item.company_name?.trim(),
    location: item.job_location?.trim(),
    salaryText: item.salary?.trim(),
    deadline,
    expiresAt,
    jobType: item.job_type?.trim(),
    type: detectJobType(item.job_title, applyUrl, item.job_type),
    source: "kumarijob",
    sourceJobId: String(item.id),
  };
}

export async function scrapeKumariJobList(): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  preFetchedJobs?: JobData[];
}> {
  const jobs: JobData[] = [];
  try {
    let lastPage = 1;
    for (let page = 1; page <= Math.min(lastPage, 100); page++) {
      const response = await axios.get(`${API_URL}?page=${page}`, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
        timeout: 15000,
      });
      const payload = response.data as KumariApiResponse | KumariApiJob[];
      const items: KumariApiJob[] = Array.isArray(payload) ? payload : payload.data || [];
      if (!Array.isArray(payload)) {
        lastPage = Number(
          payload.meta?.last_page ||
            new URL(payload.links?.last || `${API_URL}?page=${page}`).searchParams.get("page") ||
            page,
        );
      }
      if (!items?.length) break;
      jobs.push(...items.map(mapJob).filter((job): job is JobData => Boolean(job)));
      if (page >= lastPage) break;
    }
    const unique = Array.from(
      new Map(jobs.map((job) => [job.sourceJobId || job.applyUrl, job])).values(),
    );
    console.log(`✅ KumariJob API: Fetched ${unique.length} active jobs`);
    return { detailUrls: [], hasMore: false, preFetchedJobs: unique };
  } catch (error: any) {
    console.error(`❌ KumariJob API failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}

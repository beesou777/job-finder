import axios from "axios";
import { JobResult, JobSchema } from "@/server/services/types";

type KumariApiJob = {
  id: number;
  job_title: string;
  job_location?: string;
  job_url?: string;
  company_name?: string;
  days_left?: string;
};
export async function scrapeKumariJob(): Promise<JobResult[]> {
  try {
    const items: KumariApiJob[] = [];
    let lastPage = 1;
    for (let page = 1; page <= Math.min(lastPage, 100); page++) {
      const response = await axios.get(`https://www.kumarijob.com/search_mobile?page=${page}`, {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
        timeout: 15000,
      });
      const payload = response.data;
      const pageItems: KumariApiJob[] = Array.isArray(payload) ? payload : payload?.data || [];
      items.push(...pageItems);
      lastPage = Number(payload?.meta?.last_page || page);
      if (page >= lastPage || !pageItems.length) break;
    }
    const active = items.filter(
      (item) =>
        item.job_title && item.job_url && (!item.days_left || !/^0\s*days?/i.test(item.days_left)),
    );
    return active.map((item) =>
      JobSchema.parse({
        title: item.job_title.trim(),
        company: item.company_name?.trim() || "Not specified",
        location: item.job_location?.trim() || "Kathmandu",
        url: item.job_url!.startsWith("http")
          ? item.job_url
          : `https://www.kumarijob.com${item.job_url}`,
        source: "kumarijob",
      }),
    );
  } catch (error) {
    console.error("❌ KumariJob API scraping failed:", error);
    return [];
  }
}

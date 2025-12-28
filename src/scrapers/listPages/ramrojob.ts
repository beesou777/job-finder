import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.ramrojob.com";
const API_BASE = "https://www.ramrojob.com/advance_search";

interface RamroJobOrganization {
  id: number;
  organization_name: string;
  logo?: string;
  city?: string;
  district?: string;
  website?: string;
  email?: string;
  slug: string;
}

interface RamroJobAPIResponse {
  data: RamroJobItem[];
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface RamroJobItem {
  id: number;
  job_title: string;
  job_slug: string;
  deadline: string;
  organization_id: number;
  organization: RamroJobOrganization;
  is_candidate_favourite: boolean | null;
  category?: string; // Optional category if provided by API
  industry?: string; // Optional industry if provided by API
  industry_id?: number; // Optional industry_id if provided by API
}

/**
 * Map RamroJob API response to JobData
 */
function mapToJobData(job: RamroJobItem): JobData {
  // Construct apply URL
  const applyUrl = `${BASE_URL}/${job.job_slug}`;

  // Format deadline
  let deadline: string | undefined;
  if (job.deadline) {
    const deadlineDate = new Date(job.deadline);
    deadline = deadlineDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Get location from organization
  const location = job.organization?.city || job.organization?.district || "Nepal";

  // Clean HTML from organization summary if needed
  const cleanHtml = (html: string): string => {
    if (!html) return "";
    try {
      const $ = cheerio.load(html);
      return $.text().trim();
    } catch {
      return html.replace(/<[^>]*>/g, "").trim();
    }
  };

  // Detect if it's an internship based on title
  const isInternship =
    job.job_title.toLowerCase().includes("intern") ||
    job.job_title.toLowerCase().includes("internship") ||
    job.job_title.toLowerCase().includes("trainee");

  return {
    title: job.job_title,
    applyUrl: applyUrl,
    company: job.organization?.organization_name || undefined,
    location: location,
    deadline: deadline,
    category: job.category || undefined, // Include category if available from API
    type: isInternship ? "internship" : "job",
    source: "ramrojob",
  };
}

/**
 * Scrape RamroJob using REST API
 * Fetches all pages and returns pre-fetched jobs
 */
export async function scrapeRamroJobList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    let currentPage = 1;
    let lastPage = 1;

    // Fetch all pages
    do {
      try {
        const response = await axios.get<RamroJobAPIResponse>(
          `${API_BASE}?page=${currentPage}`,
          {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 15000,
          }
        );

        if (response.data?.data && Array.isArray(response.data.data)) {
          // Filter out expired jobs and map to JobData
          const now = new Date();
          const totalJobs = response.data.data.length;
          const validJobs = response.data.data.filter((job) => {
            if (!job.deadline) return true; // Include jobs without deadline
            const deadlineDate = new Date(job.deadline);
            return deadlineDate > now; // Only include jobs where deadline is in the future
          });
          
          const expiredCount = totalJobs - validJobs.length;
          if (expiredCount > 0) {
            console.log(`[RamroJob] Filtered out ${expiredCount} expired job(s) on page ${currentPage}`);
          }
          
          const jobs = validJobs.map(mapToJobData);
          allJobs.push(...jobs);

          // Update pagination info
          lastPage = response.data.last_page || 1;
          currentPage = response.data.current_page || currentPage;

          console.log(
            `[RamroJob] Fetched page ${currentPage}/${lastPage}, ${jobs.length} jobs`
          );
        } else {
          console.warn(`[RamroJob] No data in response for page ${currentPage}`);
          break;
        }

        // Check if there's a next page
        if (currentPage >= lastPage || !response.data.next_page_url) {
          break;
        }

        currentPage++;
      } catch (pageError: any) {
        console.error(
          `[RamroJob] Error fetching page ${currentPage}:`,
          pageError.message
        );
        break;
      }
    } while (currentPage <= lastPage);

    console.log(`✅ RamroJob: Fetched ${allJobs.length} jobs from API`);

    // Return detail URLs for compatibility (though we already have the jobs)
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs,
    };
  } catch (error: any) {
    console.error(`❌ RamroJob API failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}

import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.sojojob.com";
const API_BASE = "https://api.sojodata.com/api/v1/public/getEliteJobs";

interface SojoDataJobRecruiter {
  id: number;
  companyName: string;
  companyLogoImage?: string;
}

interface SojoDataJobShift {
  id: number;
  title: string;
}

interface SojoDataJobSite {
  id: number;
  title: string;
}

interface SojoDataExperienceLevel {
  id: number;
  title: string;
}

interface SojoDataJob {
  id: number;
  title: string;
  salary: string;
  viewsCount: number;
  impressionCount: number;
  jobLocation: string;
  startDate: string;
  endDate: string;
  jobPostingPackage: string;
  jobStatus: string;
  numberOfVacancies: number;
  jobDescription: string;
  skills: string;
  jobSubCategoryTxt: string | null;
  createdAt: string;
  updatedAt: string;
  jobShift: SojoDataJobShift;
  jobSite: SojoDataJobSite;
  experienceLevel: SojoDataExperienceLevel | null;
  jobRecruiter: SojoDataJobRecruiter;
}

interface SojoDataAPIResponse {
  data: SojoDataJob[];
  pagination: {
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

/**
 * Clean HTML from text
 */
function cleanHtml(html: string): string {
  if (!html) return "";
  try {
    const $ = cheerio.load(html);
    return $.text().trim();
  } catch {
    return html.replace(/<[^>]*>/g, "").trim();
  }
}

/**
 * Map SojoData API response to JobData
 */
function mapToJobData(job: SojoDataJob): JobData {
  // Construct apply URL using job ID
  const applyUrl = `${BASE_URL}/jobs?id=${job.id}`;

  // Format salary
  const salaryText = job.salary || "Negotiable";

  // Format deadline from endDate
  let deadline: string | undefined;
  if (job.endDate) {
    const deadlineDate = new Date(job.endDate);
    deadline = deadlineDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Get location
  const location = job.jobLocation || undefined;

  // Get job type from jobShift
  const jobType = job.jobShift?.title || undefined;

  // Get category from jobSubCategoryTxt
  const category = job.jobSubCategoryTxt || undefined;

  // Detect if it's an internship
  const isInternship =
    job.title.toLowerCase().includes("intern") ||
    job.title.toLowerCase().includes("internship") ||
    job.title.toLowerCase().includes("trainee");

  // Clean description
  const description = cleanHtml(job.jobDescription);

  return {
    title: job.title,
    applyUrl: applyUrl,
    company: job.jobRecruiter?.companyName || undefined,
    location: location,
    salaryText: salaryText,
    deadline: deadline,
    jobType: jobType,
    category: category,
    type: isInternship ? "internship" : "job",
    source: "sojodata",
    description: description || undefined,
  };
}

/**
 * Scrape SojoData using REST API
 * Fetches all pages and returns pre-fetched jobs
 */
export async function scrapeSojoDataList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    let currentPage = 1;
    let totalPages = 1;
    const maxPages = 50; // Limit to prevent infinite loops
    const limit = 100; // Fetch more jobs per page

    // Fetch all pages
    do {
      try {
        const response = await axios.get<SojoDataAPIResponse>(
          `${API_BASE}?limit=${limit}&page=${currentPage}`,
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 15000,
          },
        );

        if (!response.data?.data || response.data.data.length === 0) {
          break;
        }

        // Filter out inactive jobs
        const activeJobs = response.data.data.filter((job) => job.jobStatus === "Active");

        const jobs = activeJobs.map(mapToJobData);
        allJobs.push(...jobs);

        // Update pagination info
        totalPages = response.data.pagination?.totalPages || 1;
        const fetchedPage = response.data.pagination?.currentPage || currentPage;

        console.log(
          `    📄 Page ${fetchedPage}/${totalPages}: Fetched ${jobs.length} jobs (total: ${allJobs.length})`,
        );

        // Check if there's a next page
        const nextPage = response.data.pagination?.nextPage;
        if (fetchedPage >= totalPages || !nextPage || currentPage >= maxPages) {
          break;
        }

        currentPage = nextPage;
      } catch (error: any) {
        console.error(`    ❌ Error fetching page ${currentPage}: ${error.message}`);
        break;
      }

      // Add small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (currentPage <= totalPages && currentPage <= maxPages);

    if (allJobs.length === 0) {
      return { detailUrls: [], hasMore: false };
    }

    // Return detail URLs for compatibility
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We fetched all pages
      preFetchedJobs: allJobs, // Return pre-fetched jobs
    };
  } catch (error: any) {
    console.error(`Error scraping SojoData list: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}

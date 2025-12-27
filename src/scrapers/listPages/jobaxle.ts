import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://jobaxle.com";
const API_BASE = "https://jobaxle.com/api/search";

interface JobAxleJob {
  id: string;
  jobTitle: string;
  slug: string;
  createdAt: string;
  workNature: string;
  deadlineStartDate: string;
  deadlineEndDate: string;
  member: {
    fullName: string;
    profileImage: string;
  };
}

interface JobAxleResponse {
  message: string;
  success: boolean;
  status: number;
  data: {
    rows: JobAxleJob[];
    count: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Map JobAxle API response to JobData
 */
function mapToJobData(job: JobAxleJob): JobData {
  // Construct apply URL
  const applyUrl = `${BASE_URL}/jobs/${job.slug}`;

  // Format deadline
  let deadline: string | undefined;
  if (job.deadlineEndDate) {
    const deadlineDate = new Date(job.deadlineEndDate);
    deadline = deadlineDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Format location from workNature
  const location = job.workNature
    ? job.workNature
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : undefined;

  // Detect if it's an internship based on title
  const isInternship =
    job.jobTitle.toLowerCase().includes("intern") ||
    job.jobTitle.toLowerCase().includes("internship");

  return {
    title: job.jobTitle,
    applyUrl: applyUrl,
    company: job.member?.fullName || undefined,
    location: location,
    deadline: deadline,
    jobType: job.workNature || undefined,
    type: isInternship ? "internship" : "job",
    source: "jobaxle",
  };
}

/**
 * Scrape JobAxle using REST API
 * Fetches all pages and returns pre-fetched jobs
 */
export async function scrapeJobAxleList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    let currentPage = 1;
    let totalPages = 1;

    // Fetch all pages
    do {
      try {
        const response = await axios.get<JobAxleResponse>(
          `${API_BASE}?page=${currentPage}`,
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 15000,
          }
        );

        if (
          !response.data?.success ||
          !response.data?.data?.rows ||
          response.data.data.rows.length === 0
        ) {
          break;
        }

        const jobs = response.data.data.rows;
        const mappedJobs = jobs.map(mapToJobData);
        allJobs.push(...mappedJobs);

        totalPages = response.data.data.totalPages || 1;
        console.log(
          `    📄 Page ${currentPage}/${totalPages}: Fetched ${jobs.length} jobs (total: ${allJobs.length})`
        );

        currentPage++;

        // Add small delay between requests
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        console.error(
          `    ❌ Error fetching page ${currentPage}: ${error.message}`
        );
        break;
      }
    } while (currentPage <= totalPages);

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
    console.error(`Error scraping JobAxle list: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


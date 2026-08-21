import axios from "axios";
import { JobData, calculateExpirationDate } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.workhubnepal.com";

interface WorkHubNepalJob {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  numberOfViews: number;
  numberOfClicks: number;
  title: string;
  category: string;
  experience: string;
  experienceUnit: string;
  skills: string[];
  timings: string;
  location: string;
  jobDescription: string;
  applySiteLink: string;
  applySiteEmail: string;
  expiryDate: string;
  jobStatus: string;
  applySite: "EMAIL" | "LINK" | "FREE";
  applicationType: string;
  isFeaturedHighlighted: boolean;
  jobPrice: number;
  postedBy: {
    companyLogo?: string;
    companyDescription?: string;
    companyWebsite?: string;
    companyLocation?: string;
    companyEmail?: string | null;
    companyName: string;
  };
  compensation: {
    id: string;
    currency: string;
    duration: string;
    minSalary: string;
    maxSalary: string;
    jobId: string;
  };
}

interface WorkHubNepalResponse {
  jobsData: {
    jobs: WorkHubNepalJob[];
    meta: {
      totalJobs: number;
      totalPages: number;
    };
  };
  company: any;
  userSession: any;
}

/**
 * Clean HTML from job description
 */
function cleanHtml(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  return $.text().trim();
}

/**
 * Convert job title to URL-friendly slug
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Map WorkHub Nepal API response to JobData
 */
function mapToJobData(job: WorkHubNepalJob): JobData {
  // Construct apply URL using job detail page format: /jobs/{title-slug}/{job-id}
  // Format: https://www.workhubnepal.com/jobs/{title-slug}/{job-id}
  const titleSlug = slugify(job.title);
  const applyUrl = `${BASE_URL}/jobs/${encodeURIComponent(`{${job.title}}`)}/${job.id}`;

  // Format deadline from expiryDate
  let deadline: string | undefined;
  if (job.expiryDate) {
    try {
      const deadlineDate = new Date(job.expiryDate);
      if (!isNaN(deadlineDate.getTime())) {
        deadline = deadlineDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } catch (e) {
      // Invalid date, skip
    }
  }

  // Format salary
  let salaryText: string | undefined;
  if (job.compensation) {
    const { minSalary, maxSalary, currency, duration } = job.compensation;
    if (minSalary && maxSalary) {
      const currencySymbol = currency === "Nrs" ? "Rs." : currency;
      const durationText = duration === "yr" ? "per year" : duration === "mo" ? "per month" : "";
      salaryText = `${currencySymbol} ${minSalary} - ${maxSalary} ${durationText}`.trim();
    } else if (minSalary) {
      const currencySymbol = currency === "Nrs" ? "Rs." : currency;
      const durationText = duration === "yr" ? "per year" : duration === "mo" ? "per month" : "";
      salaryText = `${currencySymbol} ${minSalary} ${durationText}`.trim();
    }
  }

  // Format experience
  let experienceText: string | undefined;
  if (job.experience && job.experience !== "0") {
    const unit = job.experienceUnit || "yrs";
    if (unit === "yrs") {
      experienceText = `${job.experience} year${job.experience !== "1" ? "s" : ""}`;
    } else if (unit === "mo") {
      experienceText = `${job.experience} month${job.experience !== "1" ? "s" : ""}`;
    } else {
      experienceText = `${job.experience} ${unit}`;
    }
  } else if (job.experience === "0") {
    experienceText = "No experience needed";
  }

  // Determine job type from timings and title
  const lowerTitle = job.title.toLowerCase();
  const lowerTimings = job.timings?.toLowerCase() || "";
  let jobType: string | undefined = job.timings || undefined;

  // Determine if it's an internship
  const isInternship =
    lowerTitle.includes("intern") ||
    lowerTitle.includes("internship") ||
    lowerTimings.includes("intern");

  // Calculate expiration date
  const expiresAt = job.expiryDate
    ? new Date(job.expiryDate)
    : calculateExpirationDate(deadline, new Date(job.createdAt));

  // Clean description
  const description = cleanHtml(job.jobDescription);

  return {
    title: job.title,
    applyUrl: applyUrl,
    company: job.postedBy?.companyName || undefined,
    location: job.location || undefined,
    salaryText: salaryText,
    deadline: deadline,
    jobType: jobType,
    category: job.category || undefined,
    type: isInternship ? "internship" : "job",
    source: "workhubnepal",
    description: description || undefined,
    expiresAt: expiresAt,
  };
}

/**
 * Fetch all jobs with pagination
 */
async function fetchAllJobs(): Promise<JobData[]> {
  const jobs: JobData[] = [];
  let currentPage = 1;
  let totalPages = 1;

  // Fetch all pages using do-while loop
  do {
    try {
      // Construct URL with proper query parameters
      const url = new URL(BASE_URL);
      url.searchParams.set("category", "");
      url.searchParams.set("page", currentPage.toString());
      url.searchParams.set("_data", "routes/index");

      console.log(`[WorkHub Nepal] Fetching page ${currentPage} from: ${url.toString()}`);

      const response = await axios.get<WorkHubNepalResponse>(url.toString(), {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      if (!response.data?.jobsData) {
        console.warn(`[WorkHub Nepal] Invalid response structure for page ${currentPage}`);
        break;
      }

      // Get totalPages from meta (should be available on every page)
      if (response.data.jobsData.meta?.totalPages) {
        totalPages = response.data.jobsData.meta.totalPages;
        console.log(
          `[WorkHub Nepal] Total pages from API: ${totalPages}, Total jobs: ${response.data.jobsData.meta.totalJobs || "N/A"}`,
        );
      }

      if (response.data.jobsData.jobs && Array.isArray(response.data.jobsData.jobs)) {
        const fetchedJobs = response.data.jobsData.jobs;

        // Log job statuses for debugging
        const statusCounts = fetchedJobs.reduce((acc: Record<string, number>, job) => {
          acc[job.jobStatus] = (acc[job.jobStatus] || 0) + 1;
          return acc;
        }, {});
        console.log(
          `[WorkHub Nepal] Page ${currentPage}/${totalPages}: Job statuses: ${JSON.stringify(statusCounts)}`,
        );

        // Filter out expired jobs (where expiryDate is in the past)
        const now = new Date();
        const validJobs = fetchedJobs.filter((job) => {
          if (!job.expiryDate) {
            return true; // Include jobs without expiry date
          }
          try {
            const expiryDate = new Date(job.expiryDate);
            return expiryDate >= now; // Only include jobs that haven't expired
          } catch (e) {
            return true; // Include jobs with invalid expiry dates
          }
        });

        // Log expiration stats
        const expiredCount = fetchedJobs.length - validJobs.length;
        if (expiredCount > 0) {
          console.log(
            `[WorkHub Nepal] Page ${currentPage}: Filtered out ${expiredCount} expired job(s)`,
          );
        }

        // Map all valid (non-expired) jobs
        const mappedJobs = validJobs.map(mapToJobData);
        jobs.push(...mappedJobs);

        console.log(
          `[WorkHub Nepal] Page ${currentPage}/${totalPages}: Fetched ${mappedJobs.length} jobs from ${fetchedJobs.length} total (accumulated: ${jobs.length})`,
        );

        // If no jobs were returned, stop
        if (fetchedJobs.length === 0) {
          console.log(`[WorkHub Nepal] No jobs returned on page ${currentPage}. Stopping.`);
          break;
        }

        // Move to next page
        currentPage++;

        // Add small delay between requests (only if we're continuing)
        if (currentPage <= totalPages) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        console.warn(`[WorkHub Nepal] No jobs array in response for page ${currentPage}`);
        break;
      }
    } catch (error: any) {
      console.error(`[WorkHub Nepal] Error fetching page ${currentPage}:`, error.message);
      if (error.response?.status) {
        console.error(`[WorkHub Nepal] HTTP Status: ${error.response.status}`);
      }
      if (error.response?.data) {
        console.error(
          `[WorkHub Nepal] Response data:`,
          JSON.stringify(error.response.data).substring(0, 200),
        );
      }
      break;
    }
  } while (currentPage <= totalPages);

  console.log(
    `[WorkHub Nepal] ✅ Completed fetching all pages. Total jobs collected: ${jobs.length}`,
  );
  return jobs;
}

/**
 * Scrape WorkHub Nepal using API
 * Fetches all jobs directly without category filtering
 * Returns pre-fetched jobs
 */
export async function scrapeWorkHubNepalList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[];
}> {
  try {
    console.log(`[WorkHub Nepal] Fetching all jobs...`);

    // Fetch all jobs with pagination
    const allJobs = await fetchAllJobs();

    if (allJobs.length === 0) {
      console.warn(`[WorkHub Nepal] No jobs found`);
      return { detailUrls: [], hasMore: false };
    }

    console.log(`✅ WorkHub Nepal: Fetched ${allJobs.length} jobs from API`);

    // Return detail URLs for compatibility (though we already have the jobs)
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs,
    };
  } catch (error: any) {
    console.error(`❌ WorkHub Nepal API failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}

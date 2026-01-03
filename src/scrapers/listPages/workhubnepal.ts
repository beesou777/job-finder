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
 * Map WorkHub Nepal API response to JobData
 */
function mapToJobData(job: WorkHubNepalJob): JobData {
  // Construct apply URL based on applySite type
  let applyUrl: string;
  if (job.applySite === "EMAIL" && job.applySiteEmail) {
    // For email applications, use the search URL format
    const searchTitle = encodeURIComponent(job.title);
    const searchCategory = encodeURIComponent(job.category || "");
    applyUrl = `${BASE_URL}/?search=${searchTitle}&category=${searchCategory}`;
  } else if (job.applySite === "LINK" && job.applySiteLink) {
    applyUrl = job.applySiteLink;
  } else {
    // Default: use search URL format
    const searchTitle = encodeURIComponent(job.title);
    const searchCategory = encodeURIComponent(job.category || "");
    applyUrl = `${BASE_URL}/?search=${searchTitle}&category=${searchCategory}`;
  }

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
  let page = 1;
  let hasMore = true;
  let totalPages = 1;

  while (hasMore) {
    try {
      // Construct URL with proper query parameters
      const url = new URL(BASE_URL);
      url.searchParams.set("category", "");
      url.searchParams.set("page", page.toString());
      url.searchParams.set("_data", "routes/index");
      
      const response = await axios.get<WorkHubNepalResponse>(url.toString(), {
        headers: {
          "Accept": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      if (response.data?.jobsData?.jobs && Array.isArray(response.data.jobsData.jobs)) {
        const fetchedJobs = response.data.jobsData.jobs;
        const mappedJobs = fetchedJobs
          .filter((job) => job.jobStatus === "OPEN") // Only fetch open jobs
          .map(mapToJobData);
        jobs.push(...mappedJobs);

        // Update total pages from meta
        totalPages = response.data.jobsData.meta?.totalPages || 1;

        console.log(
          `[WorkHub Nepal] Fetched page ${page}/${totalPages}, ${mappedJobs.length} jobs (total: ${jobs.length})`
        );

        // Check if there are more pages
        if (page < totalPages && fetchedJobs.length > 0) {
          page++;
          hasMore = true;
        } else {
          hasMore = false;
        }

        // Add small delay between requests
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        console.warn(`[WorkHub Nepal] No jobs in response for page ${page}`);
        hasMore = false;
      }
    } catch (error: any) {
      console.error(
        `[WorkHub Nepal] Error fetching page ${page}:`,
        error.message
      );
      if (error.response?.data) {
        console.error(`[WorkHub Nepal] Response data:`, error.response.data);
      }
      hasMore = false;
    }
  }

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

    console.log(
      `✅ WorkHub Nepal: Fetched ${allJobs.length} jobs from API`
    );

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


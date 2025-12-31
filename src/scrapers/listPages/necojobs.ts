import axios from "axios";
import { JobData, calculateExpirationDate } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.necojobs.com.np";
const JOB_FILTER_API = "https://www.necojobs.com.np/api/v1/job/filterjobfront";

interface NecojobsJobLocation {
  location: string;
}

interface NecojobsJob {
  _id: string;
  jobPosition: string;
  companyName: string;
  companyImage?: string;
  companySlug?: string;
  category: string;
  categorySlug: string;
  jobLocation: NecojobsJobLocation[];
  jobLevel: string;
  availableFor: string;
  numberOfVacancy: number;
  minimumSalary?: {
    currency?: string;
    salary?: string;
    salaryRange?: string | null;
  };
  maximumSalary?: {
    currency?: string;
    salary?: string;
    salaryRange?: string | null;
  };
  isSalaryNegotiable: boolean;
  jobStartDate?: string;
  jobEndDate?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  subscriptionType?: string;
  view?: number;
}

interface NecojobsFilterResponse {
  message: string;
  results: {
    filter: {
      experienceLevel: Array<{ value: boolean; for: string }>;
      availabilty: Array<{ value: boolean; for: string }>;
      company: Array<{ value: boolean; for: string }>;
      location: Array<{ value: boolean; for: string }>;
      category: Array<{
        value: boolean;
        for: string;
        count: number;
        imageUrl?: string;
        bannerUrl?: string;
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string;
        description?: string;
      }>;
    };
    pagination: {
      next: number | null;
      total: number;
    };
    jobs: NecojobsJob[];
  };
}

/**
 * Clean HTML content
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
 * Format salary text
 */
function formatSalary(
  minSalary: { currency?: string; salary?: string; salaryRange?: string | null } | undefined,
  maxSalary: { currency?: string; salary?: string; salaryRange?: string | null } | undefined,
  isNegotiable: boolean = false
): string | undefined {
  if (isNegotiable && (!minSalary?.salary && !maxSalary?.salary)) {
    return "Negotiable";
  }

  const min = minSalary?.salary || minSalary?.salaryRange;
  const max = maxSalary?.salary || maxSalary?.salaryRange;
  const currency = minSalary?.currency || maxSalary?.currency || "Rs.";

  if (min && max) {
    return `${currency} ${min} - ${max}`;
  } else if (min) {
    return `${currency} ${min}+`;
  } else if (max) {
    return `${currency} Up to ${max}`;
  }

  return isNegotiable ? "Negotiable" : undefined;
}

/**
 * Map Necojobs API response to JobData
 */
function mapToJobData(job: NecojobsJob): JobData {
  // Construct apply URL using category slug format: category/category-slug
  const applyUrl = job.categorySlug
    ? `${BASE_URL}/category/${job.categorySlug}`
    : job.slug
    ? `${BASE_URL}/job/${job.slug}`
    : `${BASE_URL}/job/${job._id}`;

  // Format deadline from jobEndDate
  let deadline: string | undefined;
  if (job.jobEndDate) {
    const deadlineDate = new Date(job.jobEndDate);
    if (!isNaN(deadlineDate.getTime())) {
      deadline = deadlineDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Get location from jobLocation array
  const location =
    job.jobLocation && job.jobLocation.length > 0
      ? job.jobLocation[0].location
      : undefined;

  // Format salary
  const salaryText = formatSalary(
    job.minimumSalary,
    job.maximumSalary,
    job.isSalaryNegotiable
  );

  // Format job type (availableFor like "Full Time", "Part Time")
  const jobType = job.availableFor || undefined;

  // Determine if it's an internship based on jobLevel or category
  const isInternship =
    job.jobLevel?.toLowerCase().includes("intern") ||
    job.category?.toLowerCase().includes("intern")
      ? "internship"
      : "job";

  // Calculate expiration date
  const expiresAt = job.jobEndDate
    ? new Date(job.jobEndDate)
    : calculateExpirationDate(deadline, new Date(job.createdAt));

  return {
    title: job.jobPosition,
    applyUrl: applyUrl,
    company: job.companyName || undefined,
    location: location,
    salaryText: salaryText,
    deadline: deadline,
    jobType: jobType,
    category: job.category || undefined,
    type: isInternship,
    source: "necojobs",
    expiresAt: expiresAt,
  };
}

/**
 * Fetch all jobs with pagination (no category filtering needed)
 */
async function fetchAllJobs(): Promise<JobData[]> {
  const jobs: JobData[] = [];
  let skip = 1; // Start from 1 (skip parameter must be positive integer)
  const limit = 100; // Maximum allowed limit
  let hasMore = true;

  while (hasMore) {
    try {
      // Simple payload structure - no filter needed
      const payload = {
        limit: limit,
        skip: skip,
      };

      const response = await axios.post<NecojobsFilterResponse>(
        JOB_FILTER_API,
        payload,
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

      if (
        response.data?.results?.jobs &&
        Array.isArray(response.data.results.jobs)
      ) {
        const fetchedJobs = response.data.results.jobs;
        const mappedJobs = fetchedJobs.map(mapToJobData);
        jobs.push(...mappedJobs);

        console.log(
          `[Necojobs] Fetched page ${skip}, ${mappedJobs.length} jobs (total: ${jobs.length})`
        );

        // Check if there are more pages
        const pagination = response.data.results.pagination;
        if (pagination.next && pagination.next > skip) {
          // Use the next value from API
          skip = pagination.next;
          hasMore = true;
        } else if (fetchedJobs.length === limit) {
          // If we got a full page but no next value, calculate next skip
          skip = skip + limit;
          hasMore = true;
        } else {
          hasMore = false;
        }

        // Add small delay between requests to avoid rate limiting
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        console.warn(
          `[Necojobs] No jobs in response for page ${skip}`
        );
        hasMore = false;
      }
    } catch (error: any) {
      console.error(
        `[Necojobs] Error fetching page ${skip}:`,
        error.message
      );
      // If it's a validation error, log the specific errors
      if (error.response?.data?.errors) {
        console.error(
          `[Necojobs] Validation errors:`,
          error.response.data.errors
        );
      }
      hasMore = false;
    }
  }

  return jobs;
}

/**
 * Scrape Necojobs using REST API
 * Fetches all jobs directly without category filtering
 * Returns pre-fetched jobs
 */
export async function scrapeNecojobsList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    console.log(`[Necojobs] Fetching all jobs...`);
    
    // Fetch all jobs with pagination
    const allJobs = await fetchAllJobs();

    if (allJobs.length === 0) {
      console.warn(`[Necojobs] No jobs found`);
      return { detailUrls: [], hasMore: false };
    }

    console.log(
      `✅ Necojobs: Fetched ${allJobs.length} jobs from API`
    );

    // Return detail URLs for compatibility (though we already have the jobs)
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs,
    };
  } catch (error: any) {
    console.error(`❌ Necojobs API failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


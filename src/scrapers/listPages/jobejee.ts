import axios from "axios";
import { JobData, calculateExpirationDate } from "../core/types";

const BASE_URL = "https://www.jobejee.com";
const JOB_SEARCH_API = "https://api.v1.jobejee.com/v2/jobSearch/new";

interface JobejeeJob {
  empId: string;
  image: string | null;
  companyName: string;
  confidence: string;
  industry: string;
  isPrivate: string;
  publishOn: string;
  jobCreateId: string;
  title: string;
  expMax: string;
  jobLocation: string;
  jobExpiry: string;
  isNewsJob: string;
  location: string;
  keySkills: string;
  jobType: string; // "F" = Full-time, "P" = Part-time, "I" = Internship
  expMin: string;
  views: string;
}

interface JobejeeResponse {
  pageNumber: number;
  jobTypeFlag: {
    F?: number;
    P?: number;
    I?: number;
  };
  data: JobejeeJob[];
  size: number;
  numberOfElements: number;
  publication: Record<string, any>;
  companyName: Record<string, number>;
  totalPages: number;
  funcArea: Record<string, number>;
  industry: Record<string, number>;
  location: Record<string, number>;
  totalElements: number;
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
 * Map Jobejee API response to JobData
 */
function mapToJobData(job: JobejeeJob): JobData {
  // Construct apply URL - Jobejee uses format: /job/{title-slug}/{jobCreateId}
  const titleSlug = slugify(job.title);
  const applyUrl = `${BASE_URL}/job/${titleSlug}/${job.jobCreateId}`;

  // Format deadline from jobExpiry
  let deadline: string | undefined;
  if (job.jobExpiry) {
    try {
      const deadlineDate = new Date(job.jobExpiry);
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

  // Get location
  const location = job.jobLocation || job.location || undefined;

  // Determine job type from jobType flag
  let jobType: string | undefined;
  if (job.jobType === "F") {
    jobType = "Full Time";
  } else if (job.jobType === "P") {
    jobType = "Part Time";
  } else if (job.jobType === "I") {
    jobType = "Internship";
  }

  // Determine if it's an internship
  const isInternship = job.jobType === "I" ? "internship" : "job";

  // Format experience range
  let experienceText: string | undefined;
  if (job.expMin && job.expMax) {
    if (job.expMin === job.expMax) {
      experienceText = `${job.expMin} year${job.expMin !== "1" ? "s" : ""}`;
    } else {
      experienceText = `${job.expMin} - ${job.expMax} years`;
    }
  } else if (job.expMin) {
    experienceText = `${job.expMin}+ years`;
  } else if (job.expMax) {
    experienceText = `Up to ${job.expMax} years`;
  }

  // Calculate expiration date
  const expiresAt = job.jobExpiry
    ? new Date(job.jobExpiry)
    : calculateExpirationDate(deadline, new Date(job.publishOn));

  return {
    title: job.title,
    applyUrl: applyUrl,
    company: job.companyName || undefined,
    location: location,
    salaryText: undefined, // Not provided in API
    deadline: deadline,
    jobType: jobType,
    category: job.industry || undefined,
    type: isInternship,
    source: "jobejee",
    expiresAt: expiresAt,
  };
}

/**
 * Fetch all jobs with pagination
 */
async function fetchAllJobs(): Promise<JobData[]> {
  const jobs: JobData[] = [];
  let page = 0;
  const size = 1000; // Maximum page size
  let hasMore = true;

  while (hasMore) {
    try {
      const payload = {
        searchKey: "",
        location: null,
      };

      const response = await axios.post<JobejeeResponse>(
        `${JOB_SEARCH_API}?page=${page}&size=${size}`,
        payload,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
        },
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        const fetchedJobs = response.data.data;
        const mappedJobs = fetchedJobs.map(mapToJobData);
        jobs.push(...mappedJobs);

        console.log(
          `[Jobejee] Fetched page ${page}, ${mappedJobs.length} jobs (total: ${jobs.length})`,
        );

        // Check if there are more pages
        const totalPages = response.data.totalPages || 0;
        if (page < totalPages - 1 && fetchedJobs.length > 0) {
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
        console.warn(`[Jobejee] No jobs in response for page ${page}`);
        hasMore = false;
      }
    } catch (error: any) {
      console.error(`[Jobejee] Error fetching page ${page}:`, error.message);
      if (error.response?.data) {
        console.error(`[Jobejee] Response data:`, error.response.data);
      }
      hasMore = false;
    }
  }

  return jobs;
}

/**
 * Scrape Jobejee using REST API
 * Fetches all jobs directly without category filtering
 * Returns pre-fetched jobs
 */
export async function scrapeJobejeeList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[];
}> {
  try {
    console.log(`[Jobejee] Fetching all jobs...`);

    // Fetch all jobs with pagination
    const allJobs = await fetchAllJobs();

    if (allJobs.length === 0) {
      console.warn(`[Jobejee] No jobs found`);
      return { detailUrls: [], hasMore: false };
    }

    console.log(`✅ Jobejee: Fetched ${allJobs.length} jobs from API`);

    // Return detail URLs for compatibility (though we already have the jobs)
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs,
    };
  } catch (error: any) {
    console.error(`❌ Jobejee API failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}

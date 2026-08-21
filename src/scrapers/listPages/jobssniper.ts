import axios from "axios";
import { JobData, calculateExpirationDate } from "../core/types";

const BASE_URL = "https://www.jobssniper.com";
const API_BASE = "https://www.jobssniper.com/api/job-by";

interface JobSniperOrganization {
  organization_name: string;
}

interface JobSniperJob {
  id: number;
  slug: string;
  title_of_job: string;
  organization_name: JobSniperOrganization[];
  job_location: string;
  deadline: string;
  post_date: string;
  kind_of_jobs: string;
  job_level: string;
  salary_type: string;
  salary_amount: number | null;
  initial_salary: number | null;
  maximum_salary: number | null;
  salary_currency: string;
  salary_basis: string;
  experience_required?: string;
  preferred_education?: string;
  job_category?: number;
  published: boolean;
  approved: boolean;
  expired: boolean;
}

interface JobSniperResponse {
  count: number;
  countItemsOnPage: number;
  current: number;
  next: string | null;
  previous: string | null;
  results: JobSniperJob[];
}

/**
 * Format salary text from JobSniper salary data
 */
function formatSalary(
  salaryType: string,
  initialSalary: number | null,
  maximumSalary: number | null,
  currency: string,
  salaryAmount: number | null,
): string | undefined {
  if (salaryType === "Negotiable") {
    return "Negotiable";
  }

  if (salaryType === "Range" && initialSalary && maximumSalary) {
    return `${currency} ${initialSalary.toLocaleString()} - ${maximumSalary.toLocaleString()}`;
  }

  if (salaryType === "Maximum" && (maximumSalary || salaryAmount)) {
    const amount = maximumSalary || salaryAmount;
    return `${currency} Up to ${amount?.toLocaleString()}`;
  }

  if (salaryType === "Minimum" && initialSalary) {
    return `${currency} ${initialSalary.toLocaleString()}+`;
  }

  if (salaryType === "Above" && (initialSalary || salaryAmount)) {
    const amount = initialSalary || salaryAmount;
    return `${currency} ${amount?.toLocaleString()}+`;
  }

  if (initialSalary) {
    return `${currency} ${initialSalary.toLocaleString()}`;
  }

  if (salaryAmount) {
    return `${currency} ${salaryAmount.toLocaleString()}`;
  }

  return "Negotiable";
}

/**
 * Map JobSniper API response to JobData
 * @param job - The job data from API
 * @param jobType - The type of job endpoint ("fulltime", "parttime", "internship")
 */
function mapToJobData(job: JobSniperJob, jobType: "fulltime" | "parttime" | "internship"): JobData {
  // Construct apply URL
  const applyUrl = `${BASE_URL}/jobs/${job.slug}`;

  // Get company name
  const company =
    job.organization_name && job.organization_name.length > 0
      ? job.organization_name[0].organization_name
      : undefined;

  // Format salary
  const salaryText = formatSalary(
    job.salary_type,
    job.initial_salary,
    job.maximum_salary,
    job.salary_currency || "NPR",
    job.salary_amount,
  );

  // Format deadline
  let deadline: string | undefined;
  if (job.deadline) {
    const deadlineDate = new Date(job.deadline);
    if (!isNaN(deadlineDate.getTime())) {
      deadline = deadlineDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Determine if it's an internship based on endpoint or job data
  const isInternship =
    jobType === "internship"
      ? "internship"
      : job.kind_of_jobs?.toLowerCase().includes("intern") ||
          job.title_of_job?.toLowerCase().includes("intern")
        ? "internship"
        : "job";

  // Calculate expiration date
  const expiresAt = job.deadline
    ? new Date(job.deadline)
    : calculateExpirationDate(deadline, new Date(job.post_date));

  return {
    title: job.title_of_job,
    applyUrl: applyUrl,
    company: company,
    location: job.job_location || undefined,
    salaryText: salaryText,
    deadline: deadline,
    jobType: job.kind_of_jobs || undefined,
    category: undefined, // Job category is numeric ID, we'll map it later if needed
    type: isInternship,
    source: "jobssniper",
    expiresAt: expiresAt,
  };
}

/**
 * Fetch jobs from a specific JobSniper endpoint with pagination
 */
async function fetchJobsFromEndpoint(
  endpoint: "fulltime" | "parttime" | "internship",
): Promise<JobData[]> {
  const allJobs: JobData[] = [];
  let currentPage = 1;
  let hasMore = true;
  const maxPages = 50; // Safety limit

  console.log(`[JobSniper] Fetching ${endpoint} jobs...`);

  while (hasMore && currentPage <= maxPages) {
    try {
      const response = await axios.get<JobSniperResponse>(`${API_BASE}/${endpoint}`, {
        params: {
          page: currentPage,
        },
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      if (response.data?.results && Array.isArray(response.data.results)) {
        const fetchedJobs = response.data.results;

        // Filter out expired or unpublished jobs
        const activeJobs = fetchedJobs.filter(
          (job) => job.published && job.approved && !job.expired,
        );

        const mappedJobs = activeJobs.map((job) => mapToJobData(job, endpoint));
        allJobs.push(...mappedJobs);

        console.log(
          `[JobSniper] Fetched ${endpoint} page ${currentPage}, ${mappedJobs.length} active jobs (total: ${allJobs.length})`,
        );

        // Check if there are more pages
        const totalPages = Math.ceil(response.data.count / response.data.countItemsOnPage);

        if (currentPage < totalPages && response.data.next) {
          currentPage++;
          hasMore = true;
        } else {
          hasMore = false;
        }

        // Add small delay between requests to avoid rate limiting
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        console.warn(`[JobSniper] No jobs in response for ${endpoint} page ${currentPage}`);
        hasMore = false;
      }
    } catch (error: any) {
      console.error(`[JobSniper] Error fetching ${endpoint} page ${currentPage}:`, error.message);
      hasMore = false;
    }
  }

  return allJobs;
}

/**
 * Scrape JobSniper using REST API
 * Fetches jobs from fulltime, parttime, and internship endpoints
 * Returns pre-fetched jobs
 */
export async function scrapeJobSniperList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    console.log(`[JobSniper] Fetching jobs from all endpoints...`);

    const allJobs: JobData[] = [];

    // Fetch fulltime jobs
    const fulltimeJobs = await fetchJobsFromEndpoint("fulltime");
    allJobs.push(...fulltimeJobs);
    console.log(`[JobSniper] Fulltime: ${fulltimeJobs.length} jobs`);

    // Add delay between endpoint requests
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch parttime jobs
    const parttimeJobs = await fetchJobsFromEndpoint("parttime");
    allJobs.push(...parttimeJobs);
    console.log(`[JobSniper] Parttime: ${parttimeJobs.length} jobs`);

    // Add delay between endpoint requests
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fetch internship jobs (only if endpoint has data)
    try {
      const internshipResponse = await axios.get<JobSniperResponse>(`${API_BASE}/internship`, {
        params: { page: 1 },
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 15000,
      });

      // Only fetch internships if there's data (count > 0)
      if (internshipResponse.data?.count && internshipResponse.data.count > 0) {
        const internshipJobs = await fetchJobsFromEndpoint("internship");
        allJobs.push(...internshipJobs);
        console.log(`[JobSniper] Internship: ${internshipJobs.length} jobs`);
      } else {
        console.log(`[JobSniper] No internships found, skipping...`);
      }
    } catch (error: any) {
      console.warn(`[JobSniper] Error checking internship endpoint: ${error.message}`);
      // Continue even if internship endpoint fails
    }

    if (allJobs.length === 0) {
      console.warn(`[JobSniper] No jobs found`);
      return { detailUrls: [], hasMore: false };
    }

    console.log(`✅ JobSniper: Fetched ${allJobs.length} total jobs from API`);

    // Return detail URLs for compatibility (though we already have the jobs)
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs,
    };
  } catch (error: any) {
    console.error(`❌ JobSniper API failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}

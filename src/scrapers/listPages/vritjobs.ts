import axios from "axios";
import { JobData, detectJobType, calculateExpirationDate } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://vritjobs.com";
const API_BASE = "https://api.vritjobs.com/api/jobs/";

interface VritJobsCompany {
  id: number;
  company_name: string;
  company_slug: string;
  company_logo?: string;
  location?: string;
}

interface VritJobsCategory {
  name: string;
  slug: string;
}

interface VritJobsPosition {
  name: string;
  id: number;
}

interface VritJobsAddress {
  id: number;
  name: string;
}

interface VritJobsLevel {
  name: string;
  id: number;
}

interface VritJobsLocation {
  name: string;
  id: number;
}

interface VritJobsTiming {
  name: string;
  id: number;
}

interface VritJobsJob {
  id: number;
  company: VritJobsCompany;
  category: VritJobsCategory;
  position: VritJobsPosition;
  address: VritJobsAddress[];
  level: VritJobsLevel;
  location: VritJobsLocation;
  timing: VritJobsTiming;
  public_id: string;
  title: string;
  required_number: number;
  description: string;
  salary_mode: string;
  min_salary: number | null;
  max_salary: number | null;
  is_negotiable: boolean;
  created_date: string;
  updated_date: string;
  expiry_date: string;
  is_active: boolean;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
}

interface VritJobsAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VritJobsJob[];
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
  minSalary: number | null,
  maxSalary: number | null,
  salaryMode: string,
  isNegotiable: boolean
): string | undefined {
  if (isNegotiable && (!minSalary && !maxSalary)) {
    return "Negotiable";
  }

  if (minSalary && maxSalary) {
    return `Rs. ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()} ${salaryMode}`;
  } else if (minSalary) {
    return `Rs. ${minSalary.toLocaleString()}+ ${salaryMode}`;
  } else if (maxSalary) {
    return `Rs. Up to ${maxSalary.toLocaleString()} ${salaryMode}`;
  }

  return isNegotiable ? "Negotiable" : undefined;
}

/**
 * Map VritJobs API response to JobData
 */
function mapToJobData(job: VritJobsJob): JobData {
  // Construct apply URL (assuming structure: /jobs/{public_id})
  const applyUrl = `${BASE_URL}/jobs/${job.public_id}`;

  // Format deadline from expiry_date
  let deadline: string | undefined;
  if (job.expiry_date) {
    const deadlineDate = new Date(job.expiry_date);
    if (!isNaN(deadlineDate.getTime())) {
      deadline = deadlineDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // Get location from address array or company location
  const location =
    job.address && job.address.length > 0
      ? job.address[0].name
      : job.company.location || "Nepal";

  // Format salary
  const salaryText = formatSalary(
    job.min_salary,
    job.max_salary,
    job.salary_mode,
    job.is_negotiable
  );

  // Format job type (timing.name like "Full Time", "Part Time")
  const jobType = job.timing?.name || undefined;

  // Detect if it's an internship based on title and position
  const isInternship = detectJobType(job.title, applyUrl, job.category?.name);

  // Calculate expiration date
  const expiresAt = job.expiry_date
    ? new Date(job.expiry_date)
    : calculateExpirationDate(deadline, new Date(job.created_date));

  return {
    title: job.title,
    applyUrl: applyUrl,
    company: job.company?.company_name || undefined,
    location: location,
    salaryText: salaryText,
    deadline: deadline,
    jobType: jobType,
    category: job.category?.name || undefined,
    type: isInternship,
    source: "vritjobs",
    description: cleanHtml(job.description) || undefined,
    expiresAt: expiresAt,
  };
}

/**
 * Scrape VritJobs using REST API
 * Fetches all pages and returns pre-fetched jobs
 */
export async function scrapeVritJobsList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    let currentPage = 1;
    // Use the provided URL if it's a full API URL, otherwise construct it
    let nextUrl: string | null = url.includes('api.vritjobs.com') 
      ? url 
      : `${API_BASE}?is_public=true&page=${currentPage}&search=&size=30`;

    // Fetch all pages using the 'next' field from API response
    while (nextUrl) {
      try {
        const response = await axios.get<VritJobsAPIResponse>(nextUrl, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
        });

        if (response.data?.results && Array.isArray(response.data.results)) {
          // Filter out expired jobs and map to JobData
          const now = new Date();
          const totalJobs = response.data.results.length;
          const validJobs = response.data.results.filter((job) => {
            if (!job.expiry_date) return true; // Include jobs without expiry date
            const expiryDate = new Date(job.expiry_date);
            return expiryDate > now; // Only include jobs where expiry is in the future
          });

          const expiredCount = totalJobs - validJobs.length;
          if (expiredCount > 0) {
            console.log(`[VritJobs] Filtered out ${expiredCount} expired job(s) on page ${currentPage}`);
          }

          const jobs = validJobs.map(mapToJobData);
          allJobs.push(...jobs);

          console.log(
            `[VritJobs] Fetched page ${currentPage}, ${jobs.length} jobs (total: ${allJobs.length})`
          );

          // Get next page URL from API response
          nextUrl = response.data.next;
          currentPage++;

          // Add small delay between requests
          if (nextUrl) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } else {
          console.warn(`[VritJobs] No data in response for page ${currentPage}`);
          break;
        }
      } catch (pageError: any) {
        console.error(
          `[VritJobs] Error fetching page ${currentPage}:`,
          pageError.message
        );
        break;
      }
    }

    console.log(`✅ VritJobs: Fetched ${allJobs.length} jobs from API`);

    // Return detail URLs for compatibility (though we already have the jobs)
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs,
    };
  } catch (error: any) {
    console.error(`❌ VritJobs API failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


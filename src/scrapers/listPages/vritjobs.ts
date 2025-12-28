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
 * Convert title to URL slug format
 */
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
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
  // Construct apply URL: /jobs/{title-slug}/{id}
  const titleSlug = titleToSlug(job.title);
  const applyUrl = `${BASE_URL}/jobs/${titleSlug}/${job.id}`;

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

  // Determine if it's an internship based on level (level 5 = Intern)
  // Level 2 = Entry level, Level 3 = Mid level, Level 4 = Senior, Level 5 = Intern
  const isInternship = job.level?.id === 5 ? "internship" : "job";

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
 * Fetch jobs for a specific level
 */
async function fetchJobsForLevel(
  level: number,
  levelName: string
): Promise<JobData[]> {
  const jobs: JobData[] = [];
  let currentPage = 1;
  let nextUrl: string | null = `${API_BASE}?is_public=true&page=${currentPage}&search=&size=30&level=${level}`;

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
      }) as any

      if (response.data?.results && Array.isArray(response.data.results)) {
        // Filter out expired jobs and map to JobData
        const now = new Date();
        const totalJobs = response.data.results.length;
        const validJobs = response.data.results.filter((job: VritJobsJob) => {
          if (!job.expiry_date) return true; // Include jobs without expiry date
          const expiryDate = new Date(job.expiry_date);
          return expiryDate > now; // Only include jobs where expiry is in the future
        });

        const expiredCount = totalJobs - validJobs.length;
        if (expiredCount > 0) {
          console.log(`[VritJobs ${levelName}] Filtered out ${expiredCount} expired job(s) on page ${currentPage}`);
        }

        const mappedJobs = validJobs.map(mapToJobData);
        jobs.push(...mappedJobs);

        console.log(
          `[VritJobs ${levelName}] Fetched page ${currentPage}, ${mappedJobs.length} jobs (total: ${jobs.length})`
        );

        // Get next page URL from API response
        nextUrl = response.data.next;
        currentPage++;

        // Add small delay between requests
        if (nextUrl) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } else {
        console.warn(`[VritJobs ${levelName}] No data in response for page ${currentPage}`);
        break;
      }
    } catch (pageError: any) {
      console.error(
        `[VritJobs ${levelName}] Error fetching page ${currentPage}:`,
        pageError.message
      );
      break;
    }
  }

  return jobs;
}

/**
 * Scrape VritJobs using REST API
 * Fetches all pages for all levels and returns pre-fetched jobs
 * Level 2 = Entry level, Level 3 = Mid level, Level 4 = Senior, Level 5 = Intern
 */
export async function scrapeVritJobsList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    
    // Fetch jobs for all levels
    const levels = [
      { id: 2, name: "Entry level" },
      { id: 3, name: "Mid level" },
      { id: 4, name: "Senior" },
      { id: 5, name: "Intern" },
    ];

    console.log(`[VritJobs] Fetching jobs for all levels...`);
    
    // Fetch all levels in parallel for better performance
    const levelPromises = levels.map((level) => fetchJobsForLevel(level.id, level.name));
    const levelResults = await Promise.all(levelPromises);
    
    // Combine all jobs
    for (const levelJobs of levelResults) {
      allJobs.push(...levelJobs);
    }

    console.log(`✅ VritJobs: Fetched ${allJobs.length} jobs from API across all levels`);

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


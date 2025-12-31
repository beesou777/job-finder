import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://merojob.com";
const API_BASE = "https://api.merojob.com/api/v1/jobs";

interface MeroJobLocation {
  id: number;
  name: string;
  address: string;
  street: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  local_government: string | null;
}

interface MeroJobSalary {
  id: number;
  currency: string;
  operator: string | null;
  minimum: number;
  unit: string;
  maximum: number | null;
}

interface MeroJobClient {
  id: number;
  client_name: string;
  client_image: string;
  slug: string;
  industry: string;
  org_name: string;
  website: string;
  location: string;
}

interface MeroJob {
  id: number;
  title: string;
  slug: string;
  client: MeroJobClient;
  categories: string[];
  description: string;
  specification: string;
  alternate_description: string | null;
  skills: string[];
  available_for: string[];
  job_level: string;
  vacancies: number;
  deadline: string;
  job_service: {
    id: number;
    name: string;
    service_type: string;
    level: number;
  };
  education_level: string;
  education_description: string;
  offered_salary: MeroJobSalary | null;
  job_locations: MeroJobLocation[];
  hide_org_name: boolean;
  modified_at: string;
  posted_at: string;
  posted_date: string;
  apply_online: boolean;
  status: string;
  apply_online_alternative: string;
  absolute_url: string;
  industry: string;
  experience_required: string;
}

interface MeroJobResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MeroJob[];
}

/**
 * Clean HTML from text
 */
function cleanHtml(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  return $.text().trim();
}

/**
 * Map MeroJob API response to JobData
 */
function mapToJobData(job: MeroJob): JobData {
  // Construct apply URL
  const applyUrl = job.absolute_url
    ? `${BASE_URL}${job.absolute_url}`
    : `${BASE_URL}/${job.slug}`;

  // Format salary
  let salaryText: string | undefined;
  if (job.offered_salary) {
    const salary = job.offered_salary;
    if (salary.minimum && salary.maximum) {
      salaryText = `${salary.currency} ${salary.minimum.toLocaleString()} - ${salary.maximum.toLocaleString()} ${salary.unit}`;
    } else if (salary.minimum) {
      const operator = salary.operator ? `${salary.operator} ` : "";
      salaryText = `${salary.currency} ${operator}${salary.minimum.toLocaleString()} ${salary.unit}`;
    }
  }

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

  // Format location - use first job location or client location
  let location: string | undefined;
  if (job.job_locations && job.job_locations.length > 0) {
    const jobLocation = job.job_locations[0];
    location = jobLocation.address || jobLocation.name || undefined;
  } else if (job.client?.location) {
    location = job.client.location;
  }

  // Get job type from available_for array
  const jobType = job.available_for && job.available_for.length > 0 
    ? job.available_for.join(", ") 
    : undefined;

  // Get category from categories array
  const category = job.categories && job.categories.length > 0
    ? job.categories[0]
    : job.client?.industry || undefined;

  // Detect if it's an internship
  const isInternship =
    job.title.toLowerCase().includes("intern") ||
    job.title.toLowerCase().includes("internship") ||
    job.categories.some((cat) => cat.toLowerCase().includes("intern"));

  // Clean and combine description
  let description = cleanHtml(job.description);
  if (job.alternate_description) {
    description += "\n\n" + cleanHtml(job.alternate_description);
  }

  // Clean requirements/specification
  const requirements = cleanHtml(job.specification);

  return {
    title: job.title,
    applyUrl: applyUrl,
    company: job.client?.org_name || job.client?.client_name || undefined,
    location: location,
    salaryText: salaryText,
    deadline: deadline,
    jobType: jobType,
    category: category,
    type: isInternship ? "internship" : "job",
    source: "merojob",
    description: description || undefined,
    requirements: requirements || undefined,
  };
}

/**
 * Scrape MeroJob using REST API
 * Fetches all pages and returns pre-fetched jobs
 */
export async function scrapeMeroJobList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    // Use a larger page_size to fetch more jobs per page (50 is a reasonable default)
    let currentUrl: string | null = `${API_BASE}/?page=1&page_size=50`;
    let pageCount = 0;
    let totalCount: number | null = null; // Total jobs available from API
    const maxPages = 50; // Increased limit to handle 400+ jobs

    // Fetch all pages using the 'next' URL from API response
    while (currentUrl && pageCount < maxPages) {
      try {
        const response: { data: MeroJobResponse } = await axios.get<MeroJobResponse>(currentUrl, {
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
        });

        // Get total count from first page
        if (totalCount === null && response.data?.count !== undefined) {
          totalCount = response.data.count;
          console.log(`    📊 Total jobs available: ${totalCount}`);
        }

        if (!response.data?.results || response.data.results.length === 0) {
          break;
        }

        const jobs = response.data.results;
        const mappedJobs = jobs.map(mapToJobData);
        allJobs.push(...mappedJobs);

        pageCount++;
        console.log(
          `    📄 Page ${pageCount}: Fetched ${jobs.length} jobs (total: ${allJobs.length}${totalCount ? `/${totalCount}` : ''})`
        );

        // Check if we've fetched all jobs
        if (totalCount !== null && allJobs.length >= totalCount) {
          console.log(`    ✅ Fetched all ${totalCount} jobs`);
          break;
        }

        // Get next page URL from API response
        currentUrl = response.data.next;

        // If no next page, we're done
        if (!currentUrl) {
          break;
        }

        // Add small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(
          `    ❌ Error fetching page ${pageCount + 1}: ${error.message}`
        );
        break;
      }
    }

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
    console.error(`Error scraping MeroJob list: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";
import { detectJobType } from "../core/types";

const BASE_URL = "https://vocalpanda.com";
const API_BASE = "https://prod.vocalpanda.com/api/getFindAJobMultipleSearchCriteria";

interface VocalPandaJob {
  id?: number | string;
  job_title?: string;
  job_title_set?: string;
  company_name?: string;
  company?: string;
  location?: string;
  job_location?: string;
  salary?: string;
  salary_from?: number;
  salary_to?: number;
  salary_type?: string;
  deadline?: string;
  expiry_date?: string;
  job_category?: string;
  category?: string;
  job_type?: string;
  work_mode?: string;
  description?: string;
  requirements?: string;
  apply_url?: string;
  url?: string;
  slug?: string;
  created_at?: string;
  posted_date?: string;
  [key: string]: any; // Allow for flexible response structure
}

interface VocalPandaResponse {
  success?: boolean;
  data?: VocalPandaJob[] | { jobs?: VocalPandaJob[]; results?: VocalPandaJob[]; items?: VocalPandaJob[] };
  jobs?: VocalPandaJob[];
  results?: VocalPandaJob[];
  items?: VocalPandaJob[];
  total?: number;
  count?: number;
  page?: number;
  totalPages?: number;
  total_pages?: number;
  hasMore?: boolean;
  [key: string]: any;
}

/**
 * Map VocalPanda API response to JobData
 */
function mapToJobData(job: VocalPandaJob): JobData {
  // Construct apply URL
  let applyUrl: string;
  if (job.apply_url) {
    applyUrl = job.apply_url.startsWith("http") ? job.apply_url : `${BASE_URL}${job.apply_url}`;
  } else if (job.url) {
    applyUrl = job.url.startsWith("http") ? job.url : `${BASE_URL}${job.url}`;
  } else if (job.slug) {
    applyUrl = `${BASE_URL}/jobs/${job.slug}`;
  } else if (job.id) {
    applyUrl = `${BASE_URL}/jobs/${job.id}`;
  } else {
    applyUrl = BASE_URL; // Fallback
  }

  // Get title
  const title = job.job_title || job.job_title_set || "Untitled Job";

  // Get company
  const company = job.company_name || job.company;

  // Get location
  const location = job.location || job.job_location;

  // Format salary
  let salaryText: string | undefined;
  if (job.salary) {
    salaryText = job.salary;
  } else if (job.salary_from && job.salary_to) {
    const salaryType = job.salary_type || "per month";
    salaryText = `Rs. ${job.salary_from.toLocaleString()} - ${job.salary_to.toLocaleString()} ${salaryType}`;
  } else if (job.salary_from) {
    const salaryType = job.salary_type || "per month";
    salaryText = `Rs. ${job.salary_from.toLocaleString()} ${salaryType}`;
  }

  // Format deadline
  let deadline: string | undefined;
  if (job.deadline) {
    try {
      const deadlineDate = new Date(job.deadline);
      deadline = deadlineDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      deadline = job.deadline;
    }
  } else if (job.expiry_date) {
    try {
      const deadlineDate = new Date(job.expiry_date);
      deadline = deadlineDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      deadline = job.expiry_date;
    }
  }

  // Get category
  const category = job.job_category || job.category;

  // Get job type
  const jobType = job.job_type || job.work_mode;

  // Clean HTML from description and requirements
  const cleanHtml = (html: string): string => {
    if (!html) return "";
    try {
      const $ = cheerio.load(html);
      return $.text().trim();
    } catch {
      return String(html).trim();
    }
  };

  // Determine type (job or internship)
  const type = detectJobType(title, applyUrl, category);

  return {
    title,
    applyUrl,
    company: company || undefined,
    location: location || undefined,
    salaryText: salaryText || undefined,
    deadline: deadline || undefined,
    jobType: jobType || undefined,
    category: category || undefined,
    type,
    source: "vocalpanda",
    description: job.description ? cleanHtml(job.description) : undefined,
    requirements: job.requirements ? cleanHtml(job.requirements) : undefined,
  };
}

/**
 * Scrape VocalPanda using POST API
 * Fetches all pages and returns pre-fetched jobs
 */
export async function scrapeVocalPandaList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let hasMore = true;

    // Fetch all pages
    do {
      try {
        const requestBody = {
          education_degree_set: "",
          experience: 0,
          experience_type: null,
          id: 0,
          job_category: "",
          job_location_lat_set: "",
          job_location_lng_set: "",
          job_title_set: "",
          job_type: "",
          page_number: currentPage,
          page_size: 100,
          salary_from: 0,
          salary_to: 0,
          salary_type: null,
          slug: null,
          work_mode: "",
        };

        const response = await axios.post<VocalPandaResponse>(
          API_BASE,
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              "Accept": "application/json",
            },
            timeout: 15000,
          }
        );

        // Handle different response structures
        let jobs: VocalPandaJob[] = [];
        
        if (Array.isArray(response.data)) {
          jobs = response.data;
        } else if (response.data?.data) {
          if (Array.isArray(response.data.data)) {
            jobs = response.data.data;
          } else if (response.data.data.jobs) {
            jobs = response.data.data.jobs;
          } else if (response.data.data.results) {
            jobs = response.data.data.results;
          } else if (response.data.data.items) {
            jobs = response.data.data.items;
          }
        } else if (response.data?.jobs) {
          jobs = response.data.jobs;
        } else if (response.data?.results) {
          jobs = response.data.results;
        } else if (response.data?.items) {
          jobs = response.data.items;
        }

        if (!jobs || jobs.length === 0) {
          break;
        }

        const mappedJobs = jobs.map(mapToJobData);
        allJobs.push(...mappedJobs);

        // Determine pagination
        totalPages = response.data?.totalPages || 
                     response.data?.total_pages || 
                     Math.ceil((response.data?.total || response.data?.count || jobs.length) / 100);

        console.log(
          `    📄 Page ${currentPage}/${totalPages}: Fetched ${jobs.length} jobs (total: ${allJobs.length})`
        );

        hasMore = currentPage < totalPages && jobs.length === 100;
        currentPage++;

        // Add small delay between requests
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        console.error(
          `    ❌ Error fetching page ${currentPage}: ${error.message}`
        );
        if (error.response) {
          console.error(`    Response status: ${error.response.status}`);
          console.error(`    Response data:`, error.response.data);
        }
        break;
      }
    } while (hasMore);

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
    console.error(`Error scraping VocalPanda list: ${error.message}`);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }
    return { detailUrls: [], hasMore: false };
  }
}


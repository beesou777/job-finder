import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";
import { detectJobType } from "../core/types";

const BASE_URL = "https://www.vocalpanda.com";
const API_BASE = "https://prod.vocalpanda.com/api/getFindAJobMultipleSearchCriteria";

interface VocalPandaJob {
  job_id?: number | string;
  id?: number | string; // Fallback
  job_title?: string;
  job_title_set?: string;
  first_name?: string; // Company name
  company_name?: string;
  company?: string;
  job_location?: string;
  location?: string;
  offered_salary?: string;
  salary?: string;
  salary_from?: number | null;
  salary_to?: number | null;
  salary_type?: string;
  deadline?: string;
  expiry_date?: string;
  job_category?: string;
  category?: string;
  job_type_name?: string; // e.g., "Full Time"
  job_type?: string;
  work_mode?: string;
  job_description?: string;
  description?: string;
  requirements?: string;
  apply_url?: string;
  url?: string;
  slug?: string;
  created_date?: string;
  created_at?: string;
  posted_date?: string;
  [key: string]: any; // Allow for flexible response structure
}

interface VocalPandaResponse {
  response?: {
    count?: number;
    job_list?: VocalPandaJob[];
  };
  success?: boolean;
  data?:
    | VocalPandaJob[]
    | {
        jobs?: VocalPandaJob[];
        results?: VocalPandaJob[];
        items?: VocalPandaJob[];
        response?: { job_list?: VocalPandaJob[]; count?: number };
      };
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
  // Construct apply URL - format: https://www.vocalpanda.com/{slug}
  let applyUrl: string;
  if (job.slug) {
    // Remove leading slash if present and ensure proper format
    const slug = job.slug.startsWith("/") ? job.slug.slice(1) : job.slug;
    applyUrl = `${BASE_URL}/${slug}`;
  } else if (job.apply_url) {
    applyUrl = job.apply_url.startsWith("http") ? job.apply_url : `${BASE_URL}${job.apply_url}`;
  } else if (job.url) {
    applyUrl = job.url.startsWith("http") ? job.url : `${BASE_URL}${job.url}`;
  } else if (job.job_id) {
    // Construct slug from job_title and job_id
    const jobId = job.job_id;
    const title = (job.job_title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    applyUrl = `${BASE_URL}/${title}-${jobId}`;
  } else if (job.id) {
    // Fallback: use ID if slug is not available
    applyUrl = `${BASE_URL}/job-${job.id}`;
  } else {
    applyUrl = BASE_URL; // Final fallback
  }

  // Get title
  const title = job.job_title || job.job_title_set || "Untitled Job";

  // Get company (first_name is the company name in the API response)
  const company = job.first_name || job.company_name || job.company;

  // Get location
  const location = job.location || job.job_location;

  // Format salary
  let salaryText: string | undefined;
  if (job.offered_salary) {
    salaryText = job.offered_salary;
  } else if (job.salary) {
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

  // Get job type (job_type_name is "Full Time", "Part Time", etc.)
  const jobType = job.job_type_name || job.job_type || job.work_mode;

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
    description: job.job_description
      ? cleanHtml(job.job_description)
      : job.description
        ? cleanHtml(job.description)
        : undefined,
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

        console.log(`    🔍 Making POST request to ${API_BASE}...`);
        console.log(`    📤 Request body:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post<VocalPandaResponse>(API_BASE, requestBody, {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
          timeout: 15000,
        });

        console.log(`    ✅ API Response received (status: ${response.status})`);
        console.log(`    📥 Response structure:`, Object.keys(response.data || {}));
        console.log(
          `    📥 Response data sample:`,
          JSON.stringify(response.data).substring(0, 500),
        );

        // Handle different response structures
        // Primary structure: response.data.response.job_list (based on actual API response)
        let jobs: VocalPandaJob[] = [];

        // Check for response.response.job_list (actual structure)
        if (response.data?.response?.job_list) {
          jobs = response.data.response.job_list;
          console.log(`    ✅ Found jobs in response.data.response.job_list: ${jobs.length}`);
        } else if (response.data?.response && Array.isArray(response.data.response)) {
          jobs = response.data.response;
          console.log(`    ✅ Found jobs in response.data.response (array): ${jobs.length}`);
        } else if (Array.isArray(response.data)) {
          jobs = response.data;
          console.log(`    ✅ Found jobs in root array: ${jobs.length}`);
        } else if (response.data?.data) {
          if (
            typeof response.data.data === "object" &&
            !Array.isArray(response.data.data) &&
            response.data.data.response?.job_list
          ) {
            jobs = response.data.data.response.job_list;
            console.log(
              `    ✅ Found jobs in response.data.data.response.job_list: ${jobs.length}`,
            );
          } else if (Array.isArray(response.data.data)) {
            jobs = response.data.data;
            console.log(`    ✅ Found jobs in response.data.data (array): ${jobs.length}`);
          } else if (response.data.data.jobs) {
            jobs = response.data.data.jobs;
            console.log(`    ✅ Found jobs in response.data.data.jobs: ${jobs.length}`);
          } else if (response.data.data.results) {
            jobs = response.data.data.results;
            console.log(`    ✅ Found jobs in response.data.data.results: ${jobs.length}`);
          } else if (response.data.data.items) {
            jobs = response.data.data.items;
            console.log(`    ✅ Found jobs in response.data.data.items: ${jobs.length}`);
          } else {
            console.log(
              `    ⚠️  response.data.data exists but no jobs array found. Keys:`,
              Object.keys(response.data.data || {}),
            );
          }
        } else if (response.data?.jobs) {
          jobs = response.data.jobs;
          console.log(`    ✅ Found jobs in response.data.jobs: ${jobs.length}`);
        } else if (response.data?.results) {
          jobs = response.data.results;
          console.log(`    ✅ Found jobs in response.data.results: ${jobs.length}`);
        } else if (response.data?.items) {
          jobs = response.data.items;
          console.log(`    ✅ Found jobs in response.data.items: ${jobs.length}`);
        } else {
          console.log(
            `    ⚠️  No jobs found in expected locations. Full response keys:`,
            Object.keys(response.data || {}),
          );
          console.log(
            `    📋 Full response:`,
            JSON.stringify(response.data, null, 2).substring(0, 1000),
          );
        }

        if (!jobs || jobs.length === 0) {
          console.log(`    ⚠️  No jobs extracted from response. Breaking pagination loop.`);
          break;
        }

        const mappedJobs = jobs.map(mapToJobData);
        allJobs.push(...mappedJobs);

        // Determine pagination
        // Check count in response.response.count (actual structure)
        const totalCount =
          response.data?.response?.count ||
          response.data?.count ||
          response.data?.total ||
          jobs.length;
        totalPages =
          response.data?.totalPages || response.data?.total_pages || Math.ceil(totalCount / 100);

        console.log(
          `    📄 Page ${currentPage}/${totalPages}: Fetched ${jobs.length} jobs (total: ${allJobs.length})`,
        );

        hasMore = currentPage < totalPages && jobs.length === 100;
        currentPage++;

        // Add small delay between requests
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        console.error(`    ❌ Error fetching page ${currentPage}: ${error.message}`);
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

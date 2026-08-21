import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://internsathi.com";
const GRAPHQL_API = "https://api.internsathi.com/graphql";

interface InternSathiJob {
  jobId: string;
  title: string;
  cityName: string;
  jobType: string;
  jobLocation: string;
  Creator: {
    companyName: string;
    profileURL: string;
  };
  deadline: string;
  opportunityType: "INTERNSHIP" | "JOB";
  description: string;
  requirements: string;
  responsibilities?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
  sectorName?: string;
  slug: string;
  createdAt: string;
}

interface GraphQLResponse {
  data: {
    getJobs: {
      currentPage: number;
      lastPage: number;
      nextPage: number | null;
      totalCount: number;
      result: InternSathiJob[];
    };
  };
}

const GRAPHQL_QUERY = `
  query getJobs($filter: FilterJobInput!, $input: GetJobsInput!) {
    getJobs(filter: $filter, input: $input) {
      currentPage
      lastPage
      nextPage
      prevPage
      totalCount
      result {
        jobId
        title
        cityName
        jobType
        jobLocation
        Creator {
          companyName
          profileURL
        }
        deadline
        opportunityType
        description
        requirements
        responsibilities
        salaryMin
        salaryMax
        salaryType
        sectorName
        slug
        createdAt
      }
    }
  }
`;

/**
 * Map Intern Sathi API response to JobData
 */
function mapToJobData(job: InternSathiJob): JobData {
  // Construct apply URL
  const applyUrl = `${BASE_URL}/jobs/${job.slug}`;

  // Format salary
  let salaryText: string | undefined;
  if (job.salaryMin && job.salaryMax) {
    const salaryType =
      job.salaryType === "MONTHLY" ? "per month" : job.salaryType?.toLowerCase() || "";
    salaryText = `Rs. ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${salaryType}`;
  } else if (job.salaryMin) {
    const salaryType =
      job.salaryType === "MONTHLY" ? "per month" : job.salaryType?.toLowerCase() || "";
    salaryText = `Rs. ${job.salaryMin.toLocaleString()} ${salaryType}`;
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

  // Format location
  const location = job.cityName || job.jobLocation || undefined;

  // Clean HTML from description and requirements
  const cleanHtml = (html: string): string => {
    if (!html) return "";
    const $ = cheerio.load(html);
    return $.text().trim();
  };

  // Combine description and responsibilities
  let description = cleanHtml(job.description);
  if (job.responsibilities) {
    description += "\n\nResponsibilities:\n" + cleanHtml(job.responsibilities);
  }

  // Determine type
  const type = job.opportunityType === "INTERNSHIP" ? "internship" : "job";

  return {
    title: job.title,
    applyUrl: applyUrl,
    company: job.Creator?.companyName || undefined,
    location: location,
    salaryText: salaryText,
    deadline: deadline,
    jobType: job.jobType || undefined,
    category: job.sectorName || undefined,
    type: type,
    source: "internsathi",
    description: description || undefined,
    requirements: cleanHtml(job.requirements) || undefined,
  };
}

/**
 * Helper function to fetch jobs for a specific opportunity type
 */
async function fetchJobsByType(opportunityType: "INTERNSHIP" | "JOB"): Promise<{
  jobs: InternSathiJob[];
  hasMore: boolean;
  nextPage: number | null;
  currentPage: number;
  lastPage: number;
}> {
  const variables = {
    filter: {
      search: "",
      limit: 500,
      sort: null,
    },
    input: {
      jobStatus: "OPEN",
      opportunityType: opportunityType,
    },
  };

  const response = await axios.post<GraphQLResponse>(
    GRAPHQL_API,
    {
      operationName: "getJobs",
      query: GRAPHQL_QUERY,
      variables,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    },
  );

  if (!response.data?.data?.getJobs?.result) {
    return {
      jobs: [],
      hasMore: false,
      nextPage: null,
      currentPage: 0,
      lastPage: 0,
    };
  }

  const getJobsData = response.data.data.getJobs;
  const hasMore = getJobsData.nextPage !== null && getJobsData.currentPage < getJobsData.lastPage;

  return {
    jobs: getJobsData.result,
    hasMore,
    nextPage: getJobsData.nextPage,
    currentPage: getJobsData.currentPage,
    lastPage: getJobsData.lastPage,
  };
}

/**
 * Scrape Intern Sathi using GraphQL API
 * Fetches both jobs and internships
 * Returns both detail URLs and pre-fetched job data
 */
export async function scrapeInternSathiList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    // First API call for JOB type
    const jobData = await fetchJobsByType("JOB");

    // Second API call for INTERNSHIP type
    const internshipData = await fetchJobsByType("INTERNSHIP");

    // Combine all jobs from both types
    const allJobs = [...jobData.jobs, ...internshipData.jobs];

    if (allJobs.length === 0) {
      return { detailUrls: [], hasMore: false };
    }

    // Map all jobs to JobData immediately (we have all the data from API)
    const preFetchedJobs = allJobs.map(mapToJobData);

    // Also return detail URLs for compatibility
    const detailUrls = preFetchedJobs.map((job: JobData) => job.applyUrl);

    // Consider hasMore if either type has more pages
    const hasMore = internshipData.hasMore || jobData.hasMore;

    return {
      detailUrls,
      hasMore,
      nextPageUrl: hasMore ? `${url}?page=2` : undefined,
      preFetchedJobs, // Return pre-fetched jobs
    };
  } catch (error: any) {
    console.error(`Error scraping Intern Sathi list: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}

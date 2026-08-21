import axios from "axios";
import { JobData, detectJobType } from "../core/types";
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
      result: InternSathiJob[];
    };
  };
}

const GRAPHQL_QUERY = `
  query getJobs($filter: FilterJobInput!, $input: GetJobsInput!) {
    getJobs(filter: $filter, input: $input) {
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
 * Scrape Intern Sathi job detail using GraphQL API
 * We extract the jobId from the URL and fetch from API
 */
export async function scrapeInternSathiDetail(url: string): Promise<JobData | null> {
  try {
    // Extract jobId or slug from URL
    // URL format: https://internsathi.com/slug or https://internsathi.com/job/jobId
    const urlParts = url.split("/");
    const identifier = urlParts[urlParts.length - 1];

    // Try to find the job by searching with the identifier
    // We'll search both internships and jobs
    const opportunityTypes: ("INTERNSHIP" | "JOB")[] = ["INTERNSHIP", "JOB"];

    for (const opportunityType of opportunityTypes) {
      const variables = {
        filter: {
          search: identifier,
          limit: 100,
          sort: null,
        },
        input: {
          jobStatus: "OPEN",
          opportunityType: opportunityType,
        },
      };

      try {
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

        if (response.data?.data?.getJobs?.result) {
          // Find the job that matches our URL
          const job = response.data.data.getJobs.result.find(
            (j) =>
              j.slug === identifier ||
              j.jobId === identifier ||
              url.includes(j.slug) ||
              url.includes(j.jobId),
          );

          if (job) {
            return mapToJobData(job, url);
          }
        }
      } catch (error) {
        // Continue to next opportunity type
        continue;
      }
    }

    // If not found via API, try to scrape from HTML as fallback
    return await scrapeFromHTML(url);
  } catch (error: any) {
    console.error(`Error scraping Intern Sathi detail: ${error.message}`);
    return null;
  }
}

/**
 * Map Intern Sathi API response to JobData
 */
function mapToJobData(job: InternSathiJob, applyUrl: string): JobData {
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
 * Fallback: Try to scrape from HTML if API fails
 */
async function scrapeFromHTML(url: string): Promise<JobData | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Try to extract basic info from HTML
    const title = $("h1").first().text().trim() || $("title").text().trim();
    const company = $("[class*='company']").first().text().trim();
    const location = $("[class*='location']").first().text().trim();
    const description = $("[class*='description']").first().text().trim();
    const requirements = $("[class*='requirement']").first().text().trim();

    if (!title) {
      return null;
    }

    return {
      title,
      applyUrl: url,
      company: company || undefined,
      location: location || undefined,
      type: detectJobType(title, url),
      source: "internsathi",
      description: description || undefined,
      requirements: requirements || undefined,
    };
  } catch (error) {
    return null;
  }
}

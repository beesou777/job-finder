import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://recruitnepal.com";
const API_BASE = "https://api.recruitnepal.com/api/v1/application/questions";

interface RecruitNepalVacancy {
  id: string;
  title: string;
  description: string;
  key_responsibilities: string;
  vehicle_required: boolean;
  licence_required: boolean;
  deadline_date: string;
  location: string;
  slug: string;
  education_level: string;
  employment_type: string[];
  created_by_id: string;
  skills_required: string[];
  expected_salary: Array<{
    value: number;
    inclusive: boolean;
  }>;
  category_id: string;
  level: string;
  openings: string;
  work_approach: string[];
  experience: string | null;
  tags: string[];
  gender: string;
  salary_type: string;
  status: string;
  experience_level: {
    max: number;
    min: number;
    level: string;
  };
  total_views: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

interface RecruitNepalQuestion {
  id: string;
  question: string;
  type: string;
  vacancy_id: string;
  created_at: string;
  updated_at: string;
  application_question_vacancy: RecruitNepalVacancy;
  answers: Array<{
    id: string;
    question_id: string;
    answer: string;
    created_at: string;
    updated_at: string;
  }>;
}

interface RecruitNepalAPIResponse {
  data: RecruitNepalQuestion[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    nextPage: number | null;
  };
}

/**
 * Clean HTML from text
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
 * Format salary from expected_salary array
 */
function formatSalary(salaryArray: Array<{ value: number; inclusive: boolean }> | undefined): string {
  if (!salaryArray || salaryArray.length === 0) {
    return "Negotiable";
  }

  if (salaryArray.length === 1) {
    const salary = salaryArray[0];
    return salary.inclusive ? `Up to ${salary.value.toLocaleString()}` : `${salary.value.toLocaleString()}+`;
  }

  const minSalary = salaryArray.find((s) => s.inclusive)?.value;
  const maxSalary = salaryArray.find((s) => !s.inclusive)?.value;

  if (minSalary && maxSalary) {
    return `${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()}`;
  } else if (minSalary) {
    return `Up to ${minSalary.toLocaleString()}`;
  } else if (maxSalary) {
    return `${maxSalary.toLocaleString()}+`;
  }

  return "Negotiable";
}

/**
 * Map RecruitNepal vacancy to JobData
 */
function mapToJobData(vacancy: RecruitNepalVacancy): JobData {
  // Construct apply URL using slug
  const applyUrl = `${BASE_URL}/jobs/${vacancy.slug}`;

  // Format salary
  const salaryText = formatSalary(vacancy.expected_salary);

  // Format deadline
  let deadline: string | undefined;
  if (vacancy.deadline_date) {
    const deadlineDate = new Date(vacancy.deadline_date);
    deadline = deadlineDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Get location
  const location = vacancy.location || undefined;

  // Get job type from employment_type array
  const jobType = vacancy.employment_type && vacancy.employment_type.length > 0
    ? vacancy.employment_type.join(", ")
    : undefined;

  // Get category from tags or level
  const category = vacancy.tags && vacancy.tags.length > 0
    ? vacancy.tags[0]
    : vacancy.level || undefined;

  // Detect if it's an internship
  const isInternship =
    vacancy.title.toLowerCase().includes("intern") ||
    vacancy.title.toLowerCase().includes("internship") ||
    vacancy.title.toLowerCase().includes("trainee") ||
    vacancy.tags.some((tag) => tag.toLowerCase().includes("intern"));

  // Clean and combine description
  let description = cleanHtml(vacancy.description);
  if (vacancy.key_responsibilities) {
    description += "\n\n" + cleanHtml(vacancy.key_responsibilities);
  }

  // Get skills as requirements
  const requirements = vacancy.skills_required && vacancy.skills_required.length > 0
    ? vacancy.skills_required.join(", ")
    : undefined;

  return {
    title: vacancy.title,
    applyUrl: applyUrl,
    company: undefined, // Company name not in this API response
    location: location,
    salaryText: salaryText,
    deadline: deadline,
    jobType: jobType,
    category: category,
    type: isInternship ? "internship" : "job",
    source: "recruitnepal",
    description: description || undefined,
    requirements: requirements || undefined,
  };
}

/**
 * Scrape RecruitNepal using REST API
 * Uses the questions API which includes vacancy data
 */
export async function scrapeRecruitNepalList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[]; // Return pre-fetched jobs to avoid double-fetching
}> {
  try {
    const allJobs: JobData[] = [];
    const seenVacancyIds = new Set<string>(); // Track unique vacancies
    let currentPage = 1;
    let totalPages = 1;
    const maxPages = 100; // Limit to prevent infinite loops
    const limit = 1000; // Fetch many questions per page

    // Fetch all pages
    do {
      try {
        const response = await axios.get<RecruitNepalAPIResponse>(
          `${API_BASE}?page=${currentPage}&limit=${limit}`,
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 15000,
          }
        );

        if (!response.data?.data || response.data.data.length === 0) {
          break;
        }

        // Extract unique vacancies from questions
        const vacancies = new Map<string, RecruitNepalVacancy>();

        for (const question of response.data.data) {
          const vacancy = question.application_question_vacancy;
          if (vacancy && vacancy.status === "approved" && !seenVacancyIds.has(vacancy.id)) {
            vacancies.set(vacancy.id, vacancy);
            seenVacancyIds.add(vacancy.id);
          }
        }

        // Filter out expired jobs
        const now = new Date();
        const activeVacancies = Array.from(vacancies.values()).filter((vacancy) => {
          if (!vacancy.deadline_date) return true; // Include jobs without deadline
          const deadlineDate = new Date(vacancy.deadline_date);
          return deadlineDate > now;
        });

        const jobs = activeVacancies.map(mapToJobData);
        allJobs.push(...jobs);

        // Update pagination info
        totalPages = response.data.pagination?.pages || 1;
        const fetchedPage = response.data.pagination?.page || currentPage;

        console.log(
          `    📄 Page ${fetchedPage}/${totalPages}: Found ${jobs.length} unique jobs from ${response.data.data.length} questions (total: ${allJobs.length})`
        );

        // Check if there's a next page
        const nextPage = response.data.pagination?.nextPage;
        if (
          fetchedPage >= totalPages ||
          !nextPage ||
          currentPage >= maxPages
        ) {
          break;
        }

        currentPage = nextPage;
      } catch (error: any) {
        console.error(
          `    ❌ Error fetching page ${currentPage}: ${error.message}`
        );
        break;
      }

      // Add small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (currentPage <= totalPages && currentPage <= maxPages);

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
    console.error(`Error scraping RecruitNepal list: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


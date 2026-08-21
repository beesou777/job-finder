import { JobData } from "../core/types";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.ramrojob.com";

/**
 * Scrape RamroJob detail page
 * Since we're using API, this is mainly for backward compatibility
 * The list scraper should already have all the data we need
 */
export async function scrapeRamroJobDetail(url: string): Promise<JobData | null> {
  try {
    // Extract slug from URL (e.g., https://www.ramrojob.com/jobs/some-job-slug)
    const slugMatch = url.match(/\/jobs\/([^\/\?]+)/);
    if (!slugMatch) {
      return null;
    }

    const slug = slugMatch[1];

    // Try to fetch from API first
    try {
      const response = await axios.get(`${BASE_URL}/api/jobs/${slug}`, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      // If API returns data, map it
      if (response.data?.data) {
        const job = response.data.data;
        return mapApiResponseToJobData(job, url);
      }
    } catch (apiError) {
      // Fallback to HTML scraping
      console.log(`[RamroJob] API failed for ${slug}, trying HTML...`);
    }

    // Fallback: Scrape from HTML
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    const title = $("h1, .job-title, .title").first().text().trim();
    const company = $(".company-name, .organization-name, [class*='company']")
      .first()
      .text()
      .trim();
    const location = $(".location, .city, [class*='location']").first().text().trim();
    const salaryText = $(".salary, [class*='salary']").first().text().trim();
    const deadline = $(".deadline, [class*='deadline']").first().text().trim();
    const description = $(".job-description, .description, [class*='description']")
      .first()
      .text()
      .trim();
    const requirements = $(".requirements, [class*='requirement']").first().text().trim();
    const category = $(".category, [class*='category']").first().text().trim();

    if (!title) {
      return null;
    }

    const isInternship =
      title.toLowerCase().includes("intern") || title.toLowerCase().includes("internship");

    return {
      title,
      applyUrl: url,
      company: company || undefined,
      location: location || undefined,
      salaryText: salaryText || undefined,
      deadline: deadline || undefined,
      category: category || undefined,
      description: description || undefined,
      requirements: requirements || undefined,
      type: isInternship ? "internship" : "job",
      source: "ramrojob",
    };
  } catch (error: any) {
    console.error(`❌ RamroJob detail scraping failed for ${url}:`, error.message);
    return null;
  }
}

/**
 * Map API response to JobData (helper function)
 */
function mapApiResponseToJobData(job: any, url: string): JobData {
  const location = job.organization?.city || job.organization?.district || "Nepal";

  const cleanHtml = (html: string): string => {
    if (!html) return "";
    try {
      const $ = cheerio.load(html);
      return $.text().trim();
    } catch {
      return html.replace(/<[^>]*>/g, "").trim();
    }
  };

  let deadline: string | undefined;
  if (job.deadline) {
    const deadlineDate = new Date(job.deadline);
    deadline = deadlineDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const isInternship =
    job.job_title?.toLowerCase().includes("intern") ||
    job.job_title?.toLowerCase().includes("internship");

  return {
    title: job.job_title || job.title || "",
    applyUrl: url,
    company: job.organization?.organization_name || undefined,
    location: location,
    deadline: deadline,
    description: cleanHtml(job.description || ""),
    requirements: cleanHtml(job.requirements || ""),
    type: isInternship ? "internship" : "job",
    source: "ramrojob",
  };
}

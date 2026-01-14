import { JobData } from "../core/types";
import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://recruitnepal.com";

/**
 * Scrape RecruitNepal detail page
 * Since we're using API, this is mainly for backward compatibility
 * The list scraper should already have all the data we need
 */
export async function scrapeRecruitNepalDetail(url: string): Promise<JobData | null> {
  try {
    // Extract slug from URL (e.g., https://recruitnepal.com/jobs/some-job-slug)
    const slugMatch = url.match(/\/jobs\/([^\/\?]+)/);
    if (!slugMatch) {
      return null;
    }

    const slug = slugMatch[1];

    // Try to scrape from HTML as fallback if API data is missing
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      const $ = cheerio.load(data);

      const title = $("h1, .job-title, .title").first().text().trim();
      const company = $(".company-name, .organization-name, [class*='company']").first().text().trim();
      const location = $(".location, .city, [class*='location']").first().text().trim();
      const salaryText = $(".salary, [class*='salary']").first().text().trim();
      const deadline = $(".deadline, [class*='deadline']").first().text().trim();
      const description = $(".job-description, .description, [class*='description']").first().text().trim();

      if (!title) {
        return null;
      }

      // Detect if it's an internship
      const isInternship =
        title.toLowerCase().includes("intern") ||
        title.toLowerCase().includes("internship");

      return {
        title,
        applyUrl: url,
        company: company || undefined,
        location: location || undefined,
        salaryText: salaryText || "Negotiable",
        deadline: deadline || undefined,
        type: isInternship ? "internship" : "job",
        source: "recruitnepal",
        description: description || undefined,
      };
    } catch (htmlError) {
      console.log(`[RecruitNepal] HTML scraping failed for ${url}`);
      return null;
    }
  } catch (error: any) {
    console.error(`[RecruitNepal] Error scraping detail ${url}: ${error.message}`);
    return null;
  }
}


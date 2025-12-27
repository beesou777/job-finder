import { fetchPage } from "../core/fetchPage";
import * as cheerio from "cheerio";
import { JobData, detectJobType, calculateExpirationDate } from "../core/types";

export interface DetailPageSelectors {
  title: string | string[];
  company: string | string[];
  location: string | string[];
  salaryText: string | string[];
  deadline: string | string[];
  jobType: string | string[];
  category: string | string[];
  description: string | string[];
  requirements: string | string[];
  applyUrl: string | string[];
}

/**
 * Base detail page scraper
 * Extracts full job information from detail pages
 */
export async function scrapeDetailPage(
  url: string,
  selectors: DetailPageSelectors,
  source: string
): Promise<JobData | null> {
  try {
    const response = await fetchPage(url);
    if (!response) {
      return null;
    }

    const $ = cheerio.load(response.data);

    // Helper to find text using multiple selectors
    const findText = (selector: string | string[]): string => {
      const selectorsArray = Array.isArray(selector) ? selector : [selector];
      for (const sel of selectorsArray) {
        const text = $(sel).first().text().trim();
        if (text) return text;
      }
      return "";
    };

    // Helper to find attribute
    const findAttr = (selector: string | string[], attr: string): string => {
      const selectorsArray = Array.isArray(selector) ? selector : [selector];
      for (const sel of selectorsArray) {
        const value = $(sel).first().attr(attr) || "";
        if (value) return value;
      }
      return "";
    };

    const title = findText(selectors.title);
    if (!title) {
      return null; // Must have title
    }

    const company = findText(selectors.company);
    const location = findText(selectors.location);
    const salaryText = findText(selectors.salaryText);
    const deadline = findText(selectors.deadline);
    const jobType = findText(selectors.jobType);
    const category = findText(selectors.category);
    const description = findText(selectors.description);
    const requirements = findText(selectors.requirements);

    // Find apply URL - try multiple methods
    let applyUrl = findAttr(selectors.applyUrl, "href");
    if (!applyUrl) {
      // Fallback: look for common apply button patterns
      const applySelectors = [
        "a[href*='apply']",
        "a[href*='application']",
        "a:contains('Apply')",
        "a:contains('Apply Now')",
        ".apply-button a",
        "[class*='apply'] a",
      ];

      for (const sel of applySelectors) {
        const link = $(sel).first().attr("href");
        if (link) {
          applyUrl = link.startsWith("http") ? link : `${getBaseUrl(url)}${link}`;
          break;
        }
      }
    }

    // If still no apply URL, use the detail page URL
    if (!applyUrl) {
      applyUrl = url;
    } else if (!applyUrl.startsWith("http")) {
      applyUrl = `${getBaseUrl(url)}${applyUrl}`;
    }

    // Detect job type
    const type = detectJobType(title, url, category);

    // Calculate expiration date
    const expiresAt = calculateExpirationDate(deadline);

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
      source,
      description: description || undefined,
      requirements: requirements || undefined,
      expiresAt,
    };
  } catch (error: any) {
    console.error(`Error scraping detail page ${url}:`, error.message);
    return null;
  }
}

function getBaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return "";
  }
}


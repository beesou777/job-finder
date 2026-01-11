import { scrapeDetailPage } from "./base";
import { DetailPageSelectors } from "./base";
import { fetchPage } from "../core/fetchPage";
import * as cheerio from "cheerio";
import { JobData, detectJobType, calculateExpirationDate } from "../core/types";

const BASE_URL = "https://froxjob.com";

/**
 * Parse "X days left" or "X day left" to calculate expiration date
 */
function parseDaysLeft(text: string): Date | null {
  try {
    // Match patterns like "3 days left", "1 day left", "30 days left"
    const match = text.match(/(\d+)\s*(?:day|days)\s*left/i);
    if (match) {
      const days = parseInt(match[1]);
      if (!isNaN(days)) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        return expirationDate;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Scrape Froxjob detail page
 * Extracts full job information from detail pages
 */
export async function scrapeFroxjobDetail(url: string): Promise<JobData | null> {
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

    const title = findText([
      "h1",
      ".job-title",
      ".job-detail-title",
      "h2.job-title",
      "[class*='title']",
    ]);

    if (!title) {
      return null; // Must have title
    }

    const company = findText([
      ".company-name",
      ".employer",
      "[class*='company']",
      ".job-company",
      ".company-info",
    ]);

    const location = findText([
      ".location",
      "[class*='location']",
      ".job-location",
      ".cityzone",
    ]);

    const salaryText = findText([
      ".salary",
      "[class*='salary']",
      ".job-salary",
      ".compensation",
    ]);

    const jobType = findText([
      ".job-type",
      "[class*='job-type']",
      ".type",
      ".employment-type",
    ]);

    const category = findText([
      ".category",
      "[class*='category']",
      ".job-category",
    ]);

    const description = findText([
      ".description",
      ".job-description",
      "[class*='description']",
      ".job-details",
      ".details",
      ".job-content",
    ]);

    const requirements = findText([
      ".requirements",
      "[class*='requirement']",
      ".qualification",
      "[class*='qualification']",
      ".skill",
    ]);

    // Special handling for deadline: Look for "X days left" pattern
    let deadline = "";
    let expiresAt: Date | undefined;

    // Method 1: Look for spans with text-danger class containing "days left"
    $(".text-danger, [class*='danger']").each((_, element) => {
      const text = $(element).text().trim();
      if (text && /\d+\s*(?:day|days)?\s*left/i.test(text)) {
        deadline = text;
        const parsedDate = parseDaysLeft(text);
        if (parsedDate) {
          expiresAt = parsedDate;
          console.log(`[Froxjob] Found deadline: "${text}" → Expires: ${parsedDate.toISOString()}`);
          return false; // Stop searching
        }
      }
    });

    // Method 2: Search entire page text for "days left" or "days from now" patterns
    if (!expiresAt) {
      const pageText = $.text();
      
      // Try "X days left" pattern
      let daysLeftMatch = pageText.match(/(\d+)\s*(?:day|days)\s*left/i);
      if (daysLeftMatch) {
        deadline = daysLeftMatch[0];
        const parsedDate = parseDaysLeft(deadline);
        if (parsedDate) {
          expiresAt = parsedDate;
          console.log(`[Froxjob] Found deadline in page text: "${deadline}" → Expires: ${parsedDate.toISOString()}`);
        }
      }
      
      // Try "X days from now" pattern (e.g., "19 days from now")
      if (!expiresAt) {
        const daysFromNowMatch = pageText.match(/(\d+)\s*(?:day|days)\s+from\s+now/i);
        if (daysFromNowMatch) {
          const days = parseInt(daysFromNowMatch[1]);
          if (!isNaN(days)) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + days);
            expiresAt = expirationDate;
            deadline = daysFromNowMatch[0];
            console.log(`[Froxjob] Found "days from now": "${deadline}" → Expires: ${expiresAt.toISOString()}`);
          }
        }
      }
      
      // Try date format with "days from now" (e.g., "30-January-2026 (19 days from now)")
      if (!expiresAt) {
        const dateWithDaysMatch = pageText.match(/(\d{1,2}[-/]\w+[-/]\d{4})\s*\((\d+)\s*(?:day|days)\s*from\s*now\)/i);
        if (dateWithDaysMatch) {
          const days = parseInt(dateWithDaysMatch[2]);
          if (!isNaN(days)) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + days);
            expiresAt = expirationDate;
            deadline = dateWithDaysMatch[0];
            console.log(`[Froxjob] Found date with days: "${deadline}" → Expires: ${expiresAt.toISOString()}`);
          }
        }
      }
    }

    // Method 3: Try standard selectors (but exclude those containing "Exp:")
    if (!deadline) {
      const standardDeadline = findText([
        ".deadline",
        "[class*='deadline']",
        ".expiry",
        ".expires",
        "[class*='expir']",
      ]);
      // Only use if it doesn't contain "Exp:" (which is experience, not expiration)
      if (standardDeadline && !standardDeadline.includes("Exp:") && !standardDeadline.match(/exp:\s*\d+/i)) {
        deadline = standardDeadline;
        // Try to parse it
        const parsedDate = parseDaysLeft(deadline);
        if (parsedDate) {
          expiresAt = parsedDate;
        }
      }
    }

    // Calculate expiration date if not already calculated
    if (!expiresAt) {
      console.log(`[Froxjob] No deadline found, using calculateExpirationDate with deadline: "${deadline}"`);
      expiresAt = calculateExpirationDate(deadline);
      console.log(`[Froxjob] Default expiration calculated: ${expiresAt.toISOString()}`);
    }

    // Use the detail page URL as apply URL
    const applyUrl = url;

    // Detect job type
    const type = detectJobType(title, url, category);

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
      source: "froxjob",
      description: description || undefined,
      requirements: requirements || undefined,
      expiresAt,
    };
  } catch (error: any) {
    console.error(`Error scraping Froxjob detail page ${url}:`, error.message);
    return null;
  }
}

import { fetchPage } from "../core/fetchPage";
import * as cheerio from "cheerio";
import { JobData, detectJobType, calculateExpirationDate } from "../core/types";

const BASE_URL = "https://www.jobsnepal.com";

/**
 * Extract text from a list item containing an icon
 */
function extractFromListItem($: cheerio.CheerioAPI, container: cheerio.Cheerio<any>, iconClass: string): string | undefined {
  // Find all list items and check which one contains the icon
  const listItems = $(container).find("ul.list-none li, ul li");
  
  for (let i = 0; i < listItems.length; i++) {
    const listItem = $(listItems[i]);
    const hasIcon = listItem.find(`.${iconClass}`).length > 0;
    
    if (hasIcon) {
      // Extract text from div or p, but exclude icon text
      const text = listItem.find("div, p").not("i").text().trim();
      return text || undefined;
    }
  }
  
  return undefined;
}

/**
 * Map JobsNepal HTML card to JobData
 */
function mapCardToJobData($: cheerio.CheerioAPI, card: cheerio.Cheerio<any>, baseUrl: string): JobData | null {
  try {
    // Extract title and apply URL from h2.job-title a
    const titleLink = $(card).find("h2.job-title a").first();
    const title = titleLink.text().trim();
    const applyUrl = titleLink.attr("href");

    if (!title || !applyUrl) {
      return null;
    }

    // Construct full URL if needed
    const fullApplyUrl = applyUrl.startsWith("http")
      ? applyUrl
      : applyUrl.startsWith("/")
      ? `${baseUrl}${applyUrl}`
      : `${baseUrl}/${applyUrl}`;

    // Extract company (icon-briefcase3)
    // Try to get from p.mb-0 first (more specific)
    let companyText: string | undefined;
    const companyListItems = $(card).find("ul.list-none li, ul li");
    companyListItems.each((_, li) => {
      const $li = $(li);
      if ($li.find(".icon-briefcase3").length > 0) {
        companyText = $li.find("p.mb-0").first().text().trim() || $li.find("div").not("i").first().text().trim();
        return false; // break
      }
    });
    
    // Fallback to extractFromListItem if not found
    if (!companyText) {
      companyText = extractFromListItem($, card, "icon-briefcase3");
    }

    // Extract salary (icon-coin-dollar) - may be "Rs. Per" if not specified
    const salaryText = extractFromListItem($, card, "icon-coin-dollar");
    const salary = salaryText && salaryText !== "Rs. Per" ? salaryText : undefined;

    // Extract location (icon-location4)
    const location = extractFromListItem($, card, "icon-location4");

    // Extract category (icon-price-tags)
    const category = extractFromListItem($, card, "icon-price-tags");

    // Detect job type
    const type = detectJobType(title, fullApplyUrl, category);

    return {
      title,
      applyUrl: fullApplyUrl,
      company: companyText || undefined,
      location: location || undefined,
      salaryText: salary || undefined,
      category: category || undefined,
      type,
      source: "jobsnepal",
      expiresAt: calculateExpirationDate(),
    };
  } catch (error: any) {
    console.error(`Error mapping JobsNepal card: ${error.message}`);
    return null;
  }
}

/**
 * Scrape JobsNepal list page
 * Extracts job data directly from the list page cards
 */
export async function scrapeJobsNepalList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[];
}> {
  try {
    const response = await fetchPage(url);
    if (!response) {
      return { detailUrls: [], hasMore: false };
    }

    const $ = cheerio.load(response.data);
    const preFetchedJobs: JobData[] = [];
    const detailUrls: string[] = [];

    // Find all job cards
    const cards = $(".card-inner");
    
    cards.each((_, card) => {
      const jobData = mapCardToJobData($, $(card), BASE_URL);
      if (jobData) {
        preFetchedJobs.push(jobData);
        detailUrls.push(jobData.applyUrl);
      }
    });

    // Check for pagination
    let hasMore = false;
    let nextPageUrl: string | undefined;

    // Look for "Next" link in pagination
    const nextLinks = $("a").filter((_, el) => {
      const text = $(el).text().trim();
      return text === "Next" || text === "»";
    });
    
    if (nextLinks.length > 0 && !nextLinks.first().hasClass("disabled")) {
      const nextLink = nextLinks.first().attr("href");
      if (nextLink) {
        hasMore = true;
        nextPageUrl = nextLink.startsWith("http")
          ? nextLink
          : nextLink.startsWith("/")
          ? `${BASE_URL}${nextLink}`
          : `${BASE_URL}/${nextLink}`;
      }
    } else {
      // Fallback: Try to extract page number from current URL
      try {
        const urlObj = new URL(url);
        const currentPage = parseInt(urlObj.searchParams.get("page") || "1");
        
        // Check if pagination controls exist and try next page
        const paginationLinks = $("a[href*='page']");
        if (paginationLinks.length > 0) {
          // Construct next page URL
          urlObj.searchParams.set("page", String(currentPage + 1));
          hasMore = true;
          nextPageUrl = urlObj.toString();
        }
      } catch {
        // If URL parsing fails, assume no more pages
        hasMore = false;
      }
    }

    console.log(`[JobsNepal] Fetched ${preFetchedJobs.length} jobs from list page`);

    return {
      detailUrls,
      hasMore,
      nextPageUrl,
      preFetchedJobs,
    };
  } catch (error: any) {
    console.error(`Error scraping JobsNepal list page ${url}:`, error.message);
    return { detailUrls: [], hasMore: false };
  }
}

import { fetchPage } from "../core/fetchPage";
import * as cheerio from "cheerio";

const BASE_URL = "https://froxjob.com";

/**
 * Scrape Froxjob list page
 * Extracts job detail URLs from listing pages
 */
export async function scrapeFroxjobList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
}> {
  try {
    const response = await fetchPage(url);
    if (!response) {
      return { detailUrls: [], hasMore: false };
    }

    const $ = cheerio.load(response.data);
    const detailUrls: string[] = [];

    // Job cards are in .s_card within .search-result-list > .dtable > .dtable-body
    $(".s_card").each((_, element) => {
      // Check if job is expired - look for "left" text without a number
      // Expired jobs show: "left" (no number before it)
      // Active jobs show: "7 days left", "30 days left", etc.
      const jobInfoText = $(element).find(".search-result-info").text() || "";

      // Check if "left" exists in the text
      if (jobInfoText.includes("left")) {
        // Check if there's a number before "left" (pattern: "X days left" or "X day left")
        const daysLeftPattern = /\d+\s*(?:day|days)?\s*left/i;
        const hasDaysLeft = daysLeftPattern.test(jobInfoText);

        // Skip expired jobs (those with just "left" without a number)
        if (!hasDaysLeft) {
          // Job is expired (shows "left" but no number), skip it
          return;
        }
      }

      // Try to find detail link from title link or details button
      const titleLink = $(element).find("h3.search-result-data-designation a").attr("href");
      const detailsLink = $(element).find("a.btn-details").attr("href");

      // Prefer details link, fallback to title link
      const link = detailsLink || titleLink;

      if (link) {
        // Make absolute URL
        const fullUrl = link.startsWith("http")
          ? link
          : link.startsWith("/")
            ? `${BASE_URL}${link}`
            : `${BASE_URL}/${link}`;

        if (!detailUrls.includes(fullUrl)) {
          detailUrls.push(fullUrl);
        }
      }
    });

    // Check for pagination
    // Look for pagination links - common patterns
    let hasMore = false;
    let nextPageUrl: string | undefined;

    // Check for next page link in pagination
    const paginationLinks = $(".pagination a, .pager a, [class*='pagination'] a");
    paginationLinks.each((_, element) => {
      const text = $(element).text().trim();
      const href = $(element).attr("href");

      // Check if it's a next page link
      if ((text.includes("Next") || text.includes("»") || text === ">>") && href) {
        hasMore = true;
        nextPageUrl = href.startsWith("http")
          ? href
          : href.startsWith("/")
            ? `${BASE_URL}${href}`
            : `${BASE_URL}/${href}`;
      }
    });

    // If no explicit next link, check current page number and increment
    if (!hasMore && detailUrls.length > 0) {
      const urlObj = new URL(url);
      const currentPage = parseInt(urlObj.searchParams.get("page") || "1");

      // If we found jobs, there might be more pages
      // Try to determine if there are more pages by checking if pagination shows a higher page
      const pageNumbers: number[] = [];
      $(".pagination a, .pager a, [class*='pagination'] a").each((_, element) => {
        const text = $(element).text().trim();
        const pageNum = parseInt(text);
        if (!isNaN(pageNum)) {
          pageNumbers.push(pageNum);
        }
      });

      // If we see page numbers higher than current, or if we see ">>" or "Next"
      const maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : currentPage;
      if (maxPage > currentPage) {
        hasMore = true;
        urlObj.searchParams.set("page", String(currentPage + 1));
        nextPageUrl = urlObj.toString();
      } else if ($(".pagination, .pager, [class*='pagination']").length > 0) {
        // If pagination exists and we have jobs, assume there might be more
        // This is a heuristic - we'll stop when we get 0 jobs
        hasMore = true;
        urlObj.searchParams.set("page", String(currentPage + 1));
        nextPageUrl = urlObj.toString();
      }
    }

    return {
      detailUrls: [...new Set(detailUrls)], // Remove duplicates
      hasMore,
      nextPageUrl,
    };
  } catch (error: any) {
    console.error(`Error scraping Froxjob list page ${url}:`, error.message);
    return { detailUrls: [], hasMore: false };
  }
}

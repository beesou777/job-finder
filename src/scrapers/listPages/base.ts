import { fetchPage } from "../core/fetchPage";
import * as cheerio from "cheerio";

export interface ListPageSelectors {
  container: string | string[];
  link: string | string[];
  nextPage?: string | string[];
}

export interface ListPageResult {
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
}

/**
 * Base list page scraper
 * Extracts job detail URLs from listing pages
 */
export async function scrapeListPage(
  url: string,
  selectors: ListPageSelectors,
  baseUrl: string,
): Promise<ListPageResult> {
  try {
    const response = await fetchPage(url);
    if (!response) {
      return { detailUrls: [], hasMore: false };
    }

    const $ = cheerio.load(response.data);
    const detailUrls: string[] = [];

    // Handle multiple container selectors
    const containerSelectors = Array.isArray(selectors.container)
      ? selectors.container
      : [selectors.container];

    // Extract job detail URLs
    for (const containerSel of containerSelectors) {
      $(containerSel).each((_, element) => {
        // Try multiple link selectors
        const linkSelectors = Array.isArray(selectors.link) ? selectors.link : [selectors.link];

        for (const linkSel of linkSelectors) {
          const link = $(element).find(linkSel).first().attr("href");
          if (
            link &&
            (link.includes("/job") ||
              link.includes("/vacancy") ||
              link.includes("/career") ||
              link.includes("/opportunity"))
          ) {
            const fullUrl = link.startsWith("http")
              ? link
              : link.startsWith("/")
                ? `${baseUrl}${link}`
                : `${baseUrl}/${link}`;
            detailUrls.push(fullUrl);
            break; // Found a link, move to next container
          }
        }
      });

      // If we found URLs with this container, stop trying others
      if (detailUrls.length > 0) break;
    }

    // Fallback: if no URLs found, try finding any job-related links
    if (detailUrls.length === 0) {
      // Try common patterns
      const fallbackSelectors = [
        "a[href*='/job']",
        "a[href*='/vacancy']",
        "a[href*='/career']",
        "a[href*='/internship']",
        "article a",
        ".card a",
        "[class*='job'] a",
      ];

      for (const fallbackSel of fallbackSelectors) {
        $(fallbackSel).each((_, element) => {
          const link = $(element).attr("href");
          if (
            link &&
            (link.includes("job") || link.includes("vacancy") || link.includes("career"))
          ) {
            const fullUrl = link.startsWith("http")
              ? link
              : link.startsWith("/")
                ? `${baseUrl}${link}`
                : `${baseUrl}/${link}`;
            if (!detailUrls.includes(fullUrl)) {
              detailUrls.push(fullUrl);
            }
          }
        });
        if (detailUrls.length > 0) break; // Stop if we found some
      }
    }

    // Check for pagination
    let hasMore = false;
    let nextPageUrl: string | undefined;

    if (selectors.nextPage) {
      const nextPageSelectors = Array.isArray(selectors.nextPage)
        ? selectors.nextPage
        : [selectors.nextPage];

      for (const nextSel of nextPageSelectors) {
        const nextLink = $(nextSel).first().attr("href");
        if (nextLink) {
          hasMore = true;
          nextPageUrl = nextLink.startsWith("http")
            ? nextLink
            : nextLink.startsWith("/")
              ? `${baseUrl}${nextLink}`
              : `${baseUrl}/${nextLink}`;
          break;
        }
      }
    }

    return {
      detailUrls: [...new Set(detailUrls)], // Remove duplicates
      hasMore,
      nextPageUrl,
    };
  } catch (error: any) {
    console.error(`Error scraping list page ${url}:`, error.message);
    return { detailUrls: [], hasMore: false };
  }
}

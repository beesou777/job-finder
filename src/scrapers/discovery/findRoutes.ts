import { fetchPage } from "../core/fetchPage";
import * as cheerio from "cheerio";

export interface DiscoveredRoute {
  url: string;
  type: "list" | "detail";
  confidence: number;
}

/**
 * Discover job-related routes on a domain
 */
export async function discoverJobRoutes(
  baseUrl: string
): Promise<DiscoveredRoute[]> {
  const routes: DiscoveredRoute[] = [];
  const baseDomain = getBaseDomain(baseUrl);

  // Common job listing route patterns
  const routePatterns = [
    "/jobs",
    "/job",
    "/vacancy",
    "/vacancies",
    "/career",
    "/careers",
    "/internship",
    "/internships",
    "/opportunity",
    "/opportunities",
    "/search-jobs",
    "/job-listings",
    "/job-search",
    "/find-jobs",
  ];

  console.log(`🔍 Discovering routes for ${baseDomain}...`);

  for (const pattern of routePatterns) {
    const fullUrl = `${baseDomain}${pattern}`;
    const result = await checkRoute(fullUrl);

    if (result) {
      routes.push({
        url: fullUrl,
        type: result.type,
        confidence: result.confidence,
      });
      console.log(`  ✅ Found: ${fullUrl} (${result.type}, confidence: ${result.confidence})`);
    }
  }

  // Also check the homepage for job links
  const homepageResult = await checkRoute(baseDomain);
  if (homepageResult && homepageResult.type === "list") {
    routes.push({
      url: baseDomain,
      type: "list",
      confidence: homepageResult.confidence,
    });
  }

  return routes.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Check if a route contains job listings
 */
async function checkRoute(url: string): Promise<{ type: "list" | "detail"; confidence: number } | null> {
  try {
    const response = await fetchPage(url, { retries: 1, timeout: 10000 });
    if (!response) return null;

    const $ = cheerio.load(response.data);

    // Look for job listing indicators
    const jobIndicators = [
      $("[class*='job']").length,
      $("[class*='vacancy']").length,
      $("[class*='listing']").length,
      $("a[href*='/job']").length,
      $("a[href*='/vacancy']").length,
      $("a[href*='/career']").length,
      $("article").length,
      $("[data-testid*='job']").length,
    ];

    const totalIndicators = jobIndicators.reduce((sum, count) => sum + count, 0);

    if (totalIndicators === 0) return null;

    // Determine if it's a list page or detail page
    // List pages typically have multiple job cards/items
    // Also check for pagination, multiple links, etc.
    const hasMultipleItems = $("article").length > 1 || 
                           $("[class*='job']").length > 3 ||
                           $("[class*='listing']").length > 3 ||
                           $("[class*='card']").length > 3;
    
    const hasPagination = $(".pagination, [class*='pagination'], a[href*='page']").length > 0;
    const hasMultipleLinks = $("a[href*='job'], a[href*='vacancy']").length > 5;
    
    const isListPage = hasMultipleItems || hasPagination || hasMultipleLinks;

    const confidence = Math.min(100, totalIndicators * 10 + (isListPage ? 50 : 0));

    return {
      type: isListPage ? "list" : "detail",
      confidence,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extract base domain from URL
 */
function getBaseDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return url;
  }
}


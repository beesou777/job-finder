import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://jobsdynamics.com";
const API_ENDPOINT = `${BASE_URL}/jobs-listing/`;

/**
 * Scrape JobsDynamics using HTML parsing
 * The API returns HTML content with job listings
 */
export async function scrapeJobsDynamicsList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: never; // We don't return pre-fetched jobs, detail scraper will fetch full data
}> {
  try {
    const detailUrls: string[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let hasMore = true;

    // Fetch all pages - only extract URLs, not full job data
    do {
      try {
        // Construct URL with pagination
        const apiUrl = `${API_ENDPOINT}?ajax_filter=true&job_page=${currentPage}&per-page=1000&sort-by=recent&posted=all`;
        
        console.log(`[JobsDynamics] Fetching page ${currentPage} from: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, {
          headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
        });

        if (!response.data) {
          console.warn(`[JobsDynamics] No data in response for page ${currentPage}`);
          break;
        }

        const $ = cheerio.load(response.data);
        
        // Find all job containers
        const jobContainers = $(".careerfy-joblisting-plain-wrap");
        
        if (jobContainers.length === 0) {
          console.log(`[JobsDynamics] No jobs found on page ${currentPage}. Stopping.`);
          break;
        }

        console.log(`[JobsDynamics] Found ${jobContainers.length} jobs on page ${currentPage}`);

        // Extract only URLs from each container - detail scraper will get full data
        jobContainers.each((_, element) => {
          try {
            const $job = $(element);
            
            // Extract apply URL
            const titleLink = $job.find("h2 a").first();
            let applyUrl = titleLink.attr("href");
            
            if (!applyUrl) {
              return; // Skip if no URL
            }

            // Make URL absolute if relative
            if (!applyUrl.startsWith("http")) {
              applyUrl = applyUrl.startsWith("/")
                ? `${BASE_URL}${applyUrl}`
                : `${BASE_URL}/${applyUrl}`;
            }

            detailUrls.push(applyUrl);
          } catch (error: any) {
            console.error(`[JobsDynamics] Error parsing job URL: ${error.message}`);
          }
        });

        // Check for pagination - try multiple selectors
        let hasNextPage = false;
        
        // Method 1: Look for next page link
        const nextPageLink = $(".pagination a.next, .page-numbers a.next, a[rel='next'], .careerfy-pagination a.next");
        if (nextPageLink.length > 0 && nextPageLink.attr("href")) {
          hasNextPage = true;
        }
        
        // Method 2: Check if there are more page numbers
        const pageNumbers = $(".pagination a, .page-numbers a, .careerfy-pagination a")
          .filter((_, el) => {
            const text = $(el).text().trim();
            return /^\d+$/.test(text) && parseInt(text) > currentPage;
          });
        if (pageNumbers.length > 0) {
          hasNextPage = true;
        }
        
        // Method 3: If we got a full page of jobs (close to per-page limit), likely more pages
        if (jobContainers.length >= 30) {
          hasNextPage = true;
        }

        if (hasNextPage && currentPage < 50) {
          hasMore = true;
          currentPage++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          hasMore = false;
        }

        console.log(
          `[JobsDynamics] Page ${currentPage - 1}: Found ${jobContainers.length} job URLs (total: ${detailUrls.length})`
        );

      } catch (error: any) {
        console.error(
          `[JobsDynamics] Error fetching page ${currentPage}:`,
          error.message
        );
        if (error.response?.status) {
          console.error(`[JobsDynamics] HTTP Status: ${error.response.status}`);
        }
        break;
      }
    } while (hasMore && currentPage <= 50); // Limit to 50 pages max

    if (detailUrls.length === 0) {
      console.warn(`[JobsDynamics] No job URLs found`);
      return { detailUrls: [], hasMore: false };
    }

    console.log(
      `✅ JobsDynamics: Found ${detailUrls.length} job URLs from HTML listings`
    );
    console.log(`[JobsDynamics] Detail scraper will fetch full information from each URL`);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      // Don't return preFetchedJobs - detail scraper will fetch full info including salary
    };
  } catch (error: any) {
    console.error(`❌ JobsDynamics scraper failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


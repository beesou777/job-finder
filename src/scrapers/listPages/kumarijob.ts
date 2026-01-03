import axios from "axios";
import { JobData, calculateExpirationDate, detectJobType } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://www.kumarijob.com";
const SEARCH_ENDPOINT = `${BASE_URL}/search`;

/**
 * Extract deadline from "X days left" or similar text
 */
function extractDeadline(text: string): string | undefined {
  if (!text) return undefined;
  
  // Look for patterns like "10 days left", "5 days left", etc.
  const match = text.match(/(\d+)\s*days?\s*left/i);
  if (match && match[1]) {
    const days = parseInt(match[1]);
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + days);
    return deadlineDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  return undefined;
}

/**
 * Scrape KumariJob using HTML parsing
 * Extracts all job data from listing pages (no need to visit detail pages)
 */
export async function scrapeKumariJobList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[];
}> {
  try {
    const allJobs: JobData[] = [];
    let currentPage = 1;
    let hasMore = true;

    // Fetch all pages
    do {
      try {
        // Construct URL with pagination
        const pageUrl = `${SEARCH_ENDPOINT}?page=${currentPage}`;
        
        console.log(`[KumariJob] Fetching page ${currentPage} from: ${pageUrl}`);
        
        const response = await axios.get(pageUrl, {
          headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
        });

        if (!response.data) {
          console.warn(`[KumariJob] No data in response for page ${currentPage}`);
          break;
        }

        const $ = cheerio.load(response.data);
        
        // Find all job containers - both mobile and desktop versions
        const jobContainers = $(".cardone.premium, .card__search");
        
        if (jobContainers.length === 0) {
          console.log(`[KumariJob] No jobs found on page ${currentPage}. Stopping.`);
          break;
        }

        console.log(`[KumariJob] Found ${jobContainers.length} jobs on page ${currentPage}`);

        // Extract job data from each container
        jobContainers.each((_, element) => {
          try {
            const $job = $(element);
            
            // Extract title and apply URL - try multiple selectors
            let title: string | undefined;
            let applyUrl: string | undefined;
            
            // Try desktop version first
            const titleLinkDesktop = $job.find(".title.search-job-title a, .search-job-title a").first();
            if (titleLinkDesktop.length > 0) {
              title = titleLinkDesktop.text().trim();
              applyUrl = titleLinkDesktop.attr("href");
            } else {
              // Try mobile version
              const titleLinkMobile = $job.find(".job-title-link").first();
              if (titleLinkMobile.length > 0) {
                title = titleLinkMobile.text().trim();
                applyUrl = titleLinkMobile.attr("href");
              }
            }
            
            if (!title || !applyUrl) {
              return; // Skip if no title or URL
            }

            // Make URL absolute if relative
            if (!applyUrl.startsWith("http")) {
              applyUrl = applyUrl.startsWith("/")
                ? `${BASE_URL}${applyUrl}`
                : `${BASE_URL}/${applyUrl}`;
            }

            // Extract company name
            let company: string | undefined;
            const companyLinkDesktop = $job.find(".meta.fs-12 a").first();
            const companyLinkMobile = $job.find(".location_company_box a").first();
            
            if (companyLinkDesktop.length > 0) {
              company = companyLinkDesktop.text().trim() || undefined;
            } else if (companyLinkMobile.length > 0) {
              company = companyLinkMobile.text().trim() || undefined;
            }

            // Extract location
            let location: string | undefined;
            // Try desktop version: <li><span>Location : </span><strong>Putalisadak</strong></li>
            const locationDesktop = $job.find(".description__two li:has(span:contains('Location')) strong");
            if (locationDesktop.length > 0) {
              location = locationDesktop.text().trim() || undefined;
            } else {
              // Try mobile version: <span class="meta mt-1">...Putalisadak</span>
              const locationMobile = $job.find(".meta.mt-1").first();
              if (locationMobile.length > 0) {
                // Get text but exclude the image
                location = locationMobile.clone().children().remove().end().text().trim() || undefined;
              }
            }

            // Extract salary
            let salaryText: string | undefined;
            // Try desktop version: <li><span>Salary : </span><strong>Nrs. 20k-25k Monthly </strong></li>
            const salaryDesktop = $job.find(".description__two li:has(span:contains('Salary')) strong");
            if (salaryDesktop.length > 0) {
              salaryText = salaryDesktop.text().trim() || undefined;
            } else {
              // Try mobile version: <h5 class="">Nrs. 20k-25k Monthly </h5>
              const salaryMobile = $job.find(".deadline-salary h5").first();
              if (salaryMobile.length > 0) {
                salaryText = salaryMobile.text().trim() || undefined;
              }
            }
            
            // Clean up salary - remove empty or "Nrs. Monthly" type values
            if (salaryText && (salaryText.toLowerCase().includes("nrs. monthly") || salaryText.trim() === "Nrs." || !salaryText.trim())) {
              salaryText = undefined;
            }

            // Extract job type - first item in jobtype-level-exp
            let jobType: string | undefined;
            const jobTypeElement = $job.find(".jobtype-level-exp li").first();
            if (jobTypeElement.length > 0) {
              jobType = jobTypeElement.text().trim() || undefined;
            }

            // Extract deadline
            let deadline: string | undefined;
            // Try desktop version: <li class="description__two--foot"><span><span>Deadline : </span><strong>10 days left</strong></span></li>
            const deadlineDesktop = $job.find(".description__two--foot strong").first();
            if (deadlineDesktop.length > 0) {
              const deadlineText = deadlineDesktop.text().trim();
              deadline = extractDeadline(deadlineText);
            } else {
              // Try mobile version: <p class="">10 days left</p>
              const deadlineMobile = $job.find(".deadline-salary p").first();
              if (deadlineMobile.length > 0) {
                const deadlineText = deadlineMobile.text().trim();
                deadline = extractDeadline(deadlineText);
              }
            }

            // Determine if it's an internship
            const lowerTitle = title.toLowerCase();
            const lowerJobType = jobType?.toLowerCase() || "";
            const isInternship = 
              lowerTitle.includes("intern") || 
              lowerTitle.includes("internship") ||
              lowerJobType.includes("intern");

            // Calculate expiration date from deadline
            const expiresAt = calculateExpirationDate(deadline);

            // Map to JobData
            const jobData: JobData = {
              title: title,
              applyUrl: applyUrl,
              company: company,
              location: location,
              salaryText: salaryText,
              deadline: deadline,
              jobType: jobType,
              category: undefined,
              type: isInternship ? "internship" : "job",
              source: "kumarijob",
              expiresAt: expiresAt,
            };

            allJobs.push(jobData);
          } catch (error: any) {
            console.error(`[KumariJob] Error parsing job: ${error.message}`);
          }
        });

        // Check for pagination
        const nextPageLink = $(".pagination a[rel='next'], .pagination .page-item:not(.disabled) a.page-link");
        let hasNextPage = false;
        
        // Check if there's a next page link
        nextPageLink.each((_, el) => {
          const $link = $(el);
          const href = $link.attr("href");
          const text = $link.text().trim().toLowerCase();
          if (href && (text.includes("next") || parseInt(href.match(/page=(\d+)/)?.[1] || "0") > currentPage)) {
            hasNextPage = true;
            return false; // Break
          }
        });
        
        // Also check if there are more page numbers
        if (!hasNextPage) {
          const pageNumbers = $(".pagination .page-item a.page-link")
            .filter((_, el) => {
              const text = $(el).text().trim();
              return /^\d+$/.test(text) && parseInt(text) > currentPage;
            });
          if (pageNumbers.length > 0) {
            hasNextPage = true;
          }
        }

        if (hasNextPage && currentPage < 50) {
          hasMore = true;
          currentPage++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          hasMore = false;
        }

        console.log(
          `[KumariJob] Page ${currentPage - 1}: Fetched ${jobContainers.length} jobs (total: ${allJobs.length})`
        );

      } catch (error: any) {
        console.error(
          `[KumariJob] Error fetching page ${currentPage}:`,
          error.message
        );
        if (error.response?.status) {
          console.error(`[KumariJob] HTTP Status: ${error.response.status}`);
        }
        break;
      }
    } while (hasMore && currentPage <= 50); // Limit to 50 pages max

    if (allJobs.length === 0) {
      console.warn(`[KumariJob] No jobs found`);
      return { detailUrls: [], hasMore: false };
    }

    console.log(
      `✅ KumariJob: Fetched ${allJobs.length} jobs from HTML listings`
    );

    // Return detail URLs for compatibility
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs, // Return all jobs with full data
    };
  } catch (error: any) {
    console.error(`❌ KumariJob scraper failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


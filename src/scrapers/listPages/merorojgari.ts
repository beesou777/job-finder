import axios from "axios";
import { JobData, calculateExpirationDate, detectJobType } from "../core/types";
import { parseStringPromise } from "xml2js";
import * as cheerio from "cheerio";

const BASE_URL = "https://merorojgari.com";
const RSS_ENDPOINT = `${BASE_URL}/?feed=job_feed&job_types=fresher%2Cfull-time%2Cinternship%2Cpart-time`;

interface RSSItem {
  title: string | string[];
  link: string | string[];
  pubDate: string | string[];
  description?: string | string[];
  "content:encoded"?: string | string[];
  "job_listing:job_type"?: string | string[];
  "job_listing:company"?: string | string[];
  "job_listing:location"?: string | string[];
}

interface RSSChannel {
  item?: RSSItem | RSSItem[];
  title?: string | string[];
  link?: string | string[];
}

interface RSSFeed {
  rss: {
    channel: RSSChannel;
  };
}

/**
 * Clean HTML and extract text
 */
function cleanHtml(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  return $.text().trim();
}

/**
 * Extract deadline from content
 */
function extractDeadline(content: string): string | undefined {
  if (!content) return undefined;
  
  // Look for patterns like "7th January, 2026", "January 09, 2026", "9 January 2026", etc.
  const deadlinePatterns = [
    /(?:deadline|last date|application|apply by|closing date)[:\s]+(?:is|on|by)?\s*(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)[\s,]+(?:\d{4}))/i,
    /(?:deadline|last date|application|apply by|closing date)[:\s]+(?:is|on|by)?\s*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}[\s,]+(?:\d{4}))/i,
    /(?:deadline|last date|application|apply by|closing date)[:\s]+(?:is|on|by)?\s*(\d{1,2}[\s\/-](?:January|February|March|April|May|June|July|August|September|October|November|December)[\s\/-]\d{4})/i,
  ];
  
  for (const pattern of deadlinePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

/**
 * Map RSS item to JobData
 */
function mapToJobData(item: RSSItem): JobData {
  // Extract title
  const title = Array.isArray(item.title) ? item.title[0] : item.title;
  
  // Extract apply URL
  const link = Array.isArray(item.link) ? item.link[0] : item.link;
  const applyUrl = link || "";

  // Extract company
  const company = item["job_listing:company"]
    ? (Array.isArray(item["job_listing:company"])
        ? item["job_listing:company"][0]
        : item["job_listing:company"])
    : undefined;

  // Extract location
  const location = item["job_listing:location"]
    ? (Array.isArray(item["job_listing:location"])
        ? item["job_listing:location"][0]
        : item["job_listing:location"])
    : undefined;

  // Extract job type
  const jobType = item["job_listing:job_type"]
    ? (Array.isArray(item["job_listing:job_type"])
        ? item["job_listing:job_type"][0]
        : item["job_listing:job_type"])
    : undefined;

  // Extract description and content
  const descriptionRaw = item["content:encoded"]
    ? (Array.isArray(item["content:encoded"])
        ? item["content:encoded"][0]
        : item["content:encoded"])
    : item.description
    ? (Array.isArray(item.description) ? item.description[0] : item.description)
    : undefined;

  const description = descriptionRaw ? cleanHtml(descriptionRaw) : undefined;

  // Extract deadline from content
  const deadline = descriptionRaw ? extractDeadline(descriptionRaw) : undefined;

  // Extract published date
  const pubDate = item.pubDate
    ? (Array.isArray(item.pubDate) ? item.pubDate[0] : item.pubDate)
    : undefined;

  // Determine if it's an internship
  const lowerTitle = title.toLowerCase();
  const lowerJobType = jobType?.toLowerCase() || "";
  const isInternship =
    lowerTitle.includes("intern") ||
    lowerTitle.includes("internship") ||
    lowerJobType.includes("intern") ||
    lowerJobType.includes("fresher");

  // Calculate expiration date from deadline or pubDate
  const expiresAt = calculateExpirationDate(
    deadline,
    pubDate ? new Date(pubDate) : undefined
  );

  return {
    title: title,
    applyUrl: applyUrl,
    company: company,
    location: location,
    salaryText: undefined, // Not available in RSS
    deadline: deadline,
    jobType: jobType,
    category: undefined, // Could be extracted if available
    type: isInternship ? "internship" : "job",
    source: "merorojgari",
    description: description,
    expiresAt: expiresAt,
  };
}

/**
 * Scrape Merorojgari using RSS feed
 * Fetches all jobs from RSS feed with pagination
 */
export async function scrapeMerorojgariList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[];
}> {
  try {
    const allJobs: JobData[] = [];
    let currentPage = 1;
    let hasMore = true;

    // Fetch all pages from RSS feed
    do {
      try {
        // Construct RSS URL with pagination
        const rssUrl = `${RSS_ENDPOINT}&paged=${currentPage}`;
        
        console.log(`[Merorojgari] Fetching RSS page ${currentPage} from: ${rssUrl}`);
        
        const response = await axios.get(rssUrl, {
          headers: {
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
        });

        if (!response.data) {
          console.warn(`[Merorojgari] No data in RSS response for page ${currentPage}`);
          break;
        }

        // Parse XML to JSON
        const parsed = await parseStringPromise(response.data, {
          explicitArray: false,
          mergeAttrs: true,
          trim: true,
        }) as RSSFeed;

        if (!parsed.rss?.channel) {
          console.warn(`[Merorojgari] Invalid RSS structure for page ${currentPage}`);
          break;
        }

        const channel = parsed.rss.channel;
        const items = channel.item
          ? Array.isArray(channel.item)
            ? channel.item
            : [channel.item]
          : [];

        if (items.length === 0) {
          console.log(`[Merorojgari] No jobs found in RSS feed page ${currentPage}. Stopping.`);
          break;
        }

        console.log(`[Merorojgari] Found ${items.length} jobs in RSS feed page ${currentPage}`);

        // Map RSS items to JobData
        const mappedJobs = items.map(mapToJobData);
        allJobs.push(...mappedJobs);

        // Check if there are more pages
        // Continue to next page if we got items
        // Stop if we got no items or very few items (likely last page)
        if (items.length === 0) {
          hasMore = false;
        } else if (items.length < 5 && currentPage > 1) {
          // If we get very few items on a later page, might be last page
          hasMore = false;
        } else {
          // Try next page
          currentPage++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        console.log(
          `[Merorojgari] Page ${currentPage - 1}: Fetched ${items.length} jobs (total: ${allJobs.length})`
        );

      } catch (error: any) {
        console.error(
          `[Merorojgari] Error fetching RSS page ${currentPage}:`,
          error.message
        );
        if (error.response?.status === 404 || error.response?.status === 400) {
          // 404 or 400 likely means no more pages
          hasMore = false;
        } else {
          // Other errors, try to continue
          currentPage++;
          if (currentPage > 50) {
            hasMore = false;
          }
        }
      }
    } while (hasMore && currentPage <= 50); // Limit to 50 pages max

    if (allJobs.length === 0) {
      console.warn(`[Merorojgari] No jobs found`);
      return { detailUrls: [], hasMore: false };
    }

    console.log(
      `✅ Merorojgari: Fetched ${allJobs.length} jobs from RSS feed`
    );

    // Return detail URLs for compatibility
    const detailUrls = allJobs.map((job) => job.applyUrl);

    return {
      detailUrls,
      hasMore: false, // We've fetched all pages
      preFetchedJobs: allJobs, // Return all jobs with full data from RSS
    };
  } catch (error: any) {
    console.error(`❌ Merorojgari RSS scraper failed: ${error.message}`);
    return { detailUrls: [], hasMore: false };
  }
}


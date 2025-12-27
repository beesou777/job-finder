import { discoverJobRoutes } from "./discovery/findRoutes";
import { scrapeMeroCareerList } from "./listPages/merocareer";
import { scrapeJobsNepalList } from "./listPages/jobsnepal";
import { scrapeKumariJobList } from "./listPages/kumarijob";
import { scrapeKantipurJobList } from "./listPages/kantipurjob";
import { scrapeRamroJobList } from "./listPages/ramrojob";
import { scrapeMeroCareerDetail } from "./detailPages/merocareer";
import { scrapeJobsNepalDetail } from "./detailPages/jobsnepal";
import { scrapeKumariJobDetail } from "./detailPages/kumarijob";
import { scrapeKantipurJobDetail } from "./detailPages/kantipurjob";
import { scrapeRamroJobDetail } from "./detailPages/ramrojob";
import { scrapeInternSathiList } from "./listPages/internsathi";
import { scrapeInternSathiDetail } from "./detailPages/internsathi";
import { scrapeJobAxleList } from "./listPages/jobaxle";
import { scrapeJobAxleDetail } from "./detailPages/jobaxle";
import { JobData } from "./core/types";

export interface ScraperConfig {
  baseUrl: string;
  source: string;
  listScraper: (url: string) => Promise<{ detailUrls: string[]; hasMore: boolean; nextPageUrl?: string }>;
  detailScraper: (url: string) => Promise<JobData | null>;
  maxPages?: number;
  maxJobs?: number;
  listingUrls?: string[]; // Direct URLs to listing pages
}

const SCRAPER_CONFIGS: ScraperConfig[] = [
  {
    baseUrl: "https://merocareer.com",
    source: "merocareer",
    listScraper: scrapeMeroCareerList,
    detailScraper: scrapeMeroCareerDetail,
    listingUrls: ["https://merocareer.com/jobs"], // Direct listing page
    maxPages: 5,
    maxJobs: 50,
  },
  {
    baseUrl: "https://jobsnepal.com",
    source: "jobsnepal",
    listScraper: scrapeJobsNepalList,
    detailScraper: scrapeJobsNepalDetail,
    listingUrls: ["https://jobsnepal.com/jobs", "https://jobsnepal.com/top-job"],
    maxPages: 5,
    maxJobs: 50,
  },
  {
    baseUrl: "https://kumarijob.com",
    source: "kumarijob",
    listScraper: scrapeKumariJobList,
    detailScraper: scrapeKumariJobDetail,
    listingUrls: ["https://kumarijob.com/jobs-in-nepal"],
    maxPages: 5,
    maxJobs: 50,
  },
  {
    baseUrl: "https://kantipurjob.com",
    source: "kantipurjob",
    listScraper: scrapeKantipurJobList,
    detailScraper: scrapeKantipurJobDetail,
    listingUrls: ["https://kantipurjob.com/jobs"],
    maxPages: 5,
    maxJobs: 50,
  },
  {
    baseUrl: "https://ramrojob.com",
    source: "ramrojob",
    listScraper: scrapeRamroJobList,
    detailScraper: scrapeRamroJobDetail,
    listingUrls: ["https://ramrojob.com/jobs"],
    maxPages: 5,
    maxJobs: 50,
  },
  {
    baseUrl: "https://internsathi.com",
    source: "internsathi",
    listScraper: scrapeInternSathiList,
    detailScraper: scrapeInternSathiDetail,
    listingUrls: [
      "https://internsathi.com/internships",
      "https://internsathi.com/jobs",
    ],
    maxPages: 3,
    maxJobs: 30,
  },
  {
    baseUrl: "https://jobaxle.com",
    source: "jobaxle",
    listScraper: scrapeJobAxleList,
    detailScraper: scrapeJobAxleDetail,
    listingUrls: ["https://jobaxle.com"], // API endpoint is used directly
    maxPages: 10, // Will fetch all pages automatically
    maxJobs: 200,
  },
  // Note: sajilojob.com and internnepal.com domains not found
  // If you have the correct URLs, add them here
];

export interface ScrapeResult {
  totalScraped: number;
  totalSaved: number;
  totalDuplicates: number;
  totalErrors: number;
  errors: Array<{ source: string; error: string }>;
  bySource: Record<string, { scraped: number; saved: number }>;
}

/**
 * Master scraper orchestrator
 * Discovers routes, scrapes list pages, then scrapes detail pages
 * Returns all scraped jobs
 */
export async function runAllScrapers(): Promise<JobData[]> {
  const allJobs: JobData[] = [];

  console.log("🚀 Starting deep scraping process...\n");

  for (const config of SCRAPER_CONFIGS) {
    try {
      console.log(`\n📡 Processing ${config.source}...`);

      // Step 1: Get listing URLs (use provided or discover)
      let listUrls: string[] = [];
      
      if (config.listingUrls && config.listingUrls.length > 0) {
        listUrls = config.listingUrls;
        console.log(`  📄 Using provided listing URLs: ${listUrls.length}`);
      } else {
        console.log(`  🔍 Discovering routes for ${config.baseUrl}...`);
        const routes = await discoverJobRoutes(config.baseUrl);
        
        if (routes.length === 0) {
          console.log(`  ⚠️  No routes found for ${config.baseUrl}`);
          continue;
        }
        
        listUrls = routes.filter((r) => r.type === "list").slice(0, 3).map(r => r.url);
      }

      // Step 2: Scrape list pages and collect detail URLs
      const detailUrls = new Set<string>();
      const preFetchedJobs: JobData[] = []; // For Intern Sathi GraphQL optimization

      for (const listUrl of listUrls) {
        console.log(`  📄 Scraping list page: ${listUrl}`);
        
        let currentUrl: string | undefined = listUrl;
        let pageCount = 0;

        while (currentUrl && pageCount < (config.maxPages || 5)) {
          try {
            const listResult = await config.listScraper(currentUrl);
            
            // Check if this scraper returned pre-fetched jobs (Intern Sathi GraphQL)
            if ((listResult as any).preFetchedJobs) {
              const jobs = (listResult as any).preFetchedJobs as JobData[];
              preFetchedJobs.push(...jobs);
              console.log(`    ✅ Fetched ${jobs.length} jobs directly from API (total: ${preFetchedJobs.length})`);
            } else {
              listResult.detailUrls.forEach((url) => detailUrls.add(url));
              console.log(`    ✅ Found ${listResult.detailUrls.length} job links (total: ${detailUrls.size})`);
            }

            if (!listResult.hasMore || !listResult.nextPageUrl) {
              break;
            }

            currentUrl = listResult.nextPageUrl;
            pageCount++;
          } catch (error: any) {
            console.error(`    ❌ Error scraping list page: ${error.message}`);
            break;
          }
        }
      }

      // Step 3: Handle pre-fetched jobs (Intern Sathi) or scrape detail pages
      if (preFetchedJobs.length > 0) {
        // Intern Sathi: We already have all the data from GraphQL API
        console.log(`  ⚡ Using pre-fetched jobs from GraphQL API (${preFetchedJobs.length} jobs)`);
        allJobs.push(...preFetchedJobs.slice(0, config.maxJobs || 50));
      } else if (detailUrls.size > 0) {
        // Other sites: Scrape detail pages
        console.log(`  🔍 Scraping ${detailUrls.size} detail pages...`);
        const detailUrlsArray = Array.from(detailUrls).slice(0, config.maxJobs || 50);

        for (const detailUrl of detailUrlsArray) {
          try {
            const jobData = await config.detailScraper(detailUrl);
            
            if (jobData) {
              allJobs.push(jobData);
            }
          } catch (error: any) {
            console.error(`    ❌ Error scraping detail ${detailUrl}: ${error.message}`);
          }
        }
      } else {
        console.log(`  ⚠️  No job detail URLs found for ${config.source}`);
        continue;
      }

      console.log(`  ✅ ${config.source}: Scraped ${allJobs.filter(j => j.source === config.source).length} jobs`);

    } catch (error: any) {
      console.error(`❌ Error processing ${config.source}:`, error.message);
    }
  }

  console.log(`\n✅ Scraping complete! Total jobs: ${allJobs.length}`);

  return allJobs;
}

/**
 * Scrape a single source
 */
export async function scrapeSource(source: string): Promise<JobData[]> {
  const config = SCRAPER_CONFIGS.find((c) => c.source === source);
  if (!config) {
    throw new Error(`Unknown source: ${source}`);
  }

  const jobs: JobData[] = [];
  
  // Get listing URLs
  let listUrls: string[] = [];
  if (config.listingUrls && config.listingUrls.length > 0) {
    listUrls = config.listingUrls;
  } else {
    const routes = await discoverJobRoutes(config.baseUrl);
    listUrls = routes.filter((r) => r.type === "list").slice(0, 2).map(r => r.url);
  }

  // Collect detail URLs
  const detailUrls = new Set<string>();
  for (const listUrl of listUrls) {
    const listResult = await config.listScraper(listUrl);
    listResult.detailUrls.forEach((url) => detailUrls.add(url));
  }

  // Scrape details
  for (const detailUrl of Array.from(detailUrls).slice(0, config.maxJobs || 50)) {
    const jobData = await config.detailScraper(detailUrl);
    if (jobData) {
      jobs.push(jobData);
    }
  }

  return jobs;
}


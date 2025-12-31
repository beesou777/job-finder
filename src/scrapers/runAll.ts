import { discoverJobRoutes } from "./discovery/findRoutes";
import { scrapeMeroCareerList } from "./listPages/merocareer";
import { scrapeJobsNepalList } from "./listPages/jobsnepal";
import { scrapeKumariJobList } from "./listPages/kumarijob";
import { scrapeKantipurJobList } from "./listPages/kantipurjob";
import { scrapeRamroJobList } from "./listPages/ramrojob";
import { scrapeMeroJobList } from "./listPages/merojob";
import { scrapeMeroCareerDetail } from "./detailPages/merocareer";
import { scrapeJobsNepalDetail } from "./detailPages/jobsnepal";
import { scrapeKumariJobDetail } from "./detailPages/kumarijob";
import { scrapeKantipurJobDetail } from "./detailPages/kantipurjob";
import { scrapeRamroJobDetail } from "./detailPages/ramrojob";
import { scrapeMeroJobDetail } from "./detailPages/merojob";
import { scrapeInternSathiList } from "./listPages/internsathi";
import { scrapeInternSathiDetail } from "./detailPages/internsathi";
import { scrapeJobAxleList } from "./listPages/jobaxle";
import { scrapeJobAxleDetail } from "./detailPages/jobaxle";
import { scrapeVritJobsList } from "./listPages/vritjobs";
import { scrapeVritJobsDetail } from "./detailPages/vritjobs";
import { scrapeNecojobsList } from "./listPages/necojobs";
import { scrapeNecojobsDetail } from "./detailPages/necojobs";
import { scrapeJobSniperList } from "./listPages/jobssniper";
import { scrapeJobSniperDetail } from "./detailPages/jobssniper";
import { JobData } from "./core/types";

export interface ScraperConfig {
  baseUrl: string;
  source: string;
  listScraper: (url: string) => Promise<{ detailUrls: string[]; hasMore: boolean; nextPageUrl?: string; preFetchedJobs?: JobData[] }>;
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
    baseUrl: "https://merojob.com",
    source: "merojob",
    listScraper: scrapeMeroJobList,
    detailScraper: scrapeMeroJobDetail,
    listingUrls: ["https://api.merojob.com/api/v1/jobs/?page=1&page_size=50"], // API endpoint
    maxPages: 50, // Will fetch all pages automatically via API (handles 400+ jobs)
    maxJobs: 500,
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
    baseUrl: "https://www.ramrojob.com",
    source: "ramrojob",
    listScraper: scrapeRamroJobList,
    detailScraper: scrapeRamroJobDetail,
    listingUrls: ["https://www.ramrojob.com/advance_search"], // API endpoint
    maxPages: 10, // Will fetch all pages automatically via API
    maxJobs: 500,
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
    maxJobs: 500,
  },
  {
    baseUrl: "https://vritjobs.com",
    source: "vritjobs",
    listScraper: scrapeVritJobsList,
    detailScraper: scrapeVritJobsDetail,
    listingUrls: ["https://api.vritjobs.com/api/jobs/?is_public=true&page=1&search=&size=30"], // API endpoint
    maxPages: 20, // Will fetch all pages automatically via API
    maxJobs: 500,
  },
  {
    baseUrl: "https://www.necojobs.com.np",
    source: "necojobs",
    listScraper: scrapeNecojobsList,
    detailScraper: scrapeNecojobsDetail,
    listingUrls: ["https://www.necojobs.com.np/api/v1/category/category"], // API endpoint for categories
    maxPages: 1, // Will fetch all categories and jobs automatically via API
    maxJobs: 500, // Higher limit since we're fetching from multiple categories
  },
  {
    baseUrl: "https://www.jobssniper.com",
    source: "jobssniper",
    listScraper: scrapeJobSniperList,
    detailScraper: scrapeJobSniperDetail,
    listingUrls: ["https://www.jobssniper.com/api/job-by/fulltime?page=1"], // API endpoint (scraper handles fulltime, parttime, internship internally)
    maxPages: 50, // Will fetch all pages automatically via API
    maxJobs: 500,
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
            
            // Check if this scraper returned pre-fetched jobs (Intern Sathi GraphQL, JobsNepal, etc.)
            if (listResult.preFetchedJobs && listResult.preFetchedJobs.length > 0) {
              preFetchedJobs.push(...listResult.preFetchedJobs);
              console.log(`    ✅ Fetched ${listResult.preFetchedJobs.length} jobs directly from list page (total: ${preFetchedJobs.length})`);
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

      // Step 3: Handle pre-fetched jobs (Intern Sathi, JobsNepal, etc.) or scrape detail pages
      if (preFetchedJobs.length > 0) {
        // Jobs already fetched from list page API or HTML
        console.log(`  ⚡ Using pre-fetched jobs from list page (${preFetchedJobs.length} jobs)`);
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

  console.log(`\n📡 Processing ${config.source}...`);

  const jobs: JobData[] = [];
  const preFetchedJobs: JobData[] = [];
  
  // Get listing URLs
  let listUrls: string[] = [];
  if (config.listingUrls && config.listingUrls.length > 0) {
    listUrls = config.listingUrls;
    console.log(`  📄 Using provided listing URLs: ${listUrls.length}`);
  } else {
    console.log(`  🔍 Discovering routes for ${config.baseUrl}...`);
    const routes = await discoverJobRoutes(config.baseUrl);
    listUrls = routes.filter((r) => r.type === "list").slice(0, 2).map(r => r.url);
  }

  // Collect detail URLs and pre-fetched jobs
  const detailUrls = new Set<string>();

  // Scrape list pages with pagination support
  for (const listUrl of listUrls) {
    console.log(`  📄 Scraping list page: ${listUrl}`);
    
    let currentUrl: string | undefined = listUrl;
    let pageCount = 0;

    while (currentUrl && pageCount < (config.maxPages || 5)) {
      try {
        const listResult = await config.listScraper(currentUrl);
        
        // Check if this scraper returned pre-fetched jobs (API-based scrapers)
        if (listResult.preFetchedJobs && listResult.preFetchedJobs.length > 0) {
          preFetchedJobs.push(...listResult.preFetchedJobs);
          console.log(`    ✅ Fetched ${listResult.preFetchedJobs.length} jobs directly from list page (total: ${preFetchedJobs.length})`);
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

  // Handle pre-fetched jobs or scrape detail pages
  if (preFetchedJobs.length > 0) {
    console.log(`  ⚡ Using pre-fetched jobs from list page (${preFetchedJobs.length} jobs)`);
    jobs.push(...preFetchedJobs.slice(0, config.maxJobs || 500));
  } else if (detailUrls.size > 0) {
    console.log(`  🔍 Scraping ${detailUrls.size} detail pages...`);
    const detailUrlsArray = Array.from(detailUrls).slice(0, config.maxJobs || 50);

    for (const detailUrl of detailUrlsArray) {
      try {
        const jobData = await config.detailScraper(detailUrl);
        if (jobData) {
          jobs.push(jobData);
        }
      } catch (error: any) {
        console.error(`    ❌ Error scraping detail ${detailUrl}: ${error.message}`);
      }
    }
  } else {
    console.log(`  ⚠️  No job detail URLs found for ${config.source}`);
  }

  console.log(`  ✅ ${config.source}: Scraped ${jobs.length} jobs`);

  return jobs;
}


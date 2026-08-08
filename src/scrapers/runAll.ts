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
import { scrapeJobejeeList } from "./listPages/jobejee";
import { scrapeJobejeeDetail } from "./detailPages/jobejee";
import { scrapeWorkHubNepalList } from "./listPages/workhubnepal";
import { scrapeWorkHubNepalDetail } from "./detailPages/workhubnepal";
import { scrapeJobsDynamicsList } from "./listPages/jobsdynamics";
import { scrapeJobsDynamicsDetail } from "./detailPages/jobsdynamics";
import { scrapeMerorojgariList } from "./listPages/merorojgari";
import { scrapeMerorojgariDetail } from "./detailPages/merorojgari";
import { scrapeVocalPandaList } from "./listPages/vocalpanda";
import { scrapeVocalPandaDetail } from "./detailPages/vocalpanda";
import { scrapeInternNepalList } from "./listPages/internepal";
import { scrapeInternNepalDetail } from "./detailPages/internepal";
import { scrapeFroxjobList } from "./listPages/froxjob";
import { scrapeFroxjobDetail } from "./detailPages/froxjob";
import { scrapeSojoDataList } from "./listPages/sojodata";
import { scrapeSojoDataDetail } from "./detailPages/sojodata";
import { scrapeRecruitNepalList } from "./listPages/recruitnepal";
import { scrapeRecruitNepalDetail } from "./detailPages/recruitnepal";
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
    baseUrl: "https://www.kumarijob.com",
    source: "kumarijob",
    listScraper: scrapeKumariJobList,
    detailScraper: scrapeKumariJobDetail,
    listingUrls: ["https://www.kumarijob.com/search?page=1"],
    maxPages: 50, // Will fetch all pages automatically
    maxJobs: 500,
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
  {
    baseUrl: "https://www.jobejee.com",
    source: "jobejee",
    listScraper: scrapeJobejeeList,
    detailScraper: scrapeJobejeeDetail,
    listingUrls: ["https://api.v1.jobejee.com/v2/jobSearch/new?page=0&size=1000"], // API endpoint
    maxPages: 1, // Will fetch all pages automatically via API
    maxJobs: 500,
  },
  {
    baseUrl: "https://www.workhubnepal.com",
    source: "workhubnepal",
    listScraper: scrapeWorkHubNepalList,
    detailScraper: scrapeWorkHubNepalDetail,
    listingUrls: ["https://www.workhubnepal.com/?category=&page=1&_data=routes%2Findex"], // API endpoint
    maxPages: 1, // Will fetch all pages automatically via API
    maxJobs: 500,
  },
  {
    baseUrl: "https://jobsdynamics.com",
    source: "jobsdynamics",
    listScraper: scrapeJobsDynamicsList,
    detailScraper: scrapeJobsDynamicsDetail,
    listingUrls: ["https://jobsdynamics.com/jobs-listing/?ajax_filter=true&job_page=1&per-page=1000&sort-by=recent&posted=all"], // HTML endpoint
    maxPages: 50, // Will fetch all pages automatically
    maxJobs: 500,
  },
  {
    baseUrl: "https://merorojgari.com",
    source: "merorojgari",
    listScraper: scrapeMerorojgariList,
    detailScraper: scrapeMerorojgariDetail,
    listingUrls: ["https://merorojgari.com/?feed=job_feed&job_types=fresher%2Cfull-time%2Cinternship%2Cpart-time&paged=1"], // RSS feed
    maxPages: 50, // Will fetch all pages automatically via RSS
    maxJobs: 500,
  },
  {
    baseUrl: "https://vocalpanda.com",
    source: "vocalpanda",
    listScraper: scrapeVocalPandaList,
    detailScraper: scrapeVocalPandaDetail,
    listingUrls: ["https://vocalpanda.com"], // API endpoint is used directly
    maxPages: 50, // Will fetch all pages automatically via API
    maxJobs: 500,
  },
  {
    baseUrl: "https://internepal.com.np",
    source: "internepal",
    listScraper: scrapeInternNepalList,
    detailScraper: scrapeInternNepalDetail,
    listingUrls: [
      "https://internepal.com.np/vacancy-list?type=internship",
      "https://internepal.com.np/vacancy-list?keyword=&type=job&company_id=&price_range=",
      "https://internepal.com.np/vacancy-list?keyword=&type=fresher-job&company_id=&price_range=",
      "https://internepal.com.np/vacancy-list?keyword=&type=freelance&company_id=&price_range=",
    ],
    maxPages: 20, // Will fetch all pages automatically
    maxJobs: 500,
  },
  {
    baseUrl: "https://froxjob.com",
    source: "froxjob",
    listScraper: scrapeFroxjobList,
    detailScraper: scrapeFroxjobDetail,
    listingUrls: [
      "https://froxjob.com/search/result?keywords=&cityzone=&page=1",
    ],
    maxPages: 50, // Will fetch all pages automatically
    maxJobs: 500,
  },
  {
    baseUrl: "https://api.sojodata.com",
    source: "sojodata",
    listScraper: scrapeSojoDataList,
    detailScraper: scrapeSojoDataDetail,
    listingUrls: ["https://api.sojodata.com/api/v1/public/getEliteJobs?limit=100&page=1"], // API endpoint
    maxPages: 50, // Will fetch all pages automatically via API
    maxJobs: 500,
  },
  {
    baseUrl: "https://recruitnepal.com",
    source: "recruitnepal",
    listScraper: scrapeRecruitNepalList,
    detailScraper: scrapeRecruitNepalDetail,
    listingUrls: ["https://api.recruitnepal.com/api/v1/application/questions?page=1&limit=1000"], // API endpoint (uses questions API which includes vacancy data)
    maxPages: 100, // Will fetch all pages automatically via API
    maxJobs: 1000,
  },
  // Note: sajilojob.com domain not found
  // If you have the correct URL, add it here
];

export interface ScrapeResult {
  totalScraped: number;
  totalSaved: number;
  totalDuplicates: number;
  totalErrors: number;
  errors: Array<{ source: string; error: string }>;
  bySource: Record<string, { scraped: number; saved: number }>;
}

function hasUsefulDescription(job: JobData) {
  return Boolean(job.description && job.description.replace(/\s+/g, " ").trim().length >= 160);
}

async function enrichIncompletePrefetchedJobs(config: ScraperConfig, jobs: JobData[]): Promise<JobData[]> {
  const requestedLimit = Number.parseInt(process.env.SCRAPER_DETAIL_ENRICH_LIMIT || "20", 10);
  const enrichmentLimit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(0, requestedLimit)) : 20;
  let attempts = 0;
  const enriched: JobData[] = [];

  for (const job of jobs) {
    if (hasUsefulDescription(job) || attempts >= enrichmentLimit || !job.applyUrl) {
      enriched.push(job);
      continue;
    }
    attempts++;
    try {
      const detail = await config.detailScraper(job.applyUrl);
      if (detail) {
        enriched.push({
          ...job,
          ...detail,
          title: detail.title || job.title,
          applyUrl: detail.applyUrl || job.applyUrl,
          source: detail.source || job.source,
          description: detail.description?.trim() || job.description,
          requirements: detail.requirements?.trim() || job.requirements,
        });
        continue;
      }
    } catch (error: any) {
      console.warn(`  Detail enrichment skipped for ${job.applyUrl}: ${error.message}`);
    }
    enriched.push(job);
  }

  if (attempts > 0) console.log(`  Attempted detail enrichment for ${attempts} incomplete ${config.source} jobs`);
  return enriched;
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
        const selectedJobs = preFetchedJobs.slice(0, config.maxJobs || 50);
        allJobs.push(...await enrichIncompletePrefetchedJobs(config, selectedJobs));
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
    const selectedJobs = preFetchedJobs.slice(0, config.maxJobs || 500);
    jobs.push(...await enrichIncompletePrefetchedJobs(config, selectedJobs));
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


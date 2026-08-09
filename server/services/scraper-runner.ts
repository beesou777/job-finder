import { scrapeMeroJob } from "../scrapers/legacy/merojob";
import { scrapeKantipurJob } from "../scrapers/legacy/kantipurjob";
import { scrapeJobsNepal } from "../scrapers/legacy/jobsnepal";
import { scrapeMeroCareer } from "../scrapers/legacy/merocareer";
import { scrapeRamroJob } from "../scrapers/legacy/ramrojob";
import { scrapeKumariJob } from "../scrapers/legacy/kumarijob";
import { JobResult } from "./types";

export async function runAllScrapers(): Promise<JobResult[]> {
  console.log("🚀 Starting job scraping...");
  console.log("⚠️  Note: If you see 0 jobs, the site structure may have changed.");
  console.log("    You may need to update the CSS selectors in the scraper files.\n");
  
  const results: JobResult[] = [];

  // Run all scrapers in parallel for better performance
  const scraperPromises = [
    scrapeMeroJob(),
    scrapeKantipurJob(),
    scrapeJobsNepal(),
    scrapeMeroCareer(),
    scrapeRamroJob(),
    scrapeKumariJob(),
  ];

  const allResults = await Promise.allSettled(scraperPromises);

  allResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      results.push(...result.value);
    } else {
      const scraperNames = [
        "MeroJob", "KantipurJob", "JobsNepal", "MeroCareer", 
        "RamroJob", "KumariJob"
      ];
      // Only log if it's a real error (not just 0 jobs)
      if (result.reason?.code !== "ENOTFOUND") {
        console.error(`❌ ${scraperNames[index]} failed:`, result.reason?.message || "Unknown error");
      }
    }
  });

  console.log(`\n✅ Total jobs scraped: ${results.length}`);
  if (results.length === 0) {
    console.log("💡 Tip: Check the actual website HTML structure and update selectors in server/scrapers/legacy/");
  }
  return results;
}


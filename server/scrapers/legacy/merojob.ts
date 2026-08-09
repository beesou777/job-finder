import axios from "axios";
import * as cheerio from "cheerio";
import { JobResult, JobSchema } from "@/server/services/types";

/**
 * MeroJob Scraper
 * 
 * NOTE: MeroJob.com uses Next.js with client-side rendering.
 * Jobs are loaded via JavaScript after page load, so Cheerio
 * cannot extract them from the initial HTML.
 * 
 * Solutions:
 * 1. Use Puppeteer/Playwright for browser automation (not in MVP)
 * 2. Find and use their API endpoint (if available)
 * 3. Check if they have RSS/XML feeds
 * 
 * For now, this scraper will return 0 jobs until updated with
 * proper browser automation or API access.
 */
export async function scrapeMeroJob(): Promise<JobResult[]> {
  try {
    // Try to get the HTML
    const { data } = await axios.get("https://merojob.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const jobs: JobResult[] = [];

    // Try multiple possible selectors
    const selectors = [
      ".card.job-card",
      ".job-card",
      "[class*='job-card']",
      "[class*='JobCard']",
      "article[class*='job']",
      "[data-testid*='job']",
      "[data-cy*='job']",
      ".search-result-item",
      "[class*='search-result']",
    ];

    let foundJobs = false;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        foundJobs = true;
        console.log(`   Found ${elements.length} elements with selector: ${selector}`);
        
        elements.each((_, element) => {
          try {
            // Try to extract job data with multiple possible patterns
            const title = 
              $(element).find("h1, h2, h3, h4, [class*='title'], [class*='Title']").first().text().trim() ||
              $(element).find("a[href*='job'], a[href*='vacancy']").first().text().trim();
            
            const company = 
              $(element).find("[class*='company'], [class*='Company'], [class*='employer']").first().text().trim() ||
              "Not specified";
            
            const location = 
              $(element).find("[class*='location'], [class*='Location'], [class*='address']").first().text().trim() ||
              "Kathmandu";
            
            const relativeUrl = 
              $(element).find("a[href*='job'], a[href*='vacancy']").first().attr("href") ||
              $(element).find("a").first().attr("href");
            
            const url = relativeUrl
              ? relativeUrl.startsWith("http")
                ? relativeUrl
                : `https://merojob.com${relativeUrl}`
              : "";

            if (title && url) {
              const result = JobSchema.safeParse({
                title,
                company,
                location,
                url,
                source: "merojob",
              });

              if (result.success) {
                jobs.push(result.data);
              }
            }
          } catch (err) {
            // Silently skip invalid items
          }
        });
        
        if (jobs.length > 0) break; // Stop if we found jobs with this selector
      }
    }

    // If no jobs found, it's likely a JavaScript-rendered site
    if (!foundJobs && jobs.length === 0) {
      console.log("   ⚠️  No job listings found in initial HTML (likely JS-rendered)");
    }

    console.log(`✅ MeroJob: Scraped ${jobs.length} jobs`);
    return jobs;
  } catch (error: any) {
    console.error("❌ MeroJob scraping failed:", error?.message || error);
    return [];
  }
}
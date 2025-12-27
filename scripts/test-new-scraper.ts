/**
 * Test the new deep scraping system
 * Run with: npx tsx scripts/test-new-scraper.ts
 */

import "reflect-metadata";
import { config } from "dotenv";
import { runAllScrapers } from "../src/scrapers/runAll";
import { discoverJobRoutes } from "../src/scrapers/discovery/findRoutes";
import { scrapeMeroJobList } from "../src/scrapers/listPages/merojob";
import { scrapeMeroJobDetail } from "../src/scrapers/detailPages/merojob";

config();

async function testScraper() {
  try {
    console.log("🧪 Testing new scraper system...\n");

    // Test 1: Route Discovery
    console.log("1️⃣ Testing route discovery for merojob.com...");
    const routes = await discoverJobRoutes("https://merojob.com");
    console.log(`   Found ${routes.length} routes:`);
    routes.forEach(r => {
      console.log(`   - ${r.url} (${r.type}, confidence: ${r.confidence})`);
    });

    if (routes.length === 0) {
      console.log("   ❌ No routes found. Site may be blocking or structure changed.");
      return;
    }

    // Test 2: List Page Scraping
    console.log("\n2️⃣ Testing list page scraping...");
    const listRoute = routes.find(r => r.type === "list");
    if (listRoute) {
      console.log(`   Scraping: ${listRoute.url}`);
      const listResult = await scrapeMeroJobList(listRoute.url);
      console.log(`   Found ${listResult.detailUrls.length} job detail URLs`);
      
      if (listResult.detailUrls.length > 0) {
        console.log(`   First 3 URLs:`);
        listResult.detailUrls.slice(0, 3).forEach((url, i) => {
          console.log(`   ${i + 1}. ${url}`);
        });

        // Test 3: Detail Page Scraping
        console.log("\n3️⃣ Testing detail page scraping...");
        const testUrl = listResult.detailUrls[0];
        console.log(`   Scraping detail: ${testUrl}`);
        const jobData = await scrapeMeroJobDetail(testUrl);
        
        if (jobData) {
          console.log("   ✅ Successfully scraped job:");
          console.log(`   Title: ${jobData.title}`);
          console.log(`   Company: ${jobData.company || "N/A"}`);
          console.log(`   Location: ${jobData.location || "N/A"}`);
          console.log(`   Apply URL: ${jobData.applyUrl}`);
          console.log(`   Type: ${jobData.type}`);
        } else {
          console.log("   ❌ Failed to scrape job detail");
        }
      } else {
        console.log("   ⚠️  No detail URLs found. Possible reasons:");
        console.log("      - Site uses JavaScript rendering");
        console.log("      - Selectors don't match current HTML structure");
        console.log("      - Site is blocking automated requests");
      }
    } else {
      console.log("   ⚠️  No list route found");
    }

    // Test 4: Full Scraper (limited)
    console.log("\n4️⃣ Testing full scraper (first source only)...");
    console.log("   This will take a minute...\n");
    
    const allJobs = await runAllScrapers();
    console.log(`\n   Total jobs scraped: ${allJobs.length}`);
    
    if (allJobs.length > 0) {
      console.log("\n   Sample job:");
      const sample = allJobs[0];
      console.log(`   - ${sample.title} at ${sample.company || "N/A"}`);
      console.log(`   - Source: ${sample.source}`);
      console.log(`   - Type: ${sample.type}`);
    }

  } catch (error: any) {
    console.error("❌ Test error:", error.message);
    console.error(error.stack);
  }
}

testScraper().then(() => process.exit(0));


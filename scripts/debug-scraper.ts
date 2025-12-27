import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";

config();

async function debugScraper(url: string, siteName: string) {
  try {
    console.log(`\n🔍 Debugging ${siteName}...`);
    console.log(`📡 Fetching: ${url}\n`);
    
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    console.log(`✅ Got HTML (${data.length} characters)`);
    
    const $ = cheerio.load(data);
    
    // Test common selectors
    const selectors = [
      ".card.job-card",
      ".job-card",
      ".job-item",
      ".job-listing",
      ".job-post",
      ".vacancy",
      ".job",
      "[class*='job']",
      "[class*='vacancy']",
      "[class*='listing']",
      "article",
      ".search-result",
    ];

    console.log("\n📊 Testing selectors:\n");
    for (const selector of selectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`  ✅ "${selector}": ${count} elements found`);
        
        // Show first element structure
        if (count > 0) {
          const first = $(selector).first();
          console.log(`     HTML preview: ${first.html()?.substring(0, 200)}...`);
        }
      }
    }

    // Look for any links that might be job links
    console.log("\n🔗 Looking for job-related links:\n");
    const links = $("a[href*='job'], a[href*='vacancy'], a[href*='career']");
    console.log(`  Found ${links.length} potential job links`);
    if (links.length > 0) {
      links.slice(0, 5).each((i, el) => {
        const href = $(el).attr("href");
        const text = $(el).text().trim();
        console.log(`  ${i + 1}. ${text.substring(0, 50)} -> ${href}`);
      });
    }

    // Save HTML to file for inspection
    const fs = require("fs");
    const filename = `debug-${siteName.toLowerCase().replace(/\s+/g, "-")}.html`;
    fs.writeFileSync(filename, data);
    console.log(`\n💾 Saved full HTML to: ${filename}`);

  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
    }
  }
}

// Test MeroJob first
debugScraper("https://merojob.com", "MeroJob").then(() => {
  console.log("\n✅ Debug complete!");
  process.exit(0);
});


import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

config();

const SITES = [
  { name: "merojob", url: "https://merojob.com" },
  { name: "jobsnepal", url: "https://jobsnepal.com" },
  { name: "kumarijob", url: "https://kumarijob.com" },
  { name: "kantipurjob", url: "https://kantipurjob.com" },
  { name: "ramrojob", url: "https://ramrojob.com" },
  { name: "merocareer", url: "https://merocareer.com" },
  { name: "kathmandujobs", url: "https://kathmandujobs.com" },
  { name: "nepaljobportal", url: "https://nepaljobportal.com" },
  { name: "jobnepal", url: "https://jobnepal.com" },
];

async function analyzeSite(site: { name: string; url: string }) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 Analyzing: ${site.name} (${site.url})`);
  console.log("=".repeat(60));

  try {
    const { data } = await axios.get(site.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    
    // Save HTML for inspection
    const filename = `debug-${site.name}.html`;
    fs.writeFileSync(filename, data);
    console.log(`✅ Saved HTML to: ${filename}`);

    // Test common selectors
    const selectors = [
      "article",
      ".job-card",
      ".job-item",
      ".job-listing",
      ".vacancy",
      "[class*='job']",
      "[class*='Job']",
      "[class*='vacancy']",
      "[class*='Vacancy']",
      "[class*='listing']",
      ".card",
      ".post",
      "[data-testid*='job']",
      "[data-cy*='job']",
    ];

    console.log("\n📊 Testing selectors:");
    let foundSelectors: Array<{ selector: string; count: number; sample: string }> = [];

    for (const selector of selectors) {
      const elements = $(selector);
      const count = elements.length;
      if (count > 0) {
        const first = elements.first();
        const sample = first.html()?.substring(0, 150) || "";
        foundSelectors.push({ selector, count, sample });
        console.log(`  ✅ "${selector}": ${count} elements`);
      }
    }

    // Find job links
    console.log("\n🔗 Finding job-related links:");
    const linkPatterns = [
      "a[href*='/job']",
      "a[href*='/vacancy']",
      "a[href*='/career']",
      "a[href*='/internship']",
      "a[href*='/opportunity']",
    ];

    let foundLinks = 0;
    for (const pattern of linkPatterns) {
      const links = $(pattern);
      if (links.length > 0) {
        foundLinks += links.length;
        console.log(`  ✅ "${pattern}": ${links.length} links`);
        
        // Show first 3 links
        links.slice(0, 3).each((i, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim().substring(0, 50);
          console.log(`     ${i + 1}. "${text}" -> ${href}`);
        });
      }
    }

    // Find title patterns
    console.log("\n📝 Finding title patterns:");
    const titleSelectors = ["h1", "h2", "h3", "[class*='title']", "[class*='Title']"];
    for (const sel of titleSelectors) {
      const titles = $(sel);
      if (titles.length > 0 && titles.length < 20) {
        const sample = titles.first().text().trim().substring(0, 60);
        if (sample && sample.length > 10) {
          console.log(`  ✅ "${sel}": ${titles.length} elements, sample: "${sample}"`);
        }
      }
    }

    // Check for pagination
    console.log("\n📄 Checking for pagination:");
    const paginationSelectors = [
      "a[href*='page']",
      ".pagination",
      "[class*='pagination']",
      "a.next",
      "a[rel='next']",
    ];
    for (const sel of paginationSelectors) {
      const pag = $(sel);
      if (pag.length > 0) {
        console.log(`  ✅ Found pagination: "${sel}"`);
      }
    }

    // Summary
    console.log("\n📋 Summary:");
    if (foundSelectors.length > 0) {
      console.log(`  ✅ Found ${foundSelectors.length} working selectors`);
      console.log(`  ✅ Best selector: "${foundSelectors[0].selector}" (${foundSelectors[0].count} items)`);
    } else {
      console.log(`  ⚠️  No job selectors found - may be JS-rendered`);
    }
    
    if (foundLinks > 0) {
      console.log(`  ✅ Found ${foundLinks} job-related links`);
    } else {
      console.log(`  ⚠️  No job links found`);
    }

    return {
      name: site.name,
      url: site.url,
      hasJobs: foundSelectors.length > 0 || foundLinks > 0,
      bestSelector: foundSelectors[0]?.selector,
      linkCount: foundLinks,
    };

  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
    if (error.code === "ENOTFOUND") {
      console.error(`  ⚠️  Domain not found - site may be down or URL incorrect`);
    }
    return {
      name: site.name,
      url: site.url,
      hasJobs: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log("🚀 Starting site analysis...");
  console.log("This will fetch HTML from each site and detect job selectors\n");

  const results = [];

  for (const site of SITES) {
    const result = await analyzeSite(site);
    results.push(result);
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));

  const working = results.filter(r => r.hasJobs);
  const broken = results.filter(r => !r.hasJobs);

  console.log(`\n✅ Working sites (${working.length}):`);
  working.forEach(r => {
    console.log(`  - ${r.name}: ${r.url}`);
    if (r.bestSelector) {
      console.log(`    Best selector: "${r.bestSelector}"`);
    }
  });

  console.log(`\n❌ Sites with issues (${broken.length}):`);
  broken.forEach(r => {
    console.log(`  - ${r.name}: ${r.url}`);
    if (r.error) {
      console.log(`    Error: ${r.error}`);
    } else {
      console.log(`    No job selectors found`);
    }
  });

  console.log("\n💾 HTML files saved for inspection:");
  results.forEach(r => {
    console.log(`  - debug-${r.name}.html`);
  });
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});


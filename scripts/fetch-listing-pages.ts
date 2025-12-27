import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

config();

const LISTING_PAGES = [
  { name: "jobsnepal", url: "https://jobsnepal.com/jobs" },
  { name: "kumarijob", url: "https://kumarijob.com/jobs-in-nepal" },
  { name: "merocareer", url: "https://merocareer.com/jobs" },
  { name: "kantipurjob", url: "https://kantipurjob.com/jobs" },
  { name: "ramrojob", url: "https://ramrojob.com/jobs" },
];

async function fetchListingPage(site: { name: string; url: string }) {
  console.log(`\n🔍 Fetching: ${site.name} - ${site.url}`);
  
  try {
    const { data } = await axios.get(site.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);
    const filename = `listing-${site.name}.html`;
    fs.writeFileSync(filename, data);
    console.log(`✅ Saved to: ${filename}`);

    // Find job containers
    const containers = [
      ".jobint",
      ".job-item",
      ".job-card",
      ".job-listing",
      ".card",
      "article",
      "[class*='job']",
      "li",
    ];

    console.log("\n📊 Job containers found:");
    for (const container of containers) {
      const items = $(container);
      if (items.length > 0 && items.length < 100) {
        const first = items.first();
        const hasJobLink = first.find("a[href*='/job'], a[href*='/vacancy']").length > 0;
        const text = first.text().trim().substring(0, 80);
        
        if (hasJobLink || (text.length > 20 && !text.includes("Cookie"))) {
          console.log(`  ✅ "${container}": ${items.length} items`);
          if (hasJobLink) {
            const link = first.find("a[href*='/job'], a[href*='/vacancy']").first();
            console.log(`     Link: ${link.attr("href")}`);
            console.log(`     Title: ${link.text().trim().substring(0, 60)}`);
          }
        }
      }
    }

  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Fetching actual job listing pages...\n");

  for (const site of LISTING_PAGES) {
    await fetchListingPage(site);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n✅ Done!");
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});


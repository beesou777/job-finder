import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

config();

const INTERNSHIP_SITES = [
  { name: "internsathi", url: "https://internsathi.com", baseUrl: "https://internsathi.com" },
  { name: "sajilojob", url: "https://sajilojob.com", baseUrl: "https://sajilojob.com" },
  { name: "internnepal", url: "https://internnepal.com", baseUrl: "https://internnepal.com" },
];

async function analyzeSite(site: { name: string; url: string; baseUrl: string }) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 Analyzing: ${site.name} - ${site.url}`);
  console.log("=".repeat(60));

  try {
    // Try common internship listing paths
    const paths = [
      "/internships",
      "/internship",
      "/jobs",
      "/job",
      "/opportunities",
      "/",
    ];

    for (const path of paths) {
      const fullUrl = `${site.url}${path}`;
      console.log(`\n📄 Trying: ${fullUrl}`);

      try {
        const { data } = await axios.get(fullUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 15000,
          maxRedirects: 5,
        });

        const $ = cheerio.load(data);
        const filename = `internship-${site.name}-${path.replace(/\//g, "_") || "home"}.html`;
        fs.writeFileSync(filename, data);
        console.log(`✅ Saved: ${filename}`);

        // Look for internship/job links
        const jobLinks = $("a[href*='intern'], a[href*='job'], a[href*='vacancy'], a[href*='opportunity']");
        console.log(`   Found ${jobLinks.length} potential job/internship links`);

        if (jobLinks.length > 0) {
          console.log(`   Sample links:`);
          jobLinks.slice(0, 5).each((i, el) => {
            const href = $(el).attr("href");
            const text = $(el).text().trim().substring(0, 50);
            console.log(`     ${i + 1}. "${text}" -> ${href}`);
          });
        }

        // Look for common container patterns
        const containers = [
          ".job", ".job-card", ".job-item", ".internship", ".internship-card",
          ".card", ".post", ".listing", "article", "[class*='job']", "[class*='intern']",
        ];

        for (const container of containers) {
          const items = $(container);
          if (items.length > 0) {
            console.log(`   Found ${items.length} items with selector: ${container}`);
            break;
          }
        }

        // Check if this looks like a listing page
        if (jobLinks.length > 3) {
          console.log(`\n✅ This looks like a listing page!`);
          console.log(`   Recommended path: ${path}`);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error(`❌ Site analysis failed: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Analyzing internship platforms...\n");

  for (const site of INTERNSHIP_SITES) {
    await analyzeSite(site);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n✅ Analysis complete!");
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});


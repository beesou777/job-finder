import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

config();

const LISTING_PAGES = [
  { name: "merocareer", url: "https://merocareer.com/jobs", baseUrl: "https://merocareer.com" },
  { name: "jobsnepal", url: "https://jobsnepal.com/jobs", baseUrl: "https://jobsnepal.com" },
  { name: "kumarijob", url: "https://kumarijob.com/jobs-in-nepal", baseUrl: "https://kumarijob.com" },
];

async function testListingPage(site: { name: string; url: string; baseUrl: string }) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 Testing: ${site.name} - ${site.url}`);
  console.log("=".repeat(60));

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

    // Test our scraper selectors
    const testSelectors = [
      { container: ".jobint", link: "h4 a" },
      { container: ".jobint", link: ".company a" },
      { container: "ul.jobslist li", link: "h4 a" },
      { container: ".card", link: "a[href*='/job']" },
      { container: "article", link: "a[href*='/job']" },
    ];

    console.log("\n📊 Testing selectors:");
    for (const test of testSelectors) {
      const containers = $(test.container);
      let foundLinks = 0;
      const links: string[] = [];

      containers.each((_, el) => {
        const link = $(el).find(test.link).first().attr("href");
        if (link && (link.includes("/job") || link.includes("/vacancy"))) {
          foundLinks++;
          links.push(link);
        }
      });

      if (foundLinks > 0) {
        console.log(`  ✅ "${test.container}" + "${test.link}": ${foundLinks} job links`);
        console.log(`     Sample: ${links[0]}`);
      }
    }

    // Find all job links on page
    console.log("\n🔗 All job links found:");
    const allJobLinks = $("a[href*='/job'], a[href*='/vacancy']");
    console.log(`  Total: ${allJobLinks.length}`);
    allJobLinks.slice(0, 5).each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim().substring(0, 50);
      console.log(`  ${i + 1}. "${text}" -> ${href}`);
    });

  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Testing actual listing pages...\n");

  for (const site of LISTING_PAGES) {
    await testListingPage(site);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n✅ Testing complete!");
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});


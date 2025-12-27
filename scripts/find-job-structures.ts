import "reflect-metadata";
import { config } from "dotenv";
import * as fs from "fs";
import * as cheerio from "cheerio";

config();

const HTML_FILES = [
  "debug-jobsnepal.html",
  "debug-kumarijob.html",
  "debug-merocareer.html",
  "debug-kantipurjob.html",
  "debug-ramrojob.html",
];

function analyzeHTML(filename: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔍 Analyzing: ${filename}`);
  console.log("=".repeat(60));

  try {
    const html = fs.readFileSync(filename, "utf-8");
    const $ = cheerio.load(html);

    // Find all elements that might be job containers
    const possibleContainers: Array<{ selector: string; count: number; sample: string }> = [];

    // Test various patterns
    const patterns = [
      ".jobint",
      ".job-item",
      ".job-card",
      ".job-listing",
      ".job-list-item",
      "[class*='job']",
      ".card",
      "article",
      ".post",
      ".vacancy",
      "[class*='vacancy']",
      ".listing",
      "[class*='listing']",
    ];

    for (const pattern of patterns) {
      const elements = $(pattern);
      if (elements.length > 0 && elements.length < 100) {
        const first = elements.first();
        const html = first.html()?.substring(0, 300) || "";
        const text = first.text().trim().substring(0, 100);
        
        // Check if it has a link inside
        const hasLink = first.find("a[href*='/job'], a[href*='/vacancy'], a[href*='/career']").length > 0;
        
        if (hasLink || text.length > 20) {
          possibleContainers.push({
            selector: pattern,
            count: elements.length,
            sample: `${text.substring(0, 60)}... (hasLink: ${hasLink})`,
          });
        }
      }
    }

    console.log("\n📦 Possible job containers:");
    possibleContainers.forEach((c, i) => {
      console.log(`  ${i + 1}. "${c.selector}": ${c.count} items`);
      console.log(`     Sample: ${c.sample}`);
    });

    // Find the best container (one with links and reasonable count)
    const bestContainer = possibleContainers.find(
      c => c.count > 0 && c.count < 50 && c.sample.includes("hasLink: true")
    ) || possibleContainers[0];

    if (bestContainer) {
      console.log(`\n✅ Best container: "${bestContainer.selector}"`);
      
      // Analyze structure of first item
      const firstItem = $(bestContainer.selector).first();
      
      console.log("\n📋 Structure analysis:");
      
      // Find title
      const titleSelectors = ["h1", "h2", "h3", "h4", "a", "[class*='title']", "[class*='Title']"];
      for (const sel of titleSelectors) {
        const title = firstItem.find(sel).first();
        if (title.length > 0) {
          const text = title.text().trim();
          if (text.length > 10 && text.length < 100) {
            console.log(`  Title (${sel}): "${text}"`);
            break;
          }
        }
      }

      // Find company
      const companySelectors = ["[class*='company']", "[class*='Company']", "[class*='employer']", ".company"];
      for (const sel of companySelectors) {
        const company = firstItem.find(sel).first();
        if (company.length > 0) {
          const text = company.text().trim();
          if (text.length > 0) {
            console.log(`  Company (${sel}): "${text}"`);
            break;
          }
        }
      }

      // Find link
      const link = firstItem.find("a[href*='/job'], a[href*='/vacancy'], a[href*='/career']").first();
      if (link.length > 0) {
        const href = link.attr("href");
        console.log(`  Link: ${href}`);
      }

      // Find location
      const locationSelectors = ["[class*='location']", "[class*='Location']", "[class*='address']"];
      for (const sel of locationSelectors) {
        const loc = firstItem.find(sel).first();
        if (loc.length > 0) {
          const text = loc.text().trim();
          if (text.length > 0) {
            console.log(`  Location (${sel}): "${text}"`);
            break;
          }
        }
      }
    }

  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

console.log("🚀 Analyzing job structures in HTML files...\n");

for (const file of HTML_FILES) {
  if (fs.existsSync(file)) {
    analyzeHTML(file);
  } else {
    console.log(`\n⚠️  File not found: ${file}`);
  }
}

console.log("\n✅ Analysis complete!");


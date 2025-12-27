import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";

config();

async function findSelectors() {
  try {
    console.log("🔍 Analyzing MeroJob HTML structure...\n");
    
    const { data } = await axios.get("https://merojob.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);
    
    // Look for script tags with JSON data
    console.log("📜 Checking for JSON data in script tags...");
    $("script").each((i, el) => {
      const content = $(el).html() || "";
      if (content.includes("job") || content.includes("vacancy") || content.includes("__NEXT_DATA__")) {
        console.log(`\nFound script tag ${i} with job-related content`);
        if (content.includes("__NEXT_DATA__")) {
          const match = content.match(/__NEXT_DATA__\s*=\s*({.+?});/s);
          if (match) {
            try {
              const nextData = JSON.parse(match[1]);
              console.log("✅ Found __NEXT_DATA__!");
              if (nextData.props?.pageProps) {
                console.log("Page props keys:", Object.keys(nextData.props.pageProps));
                if (nextData.props.pageProps.jobs || nextData.props.pageProps.data) {
                  const jobs = nextData.props.pageProps.jobs || nextData.props.pageProps.data;
                  console.log(`Found ${jobs?.length || 0} jobs in __NEXT_DATA__`);
                }
              }
            } catch (e) {
              console.log("Could not parse __NEXT_DATA__");
            }
          }
        }
      }
    });

    // Look for all elements with "job" in class/id
    console.log("\n\n🔍 Finding elements with 'job' in class/id...");
    const jobElements = $("[class*='job'], [id*='job'], [class*='Job'], [id*='Job']");
    console.log(`Found ${jobElements.length} elements with 'job' in attributes`);
    
    if (jobElements.length > 0) {
      jobElements.slice(0, 10).each((i, el) => {
        const classes = $(el).attr("class") || "";
        const id = $(el).attr("id") || "";
        const tag = el.tagName;
        console.log(`  ${i + 1}. <${tag}> class="${classes.substring(0, 50)}" id="${id}"`);
      });
    }

    // Look for links that might be job links
    console.log("\n\n🔗 Finding job-related links...");
    const links = $("a[href*='/job'], a[href*='/vacancy'], a[href*='/career']");
    console.log(`Found ${links.length} potential job links`);
    if (links.length > 0) {
      links.slice(0, 5).each((i, el) => {
        const href = $(el).attr("href");
        const text = $(el).text().trim().substring(0, 50);
        const parent = $(el).parent();
        const parentClass = parent.attr("class") || "";
        console.log(`  ${i + 1}. "${text}" -> ${href}`);
        console.log(`     Parent: <${parent[0]?.tagName}> class="${parentClass.substring(0, 50)}"`);
      });
    }

    // Check for specific MeroJob patterns
    console.log("\n\n🎯 Checking for MeroJob-specific patterns...");
    const patterns = [
      "[data-testid*='job']",
      "[data-cy*='job']",
      ".search-result",
      ".job-search-result",
      "[role='article']",
    ];

    for (const pattern of patterns) {
      const count = $(pattern).length;
      if (count > 0) {
        console.log(`✅ "${pattern}": ${count} elements`);
        const first = $(pattern).first();
        console.log(`   HTML: ${first.html()?.substring(0, 200)}`);
      }
    }

    // Save a sample of the HTML structure
    const body = $("body").html()?.substring(0, 5000);
    console.log("\n\n📄 Body HTML sample (first 5000 chars):");
    console.log(body);

  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

findSelectors().then(() => process.exit(0));


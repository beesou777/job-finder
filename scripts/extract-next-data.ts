import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";

config();

async function extractNextData() {
  try {
    console.log("🔍 Extracting __NEXT_DATA__ from MeroJob...\n");
    
    const { data } = await axios.get("https://merojob.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);
    
    // Find __NEXT_DATA__ script tag
    let nextData: any = null;
    $("script").each((i, el) => {
      const content = $(el).html() || "";
      if (content.includes("__NEXT_DATA__")) {
        const match = content.match(/__NEXT_DATA__\s*=\s*({[\s\S]+?});/);
        if (match) {
          try {
            nextData = JSON.parse(match[1]);
            console.log("✅ Found and parsed __NEXT_DATA__!");
          } catch (e) {
            console.log("Could not parse __NEXT_DATA__");
          }
        }
      }
    });

    if (nextData) {
      console.log("\n📊 Analyzing __NEXT_DATA__ structure...\n");
      
      // Navigate through the structure
      if (nextData.props?.pageProps) {
        console.log("Page Props found!");
        console.log("Keys:", Object.keys(nextData.props.pageProps));
        
        // Look for jobs in various possible locations
        const possibleJobPaths = [
          nextData.props.pageProps.jobs,
          nextData.props.pageProps.data,
          nextData.props.pageProps.results,
          nextData.props.pageProps.jobList,
          nextData.props.pageProps.vacancies,
          nextData.props?.initialState?.jobs,
          nextData.props?.initialState?.data,
        ];

        for (const jobs of possibleJobPaths) {
          if (jobs && Array.isArray(jobs) && jobs.length > 0) {
            console.log(`\n✅ Found ${jobs.length} jobs!`);
            console.log("\nFirst job structure:");
            console.log(JSON.stringify(jobs[0], null, 2));
            return;
          }
        }

        // Print full pageProps to see structure
        console.log("\nFull pageProps structure (first level):");
        console.log(JSON.stringify(nextData.props.pageProps, null, 2).substring(0, 2000));
      } else {
        console.log("No pageProps found");
        console.log("Top level keys:", Object.keys(nextData));
      }
    } else {
      console.log("❌ __NEXT_DATA__ not found");
    }

    // Also try the search/jobs page directly
    console.log("\n\n🔍 Trying /search-jobs or /jobs page...");
    try {
      const { data: jobsPage } = await axios.get("https://merojob.com/search-jobs", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      
      const $jobs = cheerio.load(jobsPage);
      const $jobs2 = cheerio.load(jobsPage);
      
      // Look for job listings
      const selectors = [
        "article", ".card", "[class*='job']", "[class*='vacancy']",
        "[data-testid]", "[data-cy]"
      ];
      
      for (const sel of selectors) {
        const count = $jobs(sel).length;
        if (count > 0) {
          console.log(`Found ${count} elements with selector: ${sel}`);
        }
      }
    } catch (e: any) {
      console.log(`Could not access search page: ${e.message}`);
    }

  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

extractNextData().then(() => process.exit(0));


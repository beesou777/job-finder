import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";

config();

async function inspectMeroJobAPI() {
  try {
    console.log("🔍 Inspecting MeroJob API...\n");
    
    const { data } = await axios.get("https://merojob.com/api/jobs", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/html",
      },
      timeout: 10000,
    });

    console.log(`Response type: ${typeof data}`);
    console.log(`Response length: ${data.length} characters\n`);

    // Try to parse as JSON
    try {
      const json = typeof data === 'string' ? JSON.parse(data) : data;
      console.log("✅ Valid JSON!");
      if (Array.isArray(json)) {
        console.log(`Found ${json.length} jobs in array`);
        if (json.length > 0) {
          console.log("\nFirst job structure:");
          console.log(JSON.stringify(json[0], null, 2));
        }
      } else {
        console.log("JSON structure:");
        console.log(JSON.stringify(json, null, 2).substring(0, 1000));
      }
    } catch (e) {
      console.log("❌ Not valid JSON, trying HTML parsing...");
      const $ = cheerio.load(data);
      
      // Look for job listings in HTML
      const jobSelectors = [
        ".job-card", ".job-item", ".job-listing", 
        "article", "[data-job-id]", ".card"
      ];
      
      for (const selector of jobSelectors) {
        const count = $(selector).length;
        if (count > 0) {
          console.log(`Found ${count} elements with selector: ${selector}`);
        }
      }
      
      // Show first 500 chars
      console.log("\nFirst 500 characters:");
      console.log(data.substring(0, 500));
    }

    // Try with query parameters
    console.log("\n\n🔍 Trying with query parameters...");
    const { data: dataWithParams } = await axios.get("https://merojob.com/api/jobs", {
      params: {
        page: 1,
        limit: 10,
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    console.log(`With params - Type: ${typeof dataWithParams}, Length: ${dataWithParams.length}`);
    
    try {
      const json = typeof dataWithParams === 'string' ? JSON.parse(dataWithParams) : dataWithParams;
      if (Array.isArray(json) && json.length > 0) {
        console.log(`✅ Found ${json.length} jobs with query params!`);
        console.log("\nFirst job:");
        console.log(JSON.stringify(json[0], null, 2));
      }
    } catch (e) {
      console.log("Still not JSON with params");
    }

  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${error.response.data?.substring(0, 500)}`);
    }
  }
}

inspectMeroJobAPI().then(() => process.exit(0));


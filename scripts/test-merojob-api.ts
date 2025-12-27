import "reflect-metadata";
import { config } from "dotenv";
import axios from "axios";

config();

async function testMeroJobAPI() {
  try {
    console.log("🔍 Testing MeroJob API endpoints...\n");
    
    // Try common API patterns
    const endpoints = [
      "https://api.merojob.com/api/jobs",
      "https://api.merojob.com/jobs",
      "https://api.merojob.com/v1/jobs",
      "https://merojob.com/api/jobs",
      "https://merojob.com/api/vacancies",
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        const { data, status } = await axios.get(endpoint, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
          },
          timeout: 5000,
        });
        
        if (status === 200) {
          console.log(`✅ SUCCESS! Status: ${status}`);
          console.log(`   Response type: ${typeof data}`);
          if (Array.isArray(data)) {
            console.log(`   Found ${data.length} items`);
            if (data.length > 0) {
              console.log(`   First item:`, JSON.stringify(data[0], null, 2).substring(0, 300));
            }
          } else if (data?.results || data?.data || data?.jobs) {
            const items = data.results || data.data || data.jobs;
            console.log(`   Found ${items?.length || 0} items in response`);
          } else {
            console.log(`   Response keys:`, Object.keys(data).slice(0, 10));
          }
          return endpoint;
        }
      } catch (e: any) {
        if (e.response) {
          console.log(`   ❌ ${e.response.status}: ${e.response.statusText}`);
        } else {
          console.log(`   ❌ ${e.message}`);
        }
      }
    }

    // Try to find API endpoint in HTML
    console.log("\n🔍 Looking for API endpoints in HTML...");
    const { data: html } = await axios.get("https://merojob.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // Look for API URLs in the HTML
    const apiMatches = html.match(/https?:\/\/[^"'\s]*api[^"'\s]*/gi);
    if (apiMatches) {
      console.log("Found potential API URLs:");
      [...new Set(apiMatches)].slice(0, 10).forEach(url => {
        console.log(`  - ${url}`);
      });
    }

    // Look for __NEXT_DATA__ or similar
    const nextDataMatch = html.match(/__NEXT_DATA__[^<]*/);
    if (nextDataMatch) {
      console.log("\n✅ Found __NEXT_DATA__ (Next.js app)");
      console.log("   This site uses JavaScript rendering. We may need to:");
      console.log("   1. Use Puppeteer/Playwright for browser automation");
      console.log("   2. Find and use their API endpoint");
      console.log("   3. Parse the __NEXT_DATA__ JSON");
    }

  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

testMeroJobAPI().then(() => process.exit(0));


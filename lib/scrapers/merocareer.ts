import axios from "axios";
import * as cheerio from "cheerio";
import { JobResult, JobSchema } from "@/lib/types";

export async function scrapeMeroCareer(): Promise<JobResult[]> {
  try {
    const { data } = await axios.get("https://merocareer.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const jobs: JobResult[] = [];

    $(".job-card, .vacancy-item").each((_, element) => {
      try {
        let title = $(element).find(".job-title, h3, h4").text().trim();
        // Remove "Browse Jobs :" or "Browse Jobs:" prefix if present
        title = title.replace(/^Browse Jobs\s*:\s*/i, "").trim();
        const company = $(element).find(".company-name, .employer").text().trim() || "Not specified";
        const location = $(element).find(".location, .address").text().trim() || "Kathmandu";
        const relativeUrl = $(element).find("a").first().attr("href");
        const url = relativeUrl
          ? relativeUrl.startsWith("http")
            ? relativeUrl
            : `https://merocareer.com${relativeUrl}`
          : "";

        if (title && url) {
          const result = JobSchema.safeParse({
            title,
            company,
            location,
            url,
            source: "merocareer",
          });

          if (result.success) {
            jobs.push(result.data);
          }
        }
      } catch (err) {
        console.error("Error parsing job item:", err);
      }
    });

    console.log(`✅ MeroCareer: Scraped ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error("❌ MeroCareer scraping failed:", error);
    return [];
  }
}


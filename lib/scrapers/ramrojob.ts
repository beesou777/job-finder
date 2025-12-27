import axios from "axios";
import * as cheerio from "cheerio";
import { JobResult, JobSchema } from "@/lib/types";

export async function scrapeRamroJob(): Promise<JobResult[]> {
  try {
    const { data } = await axios.get("https://ramrojob.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const jobs: JobResult[] = [];

    $(".job-listing, .vacancy-card").each((_, element) => {
      try {
        const title = $(element).find(".title, h3, h4").text().trim();
        const company = $(element).find(".company, .organization").text().trim() || "Not specified";
        const location = $(element).find(".location, .place").text().trim() || "Nepal";
        const relativeUrl = $(element).find("a").first().attr("href");
        const url = relativeUrl
          ? relativeUrl.startsWith("http")
            ? relativeUrl
            : `https://ramrojob.com${relativeUrl}`
          : "";

        if (title && url) {
          const result = JobSchema.safeParse({
            title,
            company,
            location,
            url,
            source: "ramrojob",
          });

          if (result.success) {
            jobs.push(result.data);
          }
        }
      } catch (err) {
        console.error("Error parsing job item:", err);
      }
    });

    console.log(`✅ RamroJob: Scraped ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error("❌ RamroJob scraping failed:", error);
    return [];
  }
}


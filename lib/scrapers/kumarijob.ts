import axios from "axios";
import * as cheerio from "cheerio";
import { JobResult, JobSchema } from "@/lib/types";

export async function scrapeKumariJob(): Promise<JobResult[]> {
  try {
    const { data } = await axios.get("https://kumarijob.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const jobs: JobResult[] = [];

    $(".job-post, .vacancy-card").each((_, element) => {
      try {
        const title = $(element).find(".job-title, h3, h4").text().trim();
        const company = $(element).find(".company, .employer-name").text().trim() || "Not specified";
        const location = $(element).find(".location, .address").text().trim() || "Kathmandu";
        const relativeUrl = $(element).find("a").first().attr("href");
        const url = relativeUrl
          ? relativeUrl.startsWith("http")
            ? relativeUrl
            : `https://kumarijob.com${relativeUrl}`
          : "";

        if (title && url) {
          const result = JobSchema.safeParse({
            title,
            company,
            location,
            url,
            source: "kumarijob",
          });

          if (result.success) {
            jobs.push(result.data);
          }
        }
      } catch (err) {
        console.error("Error parsing job item:", err);
      }
    });

    console.log(`✅ KumariJob: Scraped ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error("❌ KumariJob scraping failed:", error);
    return [];
  }
}


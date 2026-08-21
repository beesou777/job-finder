import axios from "axios";
import * as cheerio from "cheerio";
import { JobResult, JobSchema } from "@/server/services/types";

export async function scrapeJobsNepal(): Promise<JobResult[]> {
  try {
    const { data } = await axios.get("https://jobsnepal.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const jobs: JobResult[] = [];

    $(".job-listing, .job-post, article").each((_, element) => {
      try {
        const title = $(element).find(".job-title, h2, h3").text().trim();
        const company =
          $(element).find(".company-name, .employer").text().trim() || "Not specified";
        const location = $(element).find(".location, .job-location").text().trim() || "Nepal";
        const relativeUrl = $(element).find("a").first().attr("href");
        const url = relativeUrl
          ? relativeUrl.startsWith("http")
            ? relativeUrl
            : `https://jobsnepal.com${relativeUrl}`
          : "";

        if (title && url) {
          const result = JobSchema.safeParse({
            title,
            company,
            location,
            url,
            source: "jobsnepal",
          });

          if (result.success) {
            jobs.push(result.data);
          }
        }
      } catch (err) {
        console.error("Error parsing job item:", err);
      }
    });

    console.log(`✅ JobsNepal: Scraped ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error("❌ JobsNepal scraping failed:", error);
    return [];
  }
}

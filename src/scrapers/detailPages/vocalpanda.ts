import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";
import { detectJobType } from "../core/types";

const BASE_URL = "https://vocalpanda.com";

/**
 * Scrape VocalPanda job detail page
 * Since we already have basic data from the API, this is mainly for getting full description
 */
export async function scrapeVocalPandaDetail(url: string): Promise<JobData | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Extract job details from HTML
    const title = $("h1").first().text().trim() || $("title").text().trim();
    if (!title) {
      return null;
    }

    // Try to find company name
    const company =
      $("[class*='company']").first().text().trim() ||
      $("[class*='employer']").first().text().trim() ||
      $(".company-name").first().text().trim() ||
      $("[data-company]").attr("data-company");

    // Try to find location
    const location =
      $("[class*='location']").first().text().trim() ||
      $("[class*='address']").first().text().trim() ||
      $(".location").first().text().trim() ||
      $("[data-location]").attr("data-location");

    // Try to find salary
    const salaryText =
      $("[class*='salary']").first().text().trim() ||
      $("[class*='stipend']").first().text().trim() ||
      $(".salary").first().text().trim() ||
      $("[data-salary]").attr("data-salary");

    // Try to find deadline
    const deadline =
      $("[class*='deadline']").first().text().trim() ||
      $("[class*='expire']").first().text().trim() ||
      $(".deadline").first().text().trim() ||
      $("[data-deadline]").attr("data-deadline");

    // Try to find description
    const description =
      $("[class*='description']").first().text().trim() ||
      $("[class*='detail']").first().text().trim() ||
      $("[class*='content']").first().text().trim() ||
      $(".description").first().text().trim() ||
      $("main").first().text().trim() ||
      $("[class*='job-detail']").first().text().trim();

    // Try to find requirements
    const requirements =
      $("[class*='requirement']").first().text().trim() ||
      $("[class*='qualification']").first().text().trim() ||
      $("[class*='skill']").first().text().trim() ||
      $(".requirements").first().text().trim();

    // Try to find category
    const category =
      $("[class*='category']").first().text().trim() ||
      $("[class*='sector']").first().text().trim() ||
      $(".category").first().text().trim() ||
      $("[data-category]").attr("data-category");

    // Try to find job type
    const jobType =
      $("[class*='job-type']").first().text().trim() ||
      $("[class*='work-mode']").first().text().trim() ||
      $("[data-job-type]").attr("data-job-type");

    return {
      title,
      applyUrl: url,
      company: company || undefined,
      location: location || undefined,
      salaryText: salaryText || undefined,
      deadline: deadline || undefined,
      jobType: jobType || undefined,
      category: category || undefined,
      type: detectJobType(title, url, category),
      source: "vocalpanda",
      description: description || undefined,
      requirements: requirements || undefined,
    };
  } catch (error: any) {
    console.error(`Error scraping VocalPanda detail: ${error.message}`);
    return null;
  }
}

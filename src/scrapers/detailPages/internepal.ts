import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";
import { detectJobType } from "../core/types";

const BASE_URL = "https://internepal.com.np";

/**
 * Scrape Intern Nepal job detail page
 * This is a fallback if list page doesn't have all details
 */
export async function scrapeInternNepalDetail(url: string): Promise<JobData | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);

    // Extract title
    const title =
      $("h1.card_title_20").first().text().trim() ||
      $("h1").first().text().trim() ||
      $("title").text().trim();

    if (!title) {
      return null;
    }

    // Extract company
    const company = $(".company_info_box .company_info").first().find("span").first().text().trim();

    // Extract location
    const locationParts: string[] = [];
    $(".company_info_box .company_info").each((i, el) => {
      const icon = $(el).find("img").attr("alt");
      if (icon && icon.includes("location")) {
        const locationText = $(el).find("span").first().text().trim();
        const locationExtra = $(el).find("span").eq(1).text().trim();
        if (locationText) {
          if (locationExtra && locationExtra !== "()") {
            locationParts.push(`${locationText} (${locationExtra.replace(/[()]/g, "")})`);
          } else {
            locationParts.push(locationText);
          }
        }
      }
    });
    const location = locationParts.join(", ") || undefined;

    // Extract description
    const description =
      $("p.card_description").first().text().trim() ||
      $("[class*='description']").first().text().trim() ||
      $("main").first().text().trim();

    // Extract salary
    let salaryText: string | undefined;
    $(".work_description").each((i, el) => {
      const titleText = $(el).find(".work_description_title span").text().trim();
      if (
        titleText &&
        (titleText.toLowerCase().includes("salary") || titleText.toLowerCase().includes("stipend"))
      ) {
        const salaryContent = $(el).find(".work_description_content span").text().trim();
        if (salaryContent) {
          if (salaryContent.toLowerCase().includes("negotiable")) {
            salaryText = "Negotiable";
          } else {
            salaryText = salaryContent.replace(/\s*-\s*/g, " - ").trim();
            if (!salaryText.includes("Rs.") && !salaryText.toLowerCase().includes("negotiable")) {
              salaryText = `Rs. ${salaryText}`;
            }
          }
        }
      }
    });

    // Extract deadline
    let deadline: string | undefined;
    $(".work_description").each((i, el) => {
      const titleText = $(el).find(".work_description_title span").text().trim();
      if (titleText && titleText.toLowerCase().includes("deadline")) {
        const deadlineText = $(el).find(".work_description_content span").text().trim();
        if (deadlineText) {
          try {
            const date = new Date(deadlineText);
            if (!isNaN(date.getTime())) {
              deadline = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            } else {
              deadline = deadlineText;
            }
          } catch {
            deadline = deadlineText;
          }
        }
      }
    });

    // Extract job type
    const badges: string[] = [];
    $(".badge.badgess_design").each((i, el) => {
      badges.push($(el).text().trim());
    });
    const jobType = badges.join(", ") || undefined;

    // Extract category
    let category: string | undefined;
    if (title.toLowerCase().includes("marketing")) {
      category = "Marketing";
    } else if (
      title.toLowerCase().includes("design") ||
      title.toLowerCase().includes("ui") ||
      title.toLowerCase().includes("ux")
    ) {
      category = "Design";
    } else if (
      title.toLowerCase().includes("developer") ||
      title.toLowerCase().includes("react") ||
      title.toLowerCase().includes("js")
    ) {
      category = "IT & Software";
    } else if (title.toLowerCase().includes("sales")) {
      category = "Sales";
    } else if (title.toLowerCase().includes("admin")) {
      category = "Administration";
    } else if (title.toLowerCase().includes("social media")) {
      category = "Marketing";
    } else if (title.toLowerCase().includes("video")) {
      category = "Media & Communication";
    } else if (title.toLowerCase().includes("business development")) {
      category = "Business Development";
    } else if (title.toLowerCase().includes("data entry")) {
      category = "Data Entry";
    } else if (title.toLowerCase().includes("event")) {
      category = "Event Management";
    }

    // Determine type
    const isInternship = badges.some((b) => b.toLowerCase().includes("internship"));
    const type =
      isInternship || url.includes("internship")
        ? "internship"
        : detectJobType(title, url, category);

    return {
      title,
      applyUrl: url,
      company: company || undefined,
      location: location || undefined,
      salaryText: salaryText || undefined,
      deadline: deadline || undefined,
      jobType: jobType || undefined,
      category: category || undefined,
      type,
      source: "internepal",
      description: description || undefined,
    };
  } catch (error: any) {
    console.error(`Error scraping Intern Nepal detail: ${error.message}`);
    return null;
  }
}

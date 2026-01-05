import axios from "axios";
import { JobData } from "../core/types";
import * as cheerio from "cheerio";
import { detectJobType } from "../core/types";

const BASE_URL = "https://internepal.com.np";

/**
 * Scrape Intern Nepal list page
 * Handles multiple types: internship, job, fresher-job, freelance
 */
export async function scrapeInternNepalList(url: string): Promise<{
  detailUrls: string[];
  hasMore: boolean;
  nextPageUrl?: string;
  preFetchedJobs?: JobData[];
}> {
  try {
    const detailUrls: string[] = [];
    const preFetchedJobs: JobData[] = [];

    console.log(`    🔍 Fetching: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      timeout: 20000,
    });

    const $ = cheerio.load(response.data);

    // Find all job listings - they're in div.single_category_box
    const jobBoxes = $(".single_category_box").filter((i, el) => {
      // Filter out ad boxes (they don't have job details)
      const hasJobTitle = $(el).find("h1.card_title_20").length > 0;
      const hasApplyLink = $(el).find('a[href*="vacancy-detail"]').length > 0;
      return hasJobTitle && hasApplyLink;
    });

    console.log(`    📋 Found ${jobBoxes.length} job listings`);

    jobBoxes.each((index, element) => {
      try {
        const $job = $(element);

        // Extract title
        const title = $job.find("h1.card_title_20").first().text().trim();

        if (!title) {
          return; // Skip if no title
        }

        // Extract company name
        const company = $job
          .find(".company_info_box .company_info")
          .first()
          .find("span")
          .first()
          .text()
          .trim();

        // Extract location
        const locationParts: string[] = [];
        $job
          .find(".company_info_box .company_info")
          .each((i, el) => {
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
        const description = $job.find("p.card_description").first().text().trim();

        // Extract experience
        let experience: string | undefined;
        $job.find(".work_description").each((i, el) => {
          const titleText = $(el).find(".work_description_title span").text().trim();
          if (titleText && titleText.toLowerCase().includes("experience")) {
            experience = $(el).find(".work_description_content span").text().trim();
          }
        });

        // Extract salary/stipend
        let salaryText: string | undefined;
        $job.find(".work_description").each((i, el) => {
          const titleText = $(el).find(".work_description_title span").text().trim();
          if (titleText && (titleText.toLowerCase().includes("salary") || titleText.toLowerCase().includes("stipend"))) {
            const salaryContent = $(el).find(".work_description_content span").text().trim();
            if (salaryContent) {
              // Format salary (e.g., "15,000 -20,000" or "negotiable" or "10,000")
              if (salaryContent.toLowerCase().includes("negotiable")) {
                salaryText = "Negotiable";
              } else {
                // Clean up spacing in ranges like "15,000 -20,000"
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
        $job.find(".work_description").each((i, el) => {
          const titleText = $(el).find(".work_description_title span").text().trim();
          if (titleText && titleText.toLowerCase().includes("deadline")) {
            const deadlineText = $(el).find(".work_description_content span").text().trim();
            if (deadlineText) {
              try {
                // Format date from "2026-01-15" to "January 15, 2026"
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

        // Extract job type badges (Internship, Freelance, Fresher Job, etc.)
        const badges: string[] = [];
        $job.find(".badge.badgess_design").each((i, el) => {
          badges.push($(el).text().trim());
        });
        const jobType = badges.join(", ") || undefined;

        // Extract apply URL
        const applyUrlRelative = $job.find('a[href*="vacancy-detail"]').first().attr("href");
        let applyUrl: string;
        if (applyUrlRelative) {
          applyUrl = applyUrlRelative.startsWith("http")
            ? applyUrlRelative
            : `${BASE_URL}${applyUrlRelative.startsWith("/") ? "" : "/"}${applyUrlRelative}`;
        } else {
          // Fallback: construct from title
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          applyUrl = `${BASE_URL}/vacancy-detail/${slug}`;
        }

        // Determine category (could be inferred from job type or title)
        let category: string | undefined;
        if (title.toLowerCase().includes("marketing")) {
          category = "Marketing";
        } else if (title.toLowerCase().includes("design") || title.toLowerCase().includes("ui") || title.toLowerCase().includes("ux")) {
          category = "Design";
        } else if (title.toLowerCase().includes("developer") || title.toLowerCase().includes("react") || title.toLowerCase().includes("js")) {
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

        // Determine type from URL parameter (primary) or badges (fallback)
        let type: "job" | "internship" = "job";
        const urlObj = new URL(url);
        const urlType = urlObj.searchParams.get("type");
        
        if (urlType === "internship") {
          type = "internship";
        } else if (urlType === "job" || urlType === "fresher-job" || urlType === "freelance") {
          type = "job";
        } else {
          // Fallback: check badges if URL doesn't have type parameter
          const isInternship = badges.some((b) => b.toLowerCase().includes("internship"));
          if (isInternship) {
            type = "internship";
          } else {
            type = detectJobType(title, applyUrl, category);
          }
        }

        const jobData: JobData = {
          title,
          applyUrl,
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

        preFetchedJobs.push(jobData);
        detailUrls.push(applyUrl);
      } catch (error: any) {
        console.error(`    ⚠️  Error parsing job ${index + 1}: ${error.message}`);
      }
    });

    // Check for pagination (look for next page link)
    const nextPageLink = $('a[href*="vacancy-list"]').filter((i, el) => {
      const text = $(el).text().toLowerCase();
      return text.includes("next") || text.includes(">");
    }).first().attr("href");

    let nextPageUrl: string | undefined;
    if (nextPageLink) {
      nextPageUrl = nextPageLink.startsWith("http")
        ? nextPageLink
        : `${BASE_URL}${nextPageLink.startsWith("/") ? "" : "/"}${nextPageLink}`;
    }

    // Also check if there are more pages by looking at page numbers
    const hasMore = nextPageUrl !== undefined || jobBoxes.length >= 20; // Assume 20+ jobs means there might be more pages

    console.log(`    ✅ Extracted ${preFetchedJobs.length} jobs from list page`);

    return {
      detailUrls,
      hasMore,
      nextPageUrl,
      preFetchedJobs,
    };
  } catch (error: any) {
    console.error(`Error scraping Intern Nepal list: ${error.message}`);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
    }
    return { detailUrls: [], hasMore: false };
  }
}


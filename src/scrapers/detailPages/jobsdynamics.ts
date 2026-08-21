import axios from "axios";
import { JobData, calculateExpirationDate, detectJobType } from "../core/types";
import * as cheerio from "cheerio";

const BASE_URL = "https://jobsdynamics.com";

/**
 * Clean HTML and extract text
 */
function cleanHtml(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  return $.text().trim();
}

/**
 * Extract deadline from "Apply Before" text
 */
function extractDeadline(text: string): string | undefined {
  if (!text) return undefined;

  // Look for patterns like "Apply Before : January 31, 2026" or "Apply Before: January 31, 2026"
  const match = text.match(/Apply Before\s*:?\s*(.+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  return undefined;
}

/**
 * JobsDynamics detail scraper
 * Fetches additional information from job detail pages:
 * - Full job description
 * - Requirements/specifications
 * - Deadline/Apply Before date
 * - Additional job details (experience, qualifications, etc.)
 */
export async function scrapeJobsDynamicsDetail(url: string): Promise<JobData | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    if (!response.data) {
      return null;
    }

    const $ = cheerio.load(response.data);

    // Extract title
    const title =
      $("h2.jobsearch-jobdetail-list h2, .jobsearch-jobdetail-list h2").first().text().trim() ||
      $("h1").first().text().trim() ||
      $("title").text().trim();

    if (!title) {
      return null;
    }

    // Extract company
    const companyLink = $(
      ".jobsearch-jobdetail-list figcaption span a, .jobsearch-jobdetail-list figcaption a[href*='companies']",
    );
    let company: string | undefined;
    if (companyLink.length > 0) {
      const companyText = companyLink.text().trim();
      company = companyText.replace(/^@\s*/, "").trim() || undefined;
    }

    // Extract deadline from "Apply Before" text
    let deadline: string | undefined;
    const deadlineElement = $(".jobsearch-jobdetail-options li:has(.jobsearch-calendar)");
    if (deadlineElement.length > 0) {
      const deadlineText = deadlineElement.text().trim();
      deadline = extractDeadline(deadlineText);
    }

    // Extract location (if available on detail page)
    const locationElement = $(
      ".jobsearch-jobdetail-list small:has(.jobsearch-map-pin), .jobsearch-maps-and-flags",
    ).parent();
    const location = locationElement.text().trim() || undefined;

    // Extract full job description first (needed for salary fallback)
    let description: string | undefined;
    const descriptionElement = $(".jobsearch-description");
    if (descriptionElement.length > 0) {
      // Get the HTML content and clean it
      const descriptionHtml = descriptionElement.html() || "";
      description = cleanHtml(descriptionHtml);
    }

    // Extract salary (if available on detail page)
    // Format: <div class="jobsearch-services-text"><span>Salary Status&nbsp;</span> <small>20K-25K</small></div>
    let salaryText: string | undefined;

    // Look for salary in the job services section with careerfy-money icon
    const salaryServiceElement = $("li:has(.careerfy-money) .jobsearch-services-text");
    if (salaryServiceElement.length > 0) {
      const salarySmall = salaryServiceElement.find("small");
      if (salarySmall.length > 0) {
        const salaryValue = salarySmall.text().trim();
        // Use the value if it exists and is not empty
        // It could be "Negotiable", "20K-25K", "Rs. 20000", etc.
        if (salaryValue) {
          // Format it nicely - if it's like "20K-25K", add currency prefix
          if (/^\d+K\s*-\s*\d+K$/i.test(salaryValue)) {
            salaryText = `Rs. ${salaryValue}`;
          } else if (/^\d+-\d+$/i.test(salaryValue)) {
            salaryText = `Rs. ${salaryValue}`;
          } else {
            salaryText = salaryValue;
          }
        }
      }
    }

    // Fallback: Also check if salary is mentioned in the description
    if (!salaryText && description) {
      // Look for salary patterns like "Rs. 20000", "NPRs 20000", "20,000", etc.
      const salaryPatterns = [
        /(?:Rs\.?|NPRs?|NPR)\s*([\d,]+(?:\s*-\s*[\d,]+)?)\s*(?:per\s*(?:month|year|annum|annually))?/i,
        /([\d,]+(?:\s*-\s*[\d,]+)?)\s*(?:Rs\.?|NPRs?|NPR)\s*(?:per\s*(?:month|year|annum|annually))?/i,
        /salary[:\s]+([\d,]+(?:\s*-\s*[\d,]+)?)/i,
      ];

      for (const pattern of salaryPatterns) {
        const match = description.match(pattern);
        if (match && match[1]) {
          salaryText = match[0].trim();
          break;
        }
      }
    }

    // Extract job type (if available on detail page)
    let jobType: string | undefined;
    const jobTypeElement = $(
      ".careerfy-joblisting-plain-status, .jobsearch-joblisting-plain-status",
    );
    if (jobTypeElement.length > 0) {
      jobType = jobTypeElement.text().trim() || undefined;
    }

    // Extract requirements/specifications (usually in the description, but try to separate if possible)
    let requirements: string | undefined;

    // Try to find a separate requirements section
    const requirementsElement = $(".jobsearch-requirements, .job-requirements, .qualifications");
    if (requirementsElement.length > 0) {
      requirements = cleanHtml(requirementsElement.html() || "");
    } else if (description) {
      // If no separate requirements section, try to extract from description
      // Look for "Job Specifications" or "Requirements" section
      // Use [\s\S] instead of . with s flag for compatibility
      const specMatch = description.match(/Job Specifications?\s*([\s\S]+?)(?:\n\n|$)/i);
      if (specMatch && specMatch[1]) {
        requirements = specMatch[1].trim();
      }
    }

    // Extract additional details (experience, qualifications, etc.)
    const experienceElement = $(".jobsearch-services-text:has(.careerfy-briefcase) small");
    const qualificationsElement = $(".jobsearch-services-text:has(.careerfy-degree-cap) small");

    // If we have experience info, add it to requirements if not already there
    if (experienceElement.length > 0 && !requirements?.includes("Experience")) {
      const experience = experienceElement.text().trim();
      if (experience) {
        requirements = requirements
          ? `${requirements}\n\nExperience: ${experience}`
          : `Experience: ${experience}`;
      }
    }

    if (qualificationsElement.length > 0 && !requirements?.includes("Qualifications")) {
      const qualifications = qualificationsElement.text().trim();
      if (qualifications) {
        requirements = requirements
          ? `${requirements}\n\nQualifications: ${qualifications}`
          : `Qualifications: ${qualifications}`;
      }
    }

    // Determine if it's an internship
    const lowerTitle = title.toLowerCase();
    const lowerJobType = jobType?.toLowerCase() || "";
    const isInternship =
      lowerTitle.includes("intern") ||
      lowerTitle.includes("internship") ||
      lowerJobType.includes("intern");

    // Calculate expiration date from deadline
    const expiresAt = calculateExpirationDate(deadline);

    return {
      title: title,
      applyUrl: url, // Use the detail page URL as apply URL
      company: company,
      location: location,
      salaryText: salaryText,
      deadline: deadline,
      jobType: jobType,
      category: undefined, // Could be extracted from sector if available
      type: isInternship ? "internship" : "job",
      source: "jobsdynamics",
      description: description,
      requirements: requirements,
      expiresAt: expiresAt,
    };
  } catch (error: any) {
    console.error(`[JobsDynamics] Error scraping detail page ${url}:`, error.message);
    return null;
  }
}

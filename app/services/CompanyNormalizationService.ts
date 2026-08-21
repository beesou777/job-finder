/**
 * Company Normalization Service
 * Normalizes company names for matching across different sources
 */

/**
 * Normalize company name for matching
 * - Lowercase
 * - Trim whitespace
 * - Remove common suffixes (pvt, ltd, inc, etc.)
 * - Remove punctuation
 * - Normalize whitespace
 */
export function normalizeCompanyName(name: string | null | undefined): string {
  if (!name) return "";

  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(
      /\b(pvt|pvt\.|private|limited|ltd|ltd\.|inc|inc\.|incorporated|corp|corp\.|corporation|llc|llc\.|plc|plc\.|group|groups)\b/gi,
      "",
    ) // Remove common suffixes
    .trim();
}

/**
 * Extract domain from URL
 * Filters out LinkedIn company URLs and removes /mycompany/ path
 */
export function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;

  // Remove /mycompany/ from LinkedIn URLs
  let cleanedUrl = url.replace(/\/mycompany\/?$/, "").replace(/\/mycompany\//, "/");

  try {
    // Add protocol if missing
    const urlWithProtocol = cleanedUrl.startsWith("http") ? cleanedUrl : `https://${cleanedUrl}`;
    const urlObj = new URL(urlWithProtocol);
    const hostname = urlObj.hostname.replace(/^www\./, "").toLowerCase();

    // Filter out LinkedIn company URLs - return null if it's a LinkedIn company page
    if (hostname === "linkedin.com" || hostname === "www.linkedin.com") {
      return null;
    }

    return hostname;
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = cleanedUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
    if (!match) return null;

    const hostname = match[1].toLowerCase().replace(/^www\./, "");

    // Filter out LinkedIn
    if (hostname === "linkedin.com" || hostname === "www.linkedin.com") {
      return null;
    }

    return hostname;
  }
}

/**
 * Normalized company data structure
 */
export interface NormalizedCompany {
  originalName: string;
  normalizedName: string;
  domain: string | null;
}

/**
 * Normalize company data from LinkedIn job
 */
export function normalizeLinkedInCompany(
  company: string | null,
  companyLink: string | null,
  applyLink: string | null,
): NormalizedCompany {
  const normalizedName = normalizeCompanyName(company);

  // Try to extract domain from company_link first, then apply_link
  let domain = extractDomain(companyLink);
  if (!domain) {
    domain = extractDomain(applyLink);
  }

  return {
    originalName: company || "",
    normalizedName,
    domain,
  };
}

/**
 * Normalize company data from platform job
 */
export function normalizePlatformCompany(company: string | null): NormalizedCompany {
  return {
    originalName: company || "",
    normalizedName: normalizeCompanyName(company),
    domain: null, // Platform jobs don't typically have company links
  };
}

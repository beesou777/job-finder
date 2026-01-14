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
    .replace(/\b(pvt|pvt\.|private|limited|ltd|ltd\.|inc|inc\.|incorporated|corp|corp\.|corporation|llc|llc\.|plc|plc\.|group|groups)\b/gi, "") // Remove common suffixes
    .trim();
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const urlObj = new URL(urlWithProtocol);
    return urlObj.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
    return match ? match[1].toLowerCase().replace(/^www\./, "") : null;
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
  applyLink: string | null
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
export function normalizePlatformCompany(
  company: string | null
): NormalizedCompany {
  return {
    originalName: company || "",
    normalizedName: normalizeCompanyName(company),
    domain: null, // Platform jobs don't typically have company links
  };
}

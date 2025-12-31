import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Add UTM parameters to a URL for tracking
 * @param url - The URL to add UTM parameters to
 * @param jobSource - The original job source (e.g., "merojob", "necojobs") - used in utm_content
 * @param jobId - The job ID - used in utm_content
 */
export function addUtmParams(
  url: string,
  jobSource?: string,
  jobId?: string
): string {
  try {
    const urlObj = new URL(url);
    
    // Add UTM parameters
    // utm_source is always "kamkhoj" since that's our website sending the traffic
    urlObj.searchParams.set("utm_source", "kamkhoj");
    urlObj.searchParams.set("utm_medium", "referral");
    urlObj.searchParams.set("utm_campaign", "job-application");
    
    // Combine job source and job ID in utm_content for better tracking
    if (jobSource || jobId) {
      const contentParts = [];
      if (jobSource) contentParts.push(jobSource);
      if (jobId) contentParts.push(jobId);
      urlObj.searchParams.set("utm_content", contentParts.join("-"));
    }
    
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, try to append params manually
    const separator = url.includes("?") ? "&" : "?";
    const params = new URLSearchParams({
      utm_source: "kamkhoj",
      utm_medium: "referral",
      utm_campaign: "job-application",
    });
    
    // Combine job source and job ID in utm_content for better tracking
    if (jobSource || jobId) {
      const contentParts = [];
      if (jobSource) contentParts.push(jobSource);
      if (jobId) contentParts.push(jobId);
      params.set("utm_content", contentParts.join("-"));
    }
    
    return `${url}${separator}${params.toString()}`;
  }
}
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Add UTM parameters to a URL for tracking
 */
export function addUtmParams(
  url: string,
  source?: string,
  jobId?: string
): string {
  try {
    const urlObj = new URL(url);
    
    // Add UTM parameters
    urlObj.searchParams.set("utm_source", source || "kamkhoj");
    urlObj.searchParams.set("utm_medium", "referral");
    urlObj.searchParams.set("utm_campaign", "job-application");
    
    if (jobId) {
      urlObj.searchParams.set("utm_content", jobId);
    }
    
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, try to append params manually
    const separator = url.includes("?") ? "&" : "?";
    const params = new URLSearchParams({
      utm_source: source || "kamkhoj",
      utm_medium: "referral",
      utm_campaign: "job-application",
    });
    
    if (jobId) {
      params.set("utm_content", jobId);
    }
    
    return `${url}${separator}${params.toString()}`;
  }
}
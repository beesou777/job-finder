import { JobData } from "../core/types";

/**
 * Necojobs detail scraper
 * Not needed since the API provides all job data in the list endpoint
 * This is kept for compatibility with the scraper architecture
 */
export async function scrapeNecojobsDetail(url: string): Promise<JobData | null> {
  // All data is already fetched from the list API
  // This function is not used but kept for compatibility
  return null;
}

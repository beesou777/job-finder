import { JobData } from "../core/types";

/**
 * Scrape SojoData detail page
 * Since we're using API, this is mainly for backward compatibility
 * The list scraper should already have all the data we need
 */
export async function scrapeSojoDataDetail(url: string): Promise<JobData | null> {
  // The list scraper already returns pre-fetched jobs with all data
  // This function is kept for compatibility but shouldn't be called
  // If needed, we could fetch individual job details from the API here
  console.warn(
    `[SojoData] Detail scraper called for ${url}, but data should come from list scraper`,
  );
  return null;
}

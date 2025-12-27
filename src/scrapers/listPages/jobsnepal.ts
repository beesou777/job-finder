import { scrapeListPage } from "./base";

const BASE_URL = "https://jobsnepal.com";

export async function scrapeJobsNepalList(url: string) {
  // JobsNepal uses .card with .job-title a for links - confirmed from HTML analysis
  return scrapeListPage(
    url,
    {
      container: [".card", ".card-inner"],
      link: [".job-title a", "h2 a", "a[href*='/job']", "a[href*='/vacancy']"],
      nextPage: ["a[href*='page']", "a:contains('Next')"],
    },
    BASE_URL
  );
}

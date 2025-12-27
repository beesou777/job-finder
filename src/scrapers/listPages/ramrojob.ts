import { scrapeListPage } from "./base";

const BASE_URL = "https://ramrojob.com";

export async function scrapeRamroJobList(url: string) {
  return scrapeListPage(
    url,
    {
      container: [".job-listing", ".vacancy-card", "[class*='job']", "article"],
      link: ["a[href*='/job']", "a[href*='/vacancy']", "a"],
      nextPage: [".pagination a:contains('Next')", "a[href*='page']"],
    },
    BASE_URL
  );
}


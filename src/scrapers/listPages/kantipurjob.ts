import { scrapeListPage } from "./base";

const BASE_URL = "https://kantipurjob.com";

export async function scrapeKantipurJobList(url: string) {
  return scrapeListPage(
    url,
    {
      container: [".job-list-item", ".job-item", "[class*='job']", "article"],
      link: ["a[href*='/job']", "a[href*='/vacancy']", "a"],
      nextPage: ["a[rel='next']", "a[href*='page']"],
    },
    BASE_URL
  );
}


import { scrapeListPage } from "./base";

const BASE_URL = "https://kumarijob.com";

export async function scrapeKumariJobList(url: string) {
  return scrapeListPage(
    url,
    {
      container: ".card, .job-card, .job-item, [class*='job'], article",
      link: "a[href*='/job'], a[href*='/vacancy'], h2 a, h3 a",
      nextPage: ".pagination a.next, a[href*='page']",
    },
    BASE_URL
  );
}


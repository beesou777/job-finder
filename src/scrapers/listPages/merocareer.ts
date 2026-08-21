import { scrapeListPage } from "./base";

const BASE_URL = "https://merocareer.com";

export async function scrapeMeroCareerList(url: string) {
  // MeroCareer uses .jobint class with h4 a for job links - confirmed from HTML analysis
  return scrapeListPage(
    url,
    {
      container: [".jobint", "ul.jobslist li"],
      link: ["h4 a", "a[href*='/job']"],
      nextPage: [".pagination a[href*='page']", "a.next", "a[rel='next']"],
    },
    BASE_URL,
  );
}

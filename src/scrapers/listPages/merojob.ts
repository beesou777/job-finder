import { scrapeListPage } from "./base";

const BASE_URL = "https://merojob.com";

export async function scrapeMeroJobList(url: string) {
  // MeroJob uses Next.js with JS rendering, try many selectors
  const selectors = [
    {
      container: "article",
      link: "a",
      nextPage: "a[aria-label='Next'], a[rel='next']",
    },
    {
      container: "[class*='job']",
      link: "a",
      nextPage: "a[href*='page']",
    },
    {
      container: ".card",
      link: "a",
    },
    {
      container: "[data-testid*='job']",
      link: "a",
    },
    {
      container: "[class*='listing']",
      link: "a",
    },
    {
      container: "[class*='item']",
      link: "a[href*='job'], a[href*='vacancy']",
    },
    {
      container: "div",
      link: "a[href*='/job/'], a[href*='/vacancy/']",
    },
  ];

  for (const selector of selectors) {
    const result = await scrapeListPage(url, selector, BASE_URL);
    if (result.detailUrls.length > 0) {
      return result;
    }
  }

  // Last resort: try to find any job links on the page
  return scrapeListPage(
    url,
    {
      container: "body",
      link: "a[href*='job'], a[href*='vacancy'], a[href*='career']",
    },
    BASE_URL
  );
}


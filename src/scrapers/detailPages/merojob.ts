import { scrapeDetailPage } from "./base";
import { DetailPageSelectors } from "./base";

export async function scrapeMeroJobDetail(url: string) {
  const selectors: DetailPageSelectors = {
    title: ["h1", ".job-title", "[class*='title']"],
    company: [".company-name", "[class*='company']", "[class*='employer']"],
    location: [".location", "[class*='location']", "[class*='address']"],
    salaryText: [".salary", "[class*='salary']", "[class*='compensation']"],
    deadline: [".deadline", "[class*='deadline']", "[class*='closing']"],
    jobType: [".job-type", "[class*='type']"],
    category: [".category", "[class*='category']"],
    description: [".description", ".job-description", "[class*='description']"],
    requirements: [".requirements", ".qualification", "[class*='requirement']"],
    applyUrl: ["a[href*='apply']", ".apply-button a", "a:contains('Apply')"],
  };

  return scrapeDetailPage(url, selectors, "merojob");
}

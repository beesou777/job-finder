import { scrapeDetailPage } from "./base";
import { DetailPageSelectors } from "./base";

export async function scrapeMeroCareerDetail(url: string) {
  const selectors: DetailPageSelectors = {
    title: ["h1", "h2", ".job-title", "[class*='title']"],
    company: [".company", ".company-name", "[class*='company']"],
    location: [".location", ".jobloc", "[class*='location']"],
    salaryText: [".salary", "[class*='salary']"],
    deadline: [".deadline", "[class*='deadline']"],
    jobType: [".job-type", ".fulltime", "[class*='type']"],
    category: [".category", "[class*='category']"],
    description: [".description", ".job-description", "[class*='description']"],
    requirements: [".requirements", ".qualification", "[class*='requirement']"],
    applyUrl: ["a.applybtn", "a[href*='apply']", ".apply-button a"],
  };

  return scrapeDetailPage(url, selectors, "merocareer");
}


import { scrapeDetailPage } from "./base";
import { DetailPageSelectors } from "./base";

export async function scrapeJobsNepalDetail(url: string) {
  const selectors: DetailPageSelectors = {
    title: ["h1", ".job-title", "h2"],
    company: [".company", ".employer", "[class*='company']"],
    location: [".location", "[class*='location']"],
    salaryText: [".salary", "[class*='salary']"],
    deadline: [".deadline", "[class*='deadline']"],
    jobType: [".job-type", "[class*='type']"],
    category: [".category", "[class*='category']"],
    description: [".description", ".job-details", "[class*='description']"],
    requirements: [".requirements", ".qualification"],
    applyUrl: ["a[href*='apply']", ".apply a"],
  };

  return scrapeDetailPage(url, selectors, "jobsnepal");
}

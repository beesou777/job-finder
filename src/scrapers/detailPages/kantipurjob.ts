import { scrapeDetailPage } from "./base";
import { DetailPageSelectors } from "./base";

export async function scrapeKantipurJobDetail(url: string) {
  const selectors: DetailPageSelectors = {
    title: ["h1", ".job-title"],
    company: [".company-name", ".employer"],
    location: [".location"],
    salaryText: [".salary"],
    deadline: [".deadline"],
    jobType: [".job-type"],
    category: [".category"],
    description: [".description", ".job-details"],
    requirements: [".requirements"],
    applyUrl: ["a[href*='apply']"],
  };

  return scrapeDetailPage(url, selectors, "kantipurjob");
}


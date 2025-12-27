import { scrapeDetailPage } from "./base";
import { DetailPageSelectors } from "./base";

export async function scrapeRamroJobDetail(url: string) {
  const selectors: DetailPageSelectors = {
    title: ["h1", ".title"],
    company: [".company"],
    location: [".location"],
    salaryText: [".salary"],
    deadline: [".deadline"],
    jobType: [".type"],
    category: [".category"],
    description: [".description"],
    requirements: [".requirements"],
    applyUrl: ["a[href*='apply']"],
  };

  return scrapeDetailPage(url, selectors, "ramrojob");
}


import { scrapeDetailPage } from "./base";
import { DetailPageSelectors } from "./base";

export async function scrapeKumariJobDetail(url: string) {
  const selectors: DetailPageSelectors = {
    title: ["h1", ".title", "h2"],
    company: [".company", ".employer"],
    location: [".location", ".address"],
    salaryText: [".salary"],
    deadline: [".deadline"],
    jobType: [".type"],
    category: [".category"],
    description: [".description", ".details"],
    requirements: [".requirements"],
    applyUrl: ["a[href*='apply']", ".apply a"],
  };

  return scrapeDetailPage(url, selectors, "kumarijob");
}

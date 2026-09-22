import { describe, expect, it } from "vitest";
import {
  generateBreadcrumbSchema,
  generateJobPostingSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "./seo";
import { isJobSeoIndexable, isJobSitemapCandidate } from "./job-seo";

const completeJob = {
  id: "job-1",
  title: "Frontend Developer",
  description: "A".repeat(200),
  company: "Example Company",
  location: "Kathmandu",
  applyUrl: "https://employer.example/jobs/1",
  createdAt: "2026-09-01T00:00:00.000Z",
  expiresAt: "2026-12-01T00:00:00.000Z",
  type: "full-time",
  isActive: true,
  qualityScore: 80,
};

describe("SEO structured data", () => {
  it("uses stable connected website and organization IDs", () => {
    const website = generateWebSiteSchema();
    const organization = generateOrganizationSchema();
    expect(website.name).toBe("KamKhoj");
    expect(website.alternateName).toEqual(["KamKhoj.com", "kamkhoj.com"]);
    expect(website.publisher["@id"]).toBe(organization["@id"]);
    expect(website.url).toBe("https://www.kamkhoj.com/");
  });

  it("builds canonical breadcrumbs", () => {
    const schema = generateBreadcrumbSchema([
      { name: "Home", url: "https://www.kamkhoj.com/" },
      { name: "Jobs", url: "https://www.kamkhoj.com/jobs" },
    ]);
    expect(schema.itemListElement).toHaveLength(2);
    expect(schema.itemListElement[1].position).toBe(2);
  });

  it("does not invent salary or remote properties in a standard job schema", () => {
    const schema = generateJobPostingSchema(completeJob);
    expect(schema.hiringOrganization.name).toBe("Example Company");
    expect(schema).not.toHaveProperty("baseSalary");
    expect(schema).not.toHaveProperty("jobLocationType");
    expect(schema.url).toBe("https://www.kamkhoj.com/job/job-1");
  });
});

describe("job SEO quality gate", () => {
  it("accepts a complete active job", () => {
    expect(isJobSeoIndexable(completeJob, new Date("2026-09-22"))).toBe(true);
    expect(isJobSitemapCandidate(completeJob, new Date("2026-09-22"))).toBe(true);
  });

  it("rejects expired, duplicate, low-quality, and thin jobs", () => {
    expect(
      isJobSeoIndexable({ ...completeJob, expiresAt: "2026-09-01" }, new Date("2026-09-22")),
    ).toBe(false);
    expect(isJobSeoIndexable({ ...completeJob, isDuplicate: true })).toBe(false);
    expect(isJobSitemapCandidate({ ...completeJob, qualityScore: 20 })).toBe(false);
    expect(isJobSeoIndexable({ ...completeJob, description: "Too short" })).toBe(false);
  });
});

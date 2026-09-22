import { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getJobs } from "@/server/services/data-fetching";
import { getVisibleBlogPosts } from "@/lib/blog";
import { isJobSitemapCandidate } from "@/lib/job-seo";
import { isLandingPageIndexable, seoLandingPages } from "@/lib/seo-pages";
import { roleLandingPages, SEO_MIN_ACTIVE_JOBS } from "@/lib/role-pages";

// Cache the generated sitemap so it does not query the jobs API for every crawler request.
export const revalidate = 3600;

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1.0 },
  { url: absoluteUrl("/jobs"), changeFrequency: "hourly", priority: 0.9 },
  { url: absoluteUrl("/internships"), changeFrequency: "hourly", priority: 0.85 },
  { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/how-kamkhoj-works"), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/editorial-policy"), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteUrl("/tools/salary-calculator-nepal"), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/disclaimer"), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.7 },
];

function validDate(value: unknown) {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const routes: MetadataRoute.Sitemap = [...STATIC_ROUTES];

  const landingConfigs = [...Object.values(seoLandingPages), ...Object.values(roleLandingPages)];
  const landingEntries = await Promise.all(
    landingConfigs.map(async (config) => ({
      config,
      indexable: await isLandingPageIndexable(
        config,
        config.path?.startsWith("/roles/") ? SEO_MIN_ACTIVE_JOBS : 10,
      ),
    })),
  );
  landingEntries
    .filter(({ indexable }) => indexable)
    .forEach(({ config }) => {
      routes.push({
        url: absoluteUrl(config.path || `/${config.slug}`),
        changeFrequency: "daily",
        priority: 0.85,
      });
    });

  const skillSlugs = ["react", "python", "javascript", "seo", "accounting", "digital-marketing"];
  const skillEntries = await Promise.all(
    skillSlugs.map(async (slug) => {
      const search = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      const { total } = await getJobs({ search, limit: 1 });
      return { slug, indexable: total >= SEO_MIN_ACTIVE_JOBS };
    }),
  );
  skillEntries
    .filter(({ indexable }) => indexable)
    .forEach(({ slug }) => {
      routes.push({
        url: absoluteUrl(`/skills/${slug}`),
        changeFrequency: "daily",
        priority: 0.72,
      });
    });

  try {
    const blogPosts = getVisibleBlogPosts();
    blogPosts.forEach((post) => {
      routes.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error("Error adding blog posts to sitemap:", error);
  }

  try {
    // The API validates a maximum page size of 100. Fetch in small batches to avoid
    // a burst of requests while still covering the complete active inventory.
    const pageSize = 100;
    const firstPage = await getJobs({ limit: pageSize, offset: 0 });
    const cappedTotal = Math.min(firstPage.total, 5000);
    const remainingOffsets = Array.from(
      { length: Math.max(0, Math.ceil(cappedTotal / pageSize) - 1) },
      (_, index) => (index + 1) * pageSize,
    );
    const remainingPages: Awaited<ReturnType<typeof getJobs>>[] = [];
    for (let index = 0; index < remainingOffsets.length; index += 4) {
      const batch = remainingOffsets.slice(index, index + 4);
      remainingPages.push(
        ...(await Promise.all(batch.map((offset) => getJobs({ limit: pageSize, offset })))),
      );
    }
    const jobs = [firstPage.jobs, ...remainingPages.map((page) => page.jobs)].flat();
    const uniqueJobs = Array.from(new Map(jobs.map((job) => [job.id, job])).values());
    uniqueJobs
      .filter((job) => isJobSitemapCandidate(job))
      .forEach((job: any) => {
        routes.push({
          url: `${baseUrl}/job/${job.id}`,
          lastModified: validDate(
            job.updatedAt || job.lastVerifiedAt || job.postedAt || job.createdAt,
          ),
          changeFrequency: "daily",
          priority: 0.7,
        });
      });
  } catch (error) {
    console.error("Error adding verified jobs to sitemap:", error);
  }

  return routes;
}

import { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getJobs } from "@/server/services/data-fetching";
import { getVisibleBlogPosts } from "@/lib/blog";

// The job URLs come from the backend, which may not be available in a build environment.
export const dynamic = "force-dynamic";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: absoluteUrl("/jobs"), lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: absoluteUrl("/jobs-in-nepal"), lastModified: new Date(), changeFrequency: "hourly", priority: 0.95 },
  { url: absoluteUrl("/internships"), lastModified: new Date(), changeFrequency: "hourly", priority: 0.85 },
  { url: absoluteUrl("/internships-in-nepal"), lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  { url: absoluteUrl("/it-jobs-nepal"), lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: absoluteUrl("/remote-jobs-nepal"), lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: absoluteUrl("/remote-jobs"), lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: absoluteUrl("/linkedin-jobs"), lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: absoluteUrl("/jobs-in-kathmandu"), lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: absoluteUrl("/jobs-in-pokhara"), lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: absoluteUrl("/banking-jobs-nepal"), lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: absoluteUrl("/marketing-jobs-nepal"), lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  { url: absoluteUrl("/insights"), lastModified: new Date(), changeFrequency: "daily", priority: 0.82 },
  { url: absoluteUrl("/about"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/how-kamkhoj-works"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/editorial-standards"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteUrl("/contact"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteUrl("/tools/salary-calculator-nepal"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: absoluteUrl("/data-sources"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: absoluteUrl("/nepal-job-search-guide"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: absoluteUrl("/privacy"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/privacy-policy"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/terms"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/disclaimer"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  { url: absoluteUrl("/blog"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const routes: MetadataRoute.Sitemap = [...STATIC_ROUTES];

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
    const { jobs } = await getJobs({ limit: 1000 });
    jobs.forEach((job: any) => {
      routes.push({
        url: `${baseUrl}/job/${job.id}`,
        lastModified: job.updatedAt ? new Date(job.updatedAt) : (job.lastVerifiedAt ? new Date(job.lastVerifiedAt) : new Date()),
        changeFrequency: "daily",
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error("Error adding verified jobs to sitemap:", error);
  }

  return routes;
}

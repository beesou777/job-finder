import { MetadataRoute } from 'next'
import { SITE_URL, absoluteUrl } from '@/lib/site'

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteUrl('/'), lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: absoluteUrl('/jobs'), lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  { url: absoluteUrl('/jobs-in-nepal'), lastModified: new Date(), changeFrequency: 'hourly', priority: 0.95 },
  { url: absoluteUrl('/internships'), lastModified: new Date(), changeFrequency: 'hourly', priority: 0.85 },
  { url: absoluteUrl('/internships-in-nepal'), lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  { url: absoluteUrl('/it-jobs-nepal'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
  { url: absoluteUrl('/remote-jobs-nepal'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
  { url: absoluteUrl('/remote-jobs'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: absoluteUrl('/jobs-in-kathmandu'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
  { url: absoluteUrl('/jobs-in-pokhara'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: absoluteUrl('/banking-jobs-nepal'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.82 },
  { url: absoluteUrl('/marketing-jobs-nepal'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: absoluteUrl('/jobs/kathmandu'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: absoluteUrl('/jobs/pokhara'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.75 },
  { url: absoluteUrl('/jobs/category/software-development'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: absoluteUrl('/skills/react'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.75 },
  { url: absoluteUrl('/skills/python'), lastModified: new Date(), changeFrequency: 'daily', priority: 0.75 },
  { url: absoluteUrl('/about'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: absoluteUrl('/contact'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: absoluteUrl('/how-kamkhoj-works'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.55 },
  { url: absoluteUrl('/editorial-policy'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: absoluteUrl('/privacy-policy'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  { url: absoluteUrl('/terms'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  { url: absoluteUrl('/disclaimer'), lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  { url: absoluteUrl('/blog'), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const routes: MetadataRoute.Sitemap = [...STATIC_ROUTES]

  // Try to fetch dynamic content from database, but don't fail if unavailable during build
  try {
    if (!process.env.DATABASE_URL) {
      return routes
    }


    // Add individual blog posts from markdown files
    try {
      const { getAllBlogPosts } = await import('@/lib/blog');
      const blogPosts = getAllBlogPosts();

      blogPosts.forEach((post) => {
        routes.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.date),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      });
    } catch (error) {
      console.error('Error adding blog posts to sitemap:', error);
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}


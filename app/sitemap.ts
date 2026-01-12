import { MetadataRoute } from 'next'
import { getDataSource } from '@/lib/db'
import { Job } from '@/entities/Job'
import { Category } from '@/entities/Category'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_API || 'https://kamkhoj.eventeir.ai'
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/internships`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  // Try to fetch dynamic content from database, but don't fail if unavailable during build
  try {
    if (!process.env.DATABASE_URL) {
      return routes
    }
    
    const dataSource = await getDataSource()
    const jobRepository = dataSource.getRepository(Job)
    const categoryRepository = dataSource.getRepository(Category)

    // Note: We exclude individual job detail URLs from the sitemap because:
    // 1. They are redirect-only pages (302 redirect to external applyUrl)
    // 2. Redirect-only URLs in sitemaps can hurt SEO and look like link farming
    // 3. Our value is in listing pages, not individual redirect pages
    // 4. The actual job content lives on external sites
    
    // If you want to include job detail pages in the future, create actual content pages
    // that display job information before redirecting, rather than instant redirects

    // Add categories
    const categories = await categoryRepository.find()
    categories.forEach((category) => {
      routes.push({
        url: `${baseUrl}/jobs?category=${category.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      })
    })

    // Add location pages
    const locations = [
      { name: 'Kathmandu', slug: 'kathmandu' },
      { name: 'Pokhara', slug: 'pokhara' },
      { name: 'Butwal', slug: 'butwal' },
      { name: 'Biratnagar', slug: 'biratnagar' },
      { name: 'Lalitpur', slug: 'lalitpur' },
    ]

    locations.forEach((location) => {
      routes.push({
        url: `${baseUrl}/jobs/location/${location.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      })
    })

    // Add category pages
    try {
      const allCategories = await categoryRepository.find()
      allCategories.forEach((category) => {
        if (category.slug) {
          routes.push({
            url: `${baseUrl}/jobs/category/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
          })
        }
      })
    } catch (error) {
      console.error('Error adding category pages to sitemap:', error)
    }

    // Add blog pages
    routes.push({
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })

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


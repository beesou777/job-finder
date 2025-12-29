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

    // Add active jobs
    const activeJobs = await jobRepository.find({
      where: {
        expiresAt: null as any, // Will be filtered in query
      },
      take: 1000, // Limit to avoid too large sitemap
      order: {
        createdAt: 'DESC',
      },
    })

    // Filter expired jobs
    const now = new Date()
    const validJobs = activeJobs.filter(job => !job.expiresAt || job.expiresAt > now)

    validJobs.forEach((job) => {
      routes.push({
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: job.createdAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

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
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}


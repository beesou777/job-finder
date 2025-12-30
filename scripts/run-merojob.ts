/**
 * Script to run MeroJob scraper only
 * Run with: npm run scrape:merojob
 * 
 * Uses the API-based scraper that fetches all jobs directly
 */

import "reflect-metadata";
import { config } from "dotenv";
import { getDataSource } from "../lib/db";
import { Job } from "../entities/Job";
import { scrapeSource } from "../src/scrapers/runAll";
import { getCategoryForJob } from "../lib/category-detector";
import { calculateExpirationDate } from "../src/scrapers/core/types";

// Load environment variables
config();

async function runMeroJobScraper() {
  try {
    console.log("🔄 Initializing database connection...");
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    console.log("🕷️  Starting MeroJob scraper...\n");
    
    const allJobs = await scrapeSource("merojob");

    console.log("\n💾 Saving jobs to database...");
    let saved = 0;
    let duplicates = 0;
    let errors = 0;
    const categoryStats = new Map<string, { name: string; count: number }>();

    for (const jobData of allJobs) {
      try {
        // Normalize applyUrl for better duplicate detection
        const normalizeUrl = (url: string): string => {
          try {
            const urlObj = new URL(url);
            // Remove trailing slash, query params, and fragments
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.replace(/\/$/, '')}`.toLowerCase();
          } catch {
            return url.toLowerCase().replace(/\/$/, '').split('?')[0].split('#')[0];
          }
        };

        const normalizedUrl = normalizeUrl(jobData.applyUrl);

        // Check for duplicates by exact applyUrl first (fastest)
        let existing = await jobRepository.findOne({
          where: { applyUrl: jobData.applyUrl },
        });

        // If not found, try normalized URL comparison
        if (!existing) {
          const allJobsWithSimilarUrl = await jobRepository
            .createQueryBuilder("job")
            .where("LOWER(TRIM(BOTH '/' FROM job.applyUrl)) = LOWER(:normalizedUrl)", {
              normalizedUrl: normalizedUrl.replace(/\/$/, ''),
            })
            .getMany();
          
          if (allJobsWithSimilarUrl.length > 0) {
            existing = allJobsWithSimilarUrl[0];
          }
        }

        // Also check by title + company + source as fallback
        if (!existing && jobData.title && jobData.source) {
          const titleMatch = await jobRepository.findOne({
            where: {
              title: jobData.title.trim(),
              source: jobData.source,
            },
          });
          
          if (titleMatch) {
            if (!jobData.company || !titleMatch.company || 
                titleMatch.company.trim().toLowerCase() === (jobData.company || "").trim().toLowerCase()) {
              existing = titleMatch;
            }
          }
        }

        if (existing) {
          duplicates++;
          continue;
        }

        // Handle category - find or create with smart matching
        const { categoryId, categoryName } = await getCategoryForJob(
          jobData.category,
          jobData.title,
          jobData.description,
          jobData.company
        );

        // Calculate expiration date
        const expiresAt = calculateExpirationDate(jobData.deadline);

        // Normalize jobType to enum
        const { normalizeJobType } = await import("../src/scrapers/core/normalizeJobType");
        const normalizedJobType = normalizeJobType(jobData.jobType || null);

        // Set defaults
        const salaryText = jobData.salaryText?.trim() || "Negotiable";
        const postedAt = new Date();

        // Create new job entity
        const job = jobRepository.create({
          ...jobData,
          categoryId: categoryId || null,
          categoryOld: jobData.category || null,
          jobType: normalizedJobType,
          salaryText,
          postedAt,
        } as any);

        await jobRepository.save(job);
        saved++;

        // Track category stats
        if (categoryId && categoryName) {
          const current = categoryStats.get(categoryId) || { name: categoryName, count: 0 };
          categoryStats.set(categoryId, { name: categoryName, count: current.count + 1 });
        }
      } catch (error: any) {
        errors++;
        console.error(`  ❌ Error saving job "${jobData.title}": ${error.message}`);
      }
    }

    console.log("\n✅ Scraping complete!");
    console.log(`📊 Statistics:`);
    console.log(`   Total scraped: ${allJobs.length}`);
    console.log(`   Saved: ${saved}`);
    console.log(`   Duplicates: ${duplicates}`);
    console.log(`   Errors: ${errors}`);

    if (categoryStats.size > 0) {
      console.log(`\n📁 Jobs by category:`);
      const sortedCategories = Array.from(categoryStats.values()).sort(
        (a, b) => b.count - a.count
      );
      sortedCategories.forEach((cat) => {
        console.log(`   ${cat.name}: ${cat.count}`);
      });
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

runMeroJobScraper();


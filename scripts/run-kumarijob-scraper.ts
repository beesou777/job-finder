/**
 * Script to run KumariJob scraper only
 * Run with: npm run scrape:kumarijob or yarn scrape:kumarijob
 * 
 * This script specifically targets kumarijob.com to:
 * - Fetch all jobs from HTML listing pages
 * - Save to database
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

async function runKumariJobScraper() {
  try {
    console.log("🔄 Initializing database connection...");
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    console.log("🕷️  Starting KumariJob scraper...\n");
    console.log("📡 This will fetch all jobs from kumarijob.com HTML listings\n");
    
    const allJobs = await scrapeSource("kumarijob");

    if (allJobs.length === 0) {
      console.log("⚠️  No jobs found. This might indicate:");
      console.log("   1. The HTML structure has changed");
      console.log("   2. There are no active jobs");
      console.log("   3. There's an error in the scraper");
      console.log("\n💡 Check the console logs above for any errors.");
      process.exit(0);
    }

    console.log(`\n✅ Found ${allJobs.length} jobs from KumariJob`);
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

        // If not found, try normalized URL comparison (handles trailing slashes, etc.)
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
          
          // Only consider it a duplicate if company also matches (if company exists)
          if (titleMatch) {
            if (!jobData.company || !titleMatch.company || 
                titleMatch.company.trim().toLowerCase() === (jobData.company || "").trim().toLowerCase()) {
              existing = titleMatch;
            }
          }
        }

        if (!existing) {
          // Handle category - find or create with smart matching
          const { categoryId, categoryName } = await getCategoryForJob(
            jobData.category,
            jobData.title,
            jobData.description,
            jobData.company
          );

          if (categoryId && categoryName) {
            if (jobData.category) {
              console.log(`  📂 Category: "${jobData.category}" → "${categoryName}"`);
            } else {
              console.log(`  🔍 Detected category from title: "${categoryName}"`);
            }
          }

          // Ensure expiresAt is set
          if (!jobData.expiresAt) {
            jobData.expiresAt = calculateExpirationDate(jobData.deadline);
          }

          // Normalize jobType to enum
          const { normalizeJobType } = await import("../src/scrapers/core/normalizeJobType");
          const normalizedJobType = normalizeJobType(jobData.jobType || null);

          // Set defaults
          const salaryText = jobData.salaryText?.trim() || "Negotiable";
          const postedAt = new Date(); // Use current date as posted date

          // Create job entity with categoryId
          const job = jobRepository.create({
            ...jobData,
            categoryId: categoryId || null,
            categoryOld: jobData.category || null,
            jobType: normalizedJobType,
            salaryText,
            postedAt,
          } as any);

          try {
            await jobRepository.save(job);
            saved++;
            
            // Track category statistics
            if (categoryId && categoryName) {
              const current = categoryStats.get(categoryId) || { name: categoryName, count: 0 };
              current.count++;
              categoryStats.set(categoryId, current);
            }
          } catch (saveError: any) {
            // Handle unique constraint violation (duplicate applyUrl)
            if (saveError.code === "23505" || saveError.message?.includes("duplicate") || saveError.message?.includes("unique")) {
              duplicates++;
              console.log(`  ⏭️  Duplicate detected (constraint): ${jobData.title.substring(0, 50)}...`);
            } else {
              errors++;
              console.error(`Error saving job "${jobData.title}":`, saveError.message);
            }
          }
        } else {
          duplicates++;
          if (duplicates % 10 === 0) {
            console.log(`  ⏭️  Skipped ${duplicates} duplicates so far...`);
          }
        }
      } catch (e: any) {
        errors++;
        if (e.code !== "23505" && !e.message?.includes("duplicate") && !e.message?.includes("unique")) {
          console.error(`Error processing job "${jobData.title}":`, e.message);
        } else {
          duplicates++;
        }
      }
    }

    console.log("\n✅ KumariJob scraping completed!");
    console.log(`\n📊 Results:`);
    console.log(`   - Total scraped: ${allJobs.length}`);
    console.log(`   - New jobs saved: ${saved}`);
    console.log(`   - Duplicates skipped: ${duplicates}`);
    if (errors > 0) {
      console.log(`   - Errors: ${errors}`);
    }

    // Print category statistics
    if (categoryStats.size > 0) {
      console.log(`\n📊 Category Assignment Summary:`);
      const sortedCategories = Array.from(categoryStats.values())
        .sort((a, b) => b.count - a.count);
      
      sortedCategories.forEach((stat) => {
        console.log(`   ✅ ${stat.name}: ${stat.count} job(s)`);
      });
      
      const jobsWithoutCategory = saved - Array.from(categoryStats.values())
        .reduce((sum, stat) => sum + stat.count, 0);
      
      if (jobsWithoutCategory > 0) {
        console.log(`   ⚠️  Jobs without category: ${jobsWithoutCategory}`);
      }
    } else {
      console.log(`\n⚠️  No jobs were assigned to categories`);
    }

    process.exit(0);
  } catch (error: any) {
    console.error("❌ KumariJob scraping error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runKumariJobScraper();


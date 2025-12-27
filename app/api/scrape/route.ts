import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { runAllScrapers, scrapeSource } from "@/src/scrapers/runAll";
import { JobData, calculateExpirationDate } from "@/src/scrapers/core/types";
import { getCategoryForJob } from "@/lib/category-detector";

// Check admin password
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  
  if (!authHeader) {
    return false;
  }

  // Support both Bearer token and basic auth
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7) === adminPassword;
  }

  return authHeader === adminPassword;
}

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const source = body.source; // Optional: scrape specific source

    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    console.log("🔄 Starting scraper...");

    let allJobs: JobData[] = [];

    if (source) {
      // Scrape specific source
      console.log(`Scraping source: ${source}`);
      allJobs = await scrapeSource(source);
    } else {
      // Scrape all sources
      console.log("Scraping all sources...");
      allJobs = await runAllScrapers();
    }
    
    console.log(`Total jobs scraped: ${allJobs.length}`);

    // Save to database
    let saved = 0;
    let duplicates = 0;
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

        // Also check by title + company + source as fallback (for cases where URL might vary)
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
          // Handle category - find or create with smart matching, with fallback detection
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
            console.log(`  ✅ Assigned to: ${categoryName}`);
          } else {
            console.log(`  ⚠️  No category found/detected for: ${jobData.title.substring(0, 50)}...`);
          }

          // Ensure expiresAt is set
          if (!jobData.expiresAt) {
            jobData.expiresAt = calculateExpirationDate(jobData.deadline);
          }

          // Create job entity
          const job = jobRepository.create({
            ...jobData,
            categoryId,
            categoryOld: jobData.category || null,
          } as any);

          try {
            await jobRepository.save(job);
            saved++;
            
            if (categoryId && categoryName) {
              // Track category statistics
              const current = categoryStats.get(categoryId) || { name: categoryName, count: 0 };
              current.count++;
              categoryStats.set(categoryId, current);
              
              console.log(`  ✅ Saved job "${jobData.title.substring(0, 50)}..." → Category: ${categoryName}`);
            } else {
              console.log(`  ⚠️  Saved job "${jobData.title.substring(0, 50)}..." → NO CATEGORY`);
            }
          } catch (saveError: any) {
            // Handle unique constraint violation (duplicate applyUrl)
            if (saveError.code === "23505" || saveError.message?.includes("duplicate") || saveError.message?.includes("unique")) {
              duplicates++;
              console.log(`  ⏭️  Duplicate detected (constraint): ${jobData.title.substring(0, 50)}...`);
            } else {
              console.error(`Error saving job "${jobData.title}":`, saveError.message);
              duplicates++; // Count as duplicate to avoid retrying
            }
          }
        } else {
          duplicates++;
          console.log(`  ⏭️  Duplicate skipped: ${jobData.title.substring(0, 50)}...`);
        }
      } catch (error: any) {
        // Skip if error (likely duplicate constraint)
        if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
          duplicates++;
          console.log(`  ⏭️  Duplicate detected (error): ${error.message}`);
        } else {
          console.error(`Error processing job:`, error.message);
          duplicates++; // Count as duplicate to avoid retrying
        }
      }
    }

    // Print category statistics
    console.log(`\n📊 Category Assignment Summary:`);
    if (categoryStats.size > 0) {
      const sortedCategories = Array.from(categoryStats.values())
        .sort((a, b) => b.count - a.count);
      
      sortedCategories.forEach((stat) => {
        console.log(`   ${stat.name}: ${stat.count} job(s)`);
      });
      
      const jobsWithoutCategory = saved - Array.from(categoryStats.values())
        .reduce((sum, stat) => sum + stat.count, 0);
      
      if (jobsWithoutCategory > 0) {
        console.log(`   ⚠️  Jobs without category: ${jobsWithoutCategory}`);
      }
    } else {
      console.log(`   ⚠️  No jobs were assigned to categories`);
    }

    return NextResponse.json({
      success: true,
      totalScraped: allJobs.length,
      saved,
      duplicates,
      categoryStats: Array.from(categoryStats.values()),
      message: `Scraped ${allJobs.length} jobs. Saved ${saved} new jobs, skipped ${duplicates} duplicates.`,
    });
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to scrape jobs" },
      { status: 500 }
    );
  }
}


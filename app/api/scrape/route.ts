import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDataSource } from "@/lib/db";
import { Job } from "@/server/db/entities/Job";
import { runAllScrapers, scrapeSource } from "@/src/scrapers/runAll";
import { JobData, calculateExpirationDate } from "@/src/scrapers/core/types";
import { getCategoryForJob } from "@/server/services/category-detector";
import { calculateJobQuality, getDeadlineConfidence } from "@/server/services/job-quality";
import { createHash } from "crypto";
import { In } from "typeorm";
import { acquireScrapeLock, releaseScrapeLock } from "@/server/services/scrape-lock";

function normalizeJobUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    parsed.pathname = parsed.pathname.replace(/\/$/, "");
    return parsed.toString().toLowerCase();
  } catch {
    return url.toLowerCase().split("?")[0].split("#")[0].replace(/\/$/, "");
  }
}

function getJobFingerprint(job: Pick<JobData, "source" | "applyUrl">) {
  return createHash("sha256")
    .update(`${job.source.trim().toLowerCase()}|${normalizeJobUrl(job.applyUrl)}`)
    .digest("hex");
}

function getContentHash(job: JobData) {
  return createHash("sha256")
    .update(
      [job.title, job.company, job.location, job.deadline, job.description]
        .map((value) => value || "")
        .join("|"),
      "utf8",
    )
    .digest("hex");
}

// Check admin password
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: any = await request.json().catch(() => ({}));
    const source = body.source; // Optional: scrape specific source

    const dataSource = await getDataSource();
    const scrapeLock = await acquireScrapeLock();
    if (!scrapeLock.locked) {
      return NextResponse.json(
        { success: false, error: "A scraper run is already in progress." },
        { status: 409 },
      );
    }
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

    const uniqueJobs = new Map<string, JobData>();
    for (const job of allJobs) {
      if (!job.applyUrl || !job.source) continue;
      const key = getJobFingerprint(job);
      const existing = uniqueJobs.get(key);
      if (!existing || (job.description?.length || 0) > (existing.description?.length || 0))
        uniqueJobs.set(key, job);
    }
    allJobs = Array.from(uniqueJobs.values());
    console.log(`Total unique jobs after in-memory deduplication: ${allJobs.length}`);

    // Load existing fingerprints in batches once instead of querying once per job.
    const existingByFingerprint = new Map<string, Job>();
    const fingerprints = allJobs.map(getJobFingerprint);
    for (let offset = 0; offset < fingerprints.length; offset += 500) {
      const batch = fingerprints.slice(offset, offset + 500);
      if (!batch.length) continue;
      const existingBatch = await jobRepository
        .createQueryBuilder("job")
        .where("job.fingerprint IN (:...fingerprints)", { fingerprints: batch })
        .getMany();
      existingBatch.forEach(
        (job) => job.fingerprint && existingByFingerprint.set(job.fingerprint, job),
      );
    }

    // Save to database
    let saved = 0;
    let duplicates = 0;
    let updated = 0;
    const seenJobIds = new Set<string>();
    const categoryStats = new Map<string, { name: string; count: number }>();
    const pendingUpdates: Job[] = [];
    const pendingCreates: Job[] = [];
    const categoryCache = new Map<string, Awaited<ReturnType<typeof getCategoryForJob>>>();
    const resolveCategory = async (jobData: JobData) => {
      const key = [jobData.category, jobData.title, jobData.company]
        .map((value) => (value || "").trim().toLowerCase())
        .join("|");
      const cached = categoryCache.get(key);
      if (cached) return cached;
      const result = await getCategoryForJob(
        jobData.category,
        jobData.title,
        jobData.description,
        jobData.company,
      );
      categoryCache.set(key, result);
      return result;
    };

    for (const jobData of allJobs) {
      try {
        const fingerprint = getJobFingerprint(jobData);
        const contentHash = getContentHash(jobData);
        // Normalize applyUrl for better duplicate detection
        const normalizeUrl = (url: string): string => {
          try {
            const urlObj = new URL(url);
            // Remove trailing slash, query params, and fragments
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.replace(/\/$/, "")}`.toLowerCase();
          } catch {
            return url.toLowerCase().replace(/\/$/, "").split("?")[0].split("#")[0];
          }
        };

        const normalizedUrl = normalizeUrl(jobData.applyUrl);

        // Check for duplicates by exact applyUrl first (fastest)
        let existing = existingByFingerprint.get(fingerprint) || null;
        if (!existing)
          existing = await jobRepository.findOne({
            where: { fingerprint },
          });
        if (!existing)
          existing = await jobRepository.findOne({
            where: { applyUrl: jobData.applyUrl },
          });

        // If not found, try normalized URL comparison (handles trailing slashes, etc.)
        if (existing) {
          const now = new Date();
          const { categoryId } = await resolveCategory(jobData);
          const { normalizeJobType } = await import("@/src/scrapers/core/normalizeJobType");
          const expiresAt =
            jobData.expiresAt || calculateExpirationDate(jobData.deadline) || existing.expiresAt;
          const expired = Boolean(expiresAt && expiresAt <= now);

          jobRepository.merge(existing, {
            title: jobData.title || existing.title,
            company: jobData.company?.trim() || existing.company,
            location: jobData.location?.trim() || existing.location,
            salaryText: jobData.salaryText?.trim() || existing.salaryText || "Negotiable",
            deadline: jobData.deadline || existing.deadline,
            expiresAt: expiresAt || null,
            jobType: normalizeJobType(jobData.jobType || null) || existing.jobType,
            categoryId: categoryId || existing.categoryId,
            categoryOld: jobData.category || existing.categoryOld,
            type: jobData.type || existing.type,
            description: jobData.description?.trim() || existing.description,
            requirements: jobData.requirements?.trim() || existing.requirements,
            postedAt: jobData.postedAt || existing.postedAt,
            isActive: !expired,
            lastSeenAt: now,
            lastVerifiedAt: now,
            inactiveAt: expired ? now : null,
            inactiveReason: expired ? "deadline_passed" : null,
            consecutiveMisses: 0,
            sourceJobId: jobData.sourceJobId || existing.sourceJobId,
            fingerprint,
            contentHash,
            deadlineConfidence: getDeadlineConfidence(jobData.deadline, jobData.expiresAt),
            qualityScore: calculateJobQuality(jobData),
          } as any);
          pendingUpdates.push(existing);
          seenJobIds.add(existing.id);
          updated++;
          duplicates++;
          continue;
        }

        if (!existing) {
          const allJobsWithSimilarUrl = await jobRepository
            .createQueryBuilder("job")
            .where("LOWER(TRIM(BOTH '/' FROM job.applyUrl)) = LOWER(:normalizedUrl)", {
              normalizedUrl: normalizedUrl.replace(/\/$/, ""),
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
            if (
              !jobData.company ||
              !titleMatch.company ||
              titleMatch.company.trim().toLowerCase() ===
                (jobData.company || "").trim().toLowerCase()
            ) {
              existing = titleMatch;
            }
          }
        }

        if (!existing) {
          // Handle category - find or create with smart matching, with fallback detection
          const { categoryId, categoryName } = await resolveCategory(jobData);

          if (categoryId && categoryName) {
            if (jobData.category) {
              console.log(`  📂 Category: "${jobData.category}" → "${categoryName}"`);
            } else {
              console.log(`  🔍 Detected category from title: "${categoryName}"`);
            }
            console.log(`  ✅ Assigned to: ${categoryName}`);
          } else {
            console.log(
              `  ⚠️  No category found/detected for: ${jobData.title.substring(0, 50)}...`,
            );
          }

          // Ensure expiresAt is set
          if (!jobData.expiresAt) {
            jobData.expiresAt = calculateExpirationDate(jobData.deadline);
          }

          // Normalize jobType to enum
          const { normalizeJobType } = await import("@/src/scrapers/core/normalizeJobType");
          const normalizedJobType = normalizeJobType(jobData.jobType || null);

          // Set defaults
          const salaryText = jobData.salaryText?.trim() || "Negotiable";
          const postedAt = jobData.postedAt || new Date();
          const now = new Date();

          // Create job entity
          const job = jobRepository.create({
            ...jobData,
            categoryId,
            categoryOld: jobData.category || null,
            jobType: normalizedJobType,
            salaryText,
            postedAt,
            isActive: !jobData.expiresAt || jobData.expiresAt > now,
            firstSeenAt: now,
            lastSeenAt: now,
            lastVerifiedAt: now,
            inactiveAt: jobData.expiresAt && jobData.expiresAt <= now ? now : null,
            inactiveReason:
              jobData.expiresAt && jobData.expiresAt <= now ? "deadline_passed" : null,
            consecutiveMisses: 0,
            sourceJobId: jobData.sourceJobId || null,
            fingerprint,
            contentHash,
            deadlineConfidence: getDeadlineConfidence(jobData.deadline, jobData.expiresAt),
            qualityScore: calculateJobQuality(jobData),
          } as any);

          try {
            pendingCreates.push(job as unknown as Job);
            saved++;

            if (categoryId && categoryName) {
              // Track category statistics
              const current = categoryStats.get(categoryId) || { name: categoryName, count: 0 };
              current.count++;
              categoryStats.set(categoryId, current);

              console.log(
                `  ✅ Saved job "${jobData.title.substring(0, 50)}..." → Category: ${categoryName}`,
              );
            } else {
              console.log(`  ⚠️  Saved job "${jobData.title.substring(0, 50)}..." → NO CATEGORY`);
            }
          } catch (saveError: any) {
            // Handle unique constraint violation (duplicate applyUrl)
            if (
              saveError.code === "23505" ||
              saveError.message?.includes("duplicate") ||
              saveError.message?.includes("unique")
            ) {
              duplicates++;
              console.log(
                `  ⏭️  Duplicate detected (constraint): ${jobData.title.substring(0, 50)}...`,
              );
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
        if (
          error.code === "23505" ||
          error.message?.includes("duplicate") ||
          error.message?.includes("unique")
        ) {
          duplicates++;
          console.log(`  ⏭️  Duplicate detected (error): ${error.message}`);
        } else {
          console.error(`Error processing job:`, error.message);
          duplicates++; // Count as duplicate to avoid retrying
        }
      }
    }

    // Flush writes in batches to avoid one INSERT/UPDATE round trip per job.
    const flushBatches = async (jobs: Job[], conflictPaths: string[]) => {
      for (let offset = 0; offset < jobs.length; offset += 250) {
        const batch = jobs.slice(offset, offset + 250);
        if (batch.length) await jobRepository.upsert(batch as any, conflictPaths as any);
      }
    };
    await flushBatches(pendingUpdates, ["id"]);
    await flushBatches(pendingCreates, ["fingerprint"]);
    if (pendingCreates.length) {
      const createdFingerprints = pendingCreates
        .map((job) => job.fingerprint)
        .filter(Boolean) as string[];
      for (let offset = 0; offset < createdFingerprints.length; offset += 500) {
        const rows = await jobRepository.find({
          where: { fingerprint: In(createdFingerprints.slice(offset, offset + 500)) },
        });
        rows.forEach((job) => seenJobIds.add(job.id));
      }
    }

    let deactivated = 0;
    if (source && allJobs.length > 0 && seenJobIds.size > 0) {
      const seenIds = Array.from(seenJobIds);
      await jobRepository
        .createQueryBuilder()
        .update(Job)
        .set({ consecutiveMisses: () => '"consecutiveMisses" + 1' } as any)
        .where("source = :source", { source })
        .andWhere('"isActive" = true')
        .andWhere("id NOT IN (:...seenIds)", { seenIds })
        .execute();

      const reconciliation = await jobRepository
        .createQueryBuilder()
        .update(Job)
        .set({ isActive: false, inactiveAt: new Date(), inactiveReason: "missing_from_source" })
        .where("source = :source", { source })
        .andWhere('"isActive" = true')
        .andWhere('"consecutiveMisses" >= 2')
        .execute();
      deactivated = reconciliation.affected || 0;
    }

    // Print category statistics
    console.log(`\n📊 Category Assignment Summary:`);
    if (categoryStats.size > 0) {
      const sortedCategories = Array.from(categoryStats.values()).sort((a, b) => b.count - a.count);

      sortedCategories.forEach((stat) => {
        console.log(`   ${stat.name}: ${stat.count} job(s)`);
      });

      const jobsWithoutCategory =
        saved - Array.from(categoryStats.values()).reduce((sum, stat) => sum + stat.count, 0);

      if (jobsWithoutCategory > 0) {
        console.log(`   ⚠️  Jobs without category: ${jobsWithoutCategory}`);
      }
    } else {
      console.log(`   ⚠️  No jobs were assigned to categories`);
    }

    // Update company enrichments after scraping
    let enrichmentUpdateResult = null;
    try {
      const { updateEnrichmentsAfterScraping } =
        await import("@/app/services/JobScrapingEnrichmentService");
      enrichmentUpdateResult = await updateEnrichmentsAfterScraping();
      console.log(`✅ Updated ${enrichmentUpdateResult.companiesUpdated} company enrichments`);
    } catch (enrichmentError: any) {
      console.error(
        "⚠️ Error updating enrichments (non-fatal):",
        enrichmentError?.message || enrichmentError,
      );
      // Don't fail the scraping job if enrichment update fails
    }

    if (saved > 0) {
      revalidateTag("jobs");
      revalidateTag("categories");
    }

    const response = NextResponse.json({
      success: true,
      totalScraped: allJobs.length,
      saved,
      updated,
      duplicates,
      deactivated,
      categoryStats: Array.from(categoryStats.values()),
      companiesUpdated: enrichmentUpdateResult?.companiesUpdated || 0,
      message: `Scraped ${allJobs.length} jobs. Saved ${saved} new jobs, skipped ${duplicates} duplicates.${enrichmentUpdateResult ? ` Updated ${enrichmentUpdateResult.companiesUpdated} company enrichments.` : ""}`,
    });
    await releaseScrapeLock(dataSource);
    return response;
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to scrape jobs" },
      { status: 500 },
    );
  }
}

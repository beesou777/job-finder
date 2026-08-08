import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { runAllScrapers } from "@/lib/scraper-runner";

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || request.headers.get("authorization") !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    console.log("🔄 Starting scraping process...");
    const results = await runAllScrapers();

    let saved = 0;
    let duplicates = 0;

    for (const jobData of results) {
      try {
        // Check if job already exists
        const existing = await jobRepository.findOne({
          where: { applyUrl: jobData.url },
        });

        if (!existing) {
          // Map JobResult to Job entity format
          const job = jobRepository.create({
            title: jobData.title,
            applyUrl: jobData.url,
            company: jobData.company,
            location: jobData.location,
            source: jobData.source,
            description: jobData.description || null,
            categoryOld: jobData.category || null,
            type: "job" as const,
          } as any);

          await jobRepository.save(job);
          saved++;
        } else {
          duplicates++;
        }
      } catch (e) {
        console.error("Error saving job:", e);
      }
    }

    if (saved > 0) {
      revalidateTag("jobs");
      revalidateTag("categories");
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      saved,
      duplicates,
      message: `Scraped ${results.length} jobs. Saved ${saved} new jobs, skipped ${duplicates} duplicates.`,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to scrape jobs" },
      { status: 500 }
    );
  }
}


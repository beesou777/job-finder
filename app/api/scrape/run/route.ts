import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { runAllScrapers } from "@/lib/scraper-runner";

export async function POST() {
  try {
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
          where: { url: jobData.url },
        });

        if (!existing) {
          await jobRepository.save(jobData);
          saved++;
        } else {
          duplicates++;
        }
      } catch (e) {
        console.error("Error saving job:", e);
      }
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


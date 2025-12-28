import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAllScrapers } from "@/lib/scraper-runner";

export async function POST() {
  try {
    console.log("🔄 Starting scraping process...");
    const results = await runAllScrapers();

    let saved = 0;
    let duplicates = 0;

    for (const jobData of results) {
      try {
        // Check if job already exists
        const existing = await prisma.job.findUnique({
          where: { applyUrl: jobData.url },
        });

        if (!existing) {
          // Create new job
          await prisma.job.create({
            data: {
              title: jobData.title,
              applyUrl: jobData.url,
              company: jobData.company || null,
              location: jobData.location || null,
              source: jobData.source,
              description: jobData.description || null,
              categoryOld: jobData.category || null,
              type: "job",
            },
          });
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

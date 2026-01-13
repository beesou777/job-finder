import "reflect-metadata";
import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const now = new Date();

    // Optimized: Get all counts in a single query
    const stats = await jobRepository
      .createQueryBuilder("job")
      .select("job.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
      .groupBy("job.type")
      .getRawMany();

    // Parse results
    let totalJobs = 0;
    let totalInternships = 0;
    
    for (const stat of stats) {
      if (stat.type === "job") {
        totalJobs = parseInt(stat.count) || 0;
      } else if (stat.type === "internship") {
        totalInternships = parseInt(stat.count) || 0;
      }
    }

    const total = totalJobs + totalInternships;

    // Get source breakdown (optional, can be removed if not needed)
    const bySource = await jobRepository
      .createQueryBuilder("job")
      .select("job.source", "source")
      .addSelect("COUNT(*)", "count")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
      .groupBy("job.source")
      .getRawMany();

    const response = NextResponse.json({
      success: true,
      data: {
        total,
        totalJobs,
        totalInternships,
        bySource,
      },
    });

    // Add caching headers
    // response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

    return response;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}


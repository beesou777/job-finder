import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";

export const dynamic = 'force-dynamic';

/**
 * API endpoint to get all job data
 * Returns full job objects with all fields including category
 * 
 * Usage: GET /api/kamkhoj/data/all
 * Optional query params:
 *   - source: filter by source (e.g., ?source=merojob)
 *   - type: filter by type (e.g., ?type=job or ?type=internship)
 */
export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get("source");
    const type = searchParams.get("type"); // "job" or "internship"

    const now = new Date();

    // Build query with category join
    let query = jobRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.category", "category")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

    // Apply optional filters
    if (source) {
      query = query.andWhere("job.source = :source", { source });
    }

    if (type) {
      query = query.andWhere("job.type = :type", { type });
    }

    // Execute query and get all jobs
    const jobsEntities = await query
      .orderBy("job.postedAt", "DESC", "NULLS LAST")
      .addOrderBy("job.createdAt", "DESC")
      .getMany();

    // Map entities to the expected format
    const jobs = jobsEntities.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      applyUrl: job.applyUrl,
      type: job.type,
      createdAt: job.createdAt,
      postedAt: job.postedAt || job.createdAt,
      expiresAt: job.expiresAt,
      salaryText: job.salaryText || "Negotiable",
      jobType: job.jobType,
      source: job.source,
      category: job.category ? {
        id: job.category.id,
        name: job.category.name,
        slug: job.category.slug,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching job data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job data" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get("source");
    const type = searchParams.get("type"); // "job" or "internship"
    const categoryId = searchParams.get("category"); // Now expects category ID
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const now = new Date();
    
    let query = jobRepository
      .createQueryBuilder("job")
      .leftJoin("job.category", "category")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
      .orderBy("job.createdAt", "DESC");

    // Apply filters
    if (source) {
      query = query.andWhere("job.source = :source", { source });
    }

    if (type) {
      query = query.andWhere("job.type = :type", { type });
    }

    if (categoryId) {
      query = query.andWhere("job.categoryId = :categoryId", { categoryId });
      console.log(`Filtering by categoryId: ${categoryId}`);
    }

    // Full-text search
    if (search) {
      query = query.andWhere(
        "(job.title ILIKE :search OR job.company ILIKE :search OR category.name ILIKE :search OR job.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Get total count before pagination (clone query to avoid state issues)
    const totalQuery = query.clone();
    const total = await totalQuery.getCount();
    
    // Optimized: Use getRawMany with explicit field selection to exclude description
    const jobsRaw = await query
      .select("job.id", "id")
      .addSelect("job.title", "title")
      .addSelect("job.company", "company")
      .addSelect("job.location", "location")
      .addSelect("job.applyUrl", "applyUrl")
      .addSelect("job.type", "type")
      .addSelect("job.createdAt", "createdAt")
      .addSelect("job.expiresAt", "expiresAt")
      .addSelect("job.salaryText", "salaryText")
      .addSelect("job.jobType", "jobType")
      .addSelect("job.source", "source")
      .addSelect("category.id", "category_id")
      .addSelect("category.name", "category_name")
      .addSelect("category.slug", "category_slug")
      .skip(offset)
      .take(limit)
      .getRawMany();
    
    // Map raw results to match expected format
    const jobs = jobsRaw.map((row: any) => ({
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      applyUrl: row.applyUrl,
      type: row.type,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      salaryText: row.salaryText,
      jobType: row.jobType,
      source: row.source,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      } : null,
    }));
    
    console.log(`Found ${jobs.length} jobs for categoryId: ${categoryId || 'all'}, total: ${total}`);

    const response = NextResponse.json({
      success: true,
      data: jobs,
      total,
      limit,
      offset,
    });

    // Add caching headers for list views
    if (!search && !categoryId) {
      response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    }

    return response;
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      query: error?.query,
      parameters: error?.parameters,
    });
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch jobs",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
        type: error?.name,
      },
      { status: 500 }
    );
  }
}


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
    const jobType = searchParams.get("jobType");
    const urgency = searchParams.get("urgency");
    const type = searchParams.get("type"); // "job" or "internship"
    const categoryId = searchParams.get("category"); // Now expects category ID
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    console.log(`[API] Pagination: limit=${limit}, offset=${offset}`);

    const now = new Date();
    
    let query = jobRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.category", "category")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

    // Apply filters
    if (jobType) {
      query = query.andWhere("job.jobType = :jobType", { jobType });
    }

    // Urgency filter based on expiresAt (how many days left)
    if (urgency) {
      switch (urgency) {
        case "today":
          // Jobs expiring today (within 24 hours)
          const todayEnd = new Date(now);
          todayEnd.setHours(23, 59, 59, 999);
          query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :todayEnd", { now, todayEnd });
          break;
        case "3days":
          // Jobs expiring within 3 days
          const threeDaysFromNow = new Date(now);
          threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
          threeDaysFromNow.setHours(23, 59, 59, 999);
          query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :threeDaysFromNow", { now, threeDaysFromNow });
          break;
        case "7days":
          // Jobs expiring within 7 days
          const sevenDaysFromNow = new Date(now);
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          sevenDaysFromNow.setHours(23, 59, 59, 999);
          query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :sevenDaysFromNow", { now, sevenDaysFromNow });
          break;
        case "30days":
          // Jobs expiring within 30 days
          const thirtyDaysFromNow = new Date(now);
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          thirtyDaysFromNow.setHours(23, 59, 59, 999);
          query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :thirtyDaysFromNow", { now, thirtyDaysFromNow });
          break;
      }
    }

    if (type) {
      query = query.andWhere("job.type = :type", { type });
    }

    if (categoryId) {
      query = query.andWhere("job.categoryId = :categoryId", { categoryId });
      console.log(`Filtering by categoryId: ${categoryId}`);
    }

    if (location) {
      query = query.andWhere("job.location ILIKE :location", { location: `%${location}%` });
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
    
    // Order by postedAt first (migration ensures this is set), then createdAt as fallback
    // leftJoinAndSelect already loads the category relation
    const jobsEntities = await query
      .orderBy("job.postedAt", "DESC", "NULLS LAST")
      .addOrderBy("job.createdAt", "DESC")
      .skip(offset)
      .take(limit)
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
    
    console.log(`[API] Found ${jobs.length} jobs (limit: ${limit}, offset: ${offset}) for categoryId: ${categoryId || 'all'}, total: ${total}`);

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


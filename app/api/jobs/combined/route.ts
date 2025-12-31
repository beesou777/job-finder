import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { Category } from "@/entities/Category";
import { JobTypeEnum } from "@/entities/Job";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

/**
 * Combined endpoint that returns jobs, categories, and filters in a single request
 * This reduces API calls from 3 to 1, significantly improving performance
 */
export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const categoryRepository = dataSource.getRepository(Category);

    const searchParams = request.nextUrl.searchParams;
    const jobType = searchParams.get("jobType");
    const urgency = searchParams.get("urgency");
    const type = searchParams.get("type") || "job";
    const categoryId = searchParams.get("category");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");
    const includeFilters = searchParams.get("includeFilters") !== "false"; // Default true
    const includeCategories = searchParams.get("includeCategories") !== "false"; // Default true

    const now = new Date();

    // Build optimized jobs query
    let jobsQuery = jobRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.category", "category")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

    // Apply filters
    if (jobType) {
      jobsQuery = jobsQuery.andWhere("job.jobType = :jobType", { jobType });
    }

    if (urgency) {
      switch (urgency) {
        case "today":
          const todayEnd = new Date(now);
          todayEnd.setHours(23, 59, 59, 999);
          jobsQuery = jobsQuery.andWhere("job.expiresAt >= :now AND job.expiresAt <= :todayEnd", { now, todayEnd });
          break;
        case "3days":
          const threeDaysFromNow = new Date(now);
          threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
          threeDaysFromNow.setHours(23, 59, 59, 999);
          jobsQuery = jobsQuery.andWhere("job.expiresAt >= :now AND job.expiresAt <= :threeDaysFromNow", { now, threeDaysFromNow });
          break;
        case "7days":
          const sevenDaysFromNow = new Date(now);
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          sevenDaysFromNow.setHours(23, 59, 59, 999);
          jobsQuery = jobsQuery.andWhere("job.expiresAt >= :now AND job.expiresAt <= :sevenDaysFromNow", { now, sevenDaysFromNow });
          break;
        case "30days":
          const thirtyDaysFromNow = new Date(now);
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          thirtyDaysFromNow.setHours(23, 59, 59, 999);
          jobsQuery = jobsQuery.andWhere("job.expiresAt >= :now AND job.expiresAt <= :thirtyDaysFromNow", { now, thirtyDaysFromNow });
          break;
      }
    }

    if (type) {
      jobsQuery = jobsQuery.andWhere("job.type = :type", { type });
    }

    if (categoryId) {
      jobsQuery = jobsQuery.andWhere("job.categoryId = :categoryId", { categoryId });
    }

    if (location) {
      jobsQuery = jobsQuery.andWhere("job.location ILIKE :location", { location: `%${location}%` });
    }

    if (search) {
      jobsQuery = jobsQuery.andWhere(
        "(job.title ILIKE :search OR job.company ILIKE :search OR category.name ILIKE :search OR job.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Execute jobs query and count in parallel
    // Add computed column for sorting (internsathi first)
    const [totalQuery, jobsEntities] = await Promise.all([
      jobsQuery.clone().getCount(),
      jobsQuery
        .addSelect("CASE WHEN job.source = 'internsathi' THEN 0 ELSE 1 END", "source_priority")
        .orderBy("source_priority", "ASC")
        .addOrderBy("job.postedAt", "DESC", "NULLS LAST")
        .addOrderBy("job.createdAt", "DESC")
        .skip(offset)
        .take(limit)
        .getMany(),
    ]);

    const total = totalQuery;
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

    // Fetch categories and filters in parallel only if needed
    const [categories, filters] = await Promise.all([
      includeCategories ? fetchCategories(categoryRepository, jobRepository, now) : Promise.resolve([]),
      includeFilters ? fetchFilters(jobRepository, type, now) : Promise.resolve({ jobTypes: [], locations: [] }),
    ]);

    const response = NextResponse.json({
      success: true,
      data: {
        jobs,
        categories,
        filters,
      },
      total,
      limit,
      offset,
    });

    // Add caching headers
    if (!search && !categoryId) {
      response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    }

    return response;
  } catch (error: any) {
    console.error("Error in combined jobs API:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch data",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

async function fetchCategories(categoryRepository: any, jobRepository: any, now: Date) {
  // Optimized: Get categories with job counts in a single query
  const categoriesWithJobs = await categoryRepository
    .createQueryBuilder("category")
    .leftJoin("category.jobs", "job", "(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
    .select("category.id", "id")
    .addSelect("category.name", "name")
    .addSelect("category.slug", "slug")
    .addSelect("COUNT(job.id)", "jobCount")
    .groupBy("category.id")
    .having("COUNT(job.id) > 0")
    .orderBy("COUNT(job.id)", "DESC")
    .limit(20)
    .getRawMany();

  return categoriesWithJobs.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    jobCount: parseInt(c.jobCount) || 0,
  }));
}

async function fetchFilters(jobRepository: any, type: string, now: Date) {
  // Build base query once
  let baseQuery = jobRepository
    .createQueryBuilder("job")
    .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

  if (type) {
    baseQuery = baseQuery.andWhere("job.type = :type", { type });
  }

  // Fetch job types and locations in parallel
  const [jobTypes, locations] = await Promise.all([
    baseQuery
      .clone()
      .select("job.jobType", "jobType")
      .addSelect("COUNT(*)", "count")
      .andWhere("job.jobType IS NOT NULL AND job.jobType != ''")
      .groupBy("job.jobType")
      .orderBy("COUNT(*)", "DESC")
      .getRawMany(),
    baseQuery
      .clone()
      .select("job.location", "location")
      .addSelect("COUNT(*)", "count")
      .andWhere("job.location IS NOT NULL AND job.location != ''")
      .groupBy("job.location")
      .orderBy("COUNT(*)", "DESC")
      .limit(50)
      .getRawMany(),
  ]);

  // Map job types to enum values with labels
  const jobTypeLabels: Record<JobTypeEnum, string> = {
    [JobTypeEnum.FULL_TIME]: "Full time",
    [JobTypeEnum.PART_TIME]: "Part time",
    [JobTypeEnum.CONTRACT]: "Contract",
    [JobTypeEnum.REMOTE]: "Remote",
    [JobTypeEnum.HYBRID]: "Hybrid",
    [JobTypeEnum.ONSITE]: "On-Site",
    [JobTypeEnum.FREELANCE]: "Freelance",
    [JobTypeEnum.TEMPORARY]: "Temporary",
    [JobTypeEnum.INTERNSHIP]: "Internship",
  };

  const jobTypeMap = new Map<JobTypeEnum, number>();
  jobTypes.forEach((jt: any) => {
    const jobTypeValue = jt.jobType as JobTypeEnum;
    if (jobTypeValue && Object.values(JobTypeEnum).includes(jobTypeValue)) {
      const currentCount = jobTypeMap.get(jobTypeValue) || 0;
      jobTypeMap.set(jobTypeValue, currentCount + parseInt(jt.count || 0));
    }
  });

  const normalizedJobTypes = Array.from(jobTypeMap.entries())
    .map(([value, count]) => ({ 
      value, 
      label: jobTypeLabels[value] || value, 
      count 
    }))
    .sort((a, b) => b.count - a.count);

  return {
    jobTypes: normalizedJobTypes,
    locations: locations.map((l: any) => ({
      value: l.location,
      label: l.location,
      count: parseInt(l.count) || 0,
    })),
  };
}


import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { Category } from "@/entities/Category";

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const categoryRepository = dataSource.getRepository(Category);

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
      .leftJoinAndSelect("job.category", "category")
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

    // Get total count before pagination
    const total = await query.getCount();
    
    // Apply pagination
    query = query.skip(offset).take(limit);

    const jobs = await query.getMany();
    
    console.log(`Found ${jobs.length} jobs for categoryId: ${categoryId || 'all'}, total: ${total}`);

    // Get unique categories for filtering (exclude expired jobs)
    const categories = await categoryRepository
      .createQueryBuilder("category")
      .innerJoin("category.jobs", "job")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now: new Date() })
      .andWhere(type ? "job.type = :type" : "1=1", type ? { type } : {})
      .select("category.id", "id")
      .addSelect("category.name", "name")
      .addSelect("category.slug", "slug")
      .distinct(true)
      .getRawMany();

    const categoryList = categories
      .map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: jobs,
      total,
      limit,
      offset,
      categories: categoryList,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}


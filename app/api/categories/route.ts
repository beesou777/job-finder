import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Category } from "@/entities/Category";
import { Job } from "@/entities/Job";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const categoryRepository = dataSource.getRepository(Category);

    const searchParams = request.nextUrl.searchParams;
    const popular = searchParams.get("popular") === "true"; // Get popular categories (with jobs)
    const limit = parseInt(searchParams.get("limit") || "20");

    let categories;

    if (popular) {
      // Get categories that have active jobs, ordered by job count
      const categoriesWithJobs = await categoryRepository
        .createQueryBuilder("category")
        .leftJoin("category.jobs", "job")
        .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now: new Date() })
        .select("category.id", "id")
        .addSelect("category.name", "name")
        .addSelect("category.slug", "slug")
        .addSelect("COUNT(job.id)", "jobCount")
        .groupBy("category.id")
        .having("COUNT(job.id) > 0")
        .orderBy("COUNT(job.id)", "DESC")
        .limit(limit)
        .getRawMany();

      categories = categoriesWithJobs.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        jobCount: parseInt(c.jobCount) || 0,
      }));

      // If no categories with jobs, show all categories
      if (categories.length === 0) {
        const allCategories = await categoryRepository.find({
          order: { name: "ASC" },
          take: limit,
        });
        categories = allCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          jobCount: 0,
        }));
      }
    } else {
      // Optimized: Get all categories with job counts in a single query
      const allCategoriesWithCounts = await categoryRepository
        .createQueryBuilder("category")
        .leftJoin("category.jobs", "job")
        .select("category.id", "id")
        .addSelect("category.name", "name")
        .addSelect("category.slug", "slug")
        .addSelect("COUNT(job.id)", "jobCount")
        .groupBy("category.id")
        .orderBy("category.name", "ASC")
        .limit(limit)
        .getRawMany();

      categories = allCategoriesWithCounts.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        jobCount: parseInt(c.jobCount) || 0,
      }));
    }

    const response = NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
    });

    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

    return response;
  } catch (error: any) {
    console.error("Error fetching categories:", error);
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
        error: "Failed to fetch categories",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
        type: error?.name,
      },
      { status: 500 }
    );
  }
}


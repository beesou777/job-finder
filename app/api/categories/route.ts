import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Category } from "@/entities/Category";
import { Job } from "@/entities/Job";

export const revalidate = 300; // Cache for 5 minutes

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
      // Get all categories
      const allCategories = await categoryRepository.find({
        order: { name: "ASC" },
        take: limit,
      });

      // Get job counts for each category
      categories = await Promise.all(
        allCategories.map(async (category) => {
          const jobCount = await dataSource.getRepository(Job).count({
            where: {
              categoryId: category.id,
            },
            // Don't filter by expiresAt here to show all categories
          });
          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            jobCount,
          };
        })
      );
    }

    const response = NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
    });

    // Add caching headers
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


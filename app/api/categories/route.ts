import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const popular = searchParams.get("popular") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    let categories;

    if (popular) {
      // Get categories that have active jobs, ordered by job count
      const now = new Date();
      const categoriesWithJobs = await prisma.category.findMany({
        where: {
          jobs: {
            some: {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: now } }
              ]
            }
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              jobs: {
                where: {
                  OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                  ]
                }
              }
            }
          }
        },
        orderBy: {
          jobs: {
            _count: 'desc'
          }
        },
        take: limit,
      });

      categories = categoriesWithJobs.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        jobCount: c._count.jobs,
      }));

      // If no categories with jobs, show all categories
      if (categories.length === 0) {
        const allCategories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
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
      // Get all categories with job counts
      const allCategories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        take: limit,
        include: {
          _count: {
            select: {
              jobs: true,
            }
          }
        }
      });

      categories = allCategories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        jobCount: category._count.jobs,
      }));
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

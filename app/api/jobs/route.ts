import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get("source");
    const type = searchParams.get("type") as "job" | "internship" | null;
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const now = new Date();
    
    // Build where clause
    const where: any = {
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    };

    if (source) {
      where.source = source;
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
      console.log(`Filtering by categoryId: ${categoryId}`);
    }

    // Full-text search
    if (search) {
      const searchConditions = {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { category: { name: { contains: search, mode: 'insensitive' as const } } }
        ]
      };
      
      where.AND = [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        },
        searchConditions
      ];
      delete where.OR; // Remove the original OR since we're using AND now
    }

    // Get total count
    const total = await prisma.job.count({ where });
    
    // Get jobs with pagination
    const jobs = await prisma.job.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        applyUrl: true,
        type: true,
        createdAt: true,
        expiresAt: true,
        salaryText: true,
        jobType: true,
        source: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });
    
    console.log(`Found ${jobs.length} jobs for categoryId: ${categoryId || 'all'}, total: ${total}`);

    // Get unique categories for filtering
    let categoryList: any[] = [];
    try {
      const categoryWhere: any = {
        jobs: {
          some: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } }
            ]
          }
        }
      };

      if (type) {
        categoryWhere.jobs.some.type = type;
      }

      const categories = await prisma.category.findMany({
        where: categoryWhere,
        select: {
          id: true,
          name: true,
          slug: true,
        },
        distinct: ['id'],
        orderBy: {
          name: 'asc',
        }
      });

      categoryList = categories;
    } catch (categoryError: any) {
      console.error("Error fetching categories (non-fatal):", categoryError?.message);
      categoryList = [];
    }

    const response = NextResponse.json({
      success: true,
      data: jobs.map(job => ({
        ...job,
        category: job.category || null,
      })),
      total,
      limit,
      offset,
      categories: categoryList,
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

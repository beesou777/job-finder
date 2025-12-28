import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Check database schema status
 * With Prisma, use migrations instead of synchronize
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if tables exist by trying to query them
    try {
      const jobCount = await prisma.job.count();
      const userCount = await prisma.user.count();
      const categoryCount = await prisma.category.count();
      
      return NextResponse.json({
        success: true,
        message: "Database schema is initialized",
        tables: {
          jobs: jobCount,
          user: userCount,
          categories: categoryCount,
        },
        note: "To create/update schema, run: npx prisma migrate dev (dev) or npx prisma migrate deploy (production)"
      });
    } catch (error: any) {
      // If tables don't exist, Prisma will throw an error
      return NextResponse.json({
        success: false,
        error: "Database schema is not initialized",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
        suggestion: "Run 'npx prisma migrate deploy' to initialize the database schema"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check database",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

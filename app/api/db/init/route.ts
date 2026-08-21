import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";

/**
 * Initialize database schema in production
 * This endpoint should be called once after deployment to create tables
 *
 * Security: Add authentication in production!
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check
    const authHeader = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();

    // Check if tables exist
    const queryRunner = dataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    const existingTableNames = tables.map((t) => t.name.toLowerCase());

    const requiredTables = ["jobs", "user", "category"];
    const missingTables = requiredTables.filter((req) => !existingTableNames.includes(req));

    if (missingTables.length > 0) {
      // Temporarily enable synchronize to create tables
      console.log("⚠️  Missing tables detected. Creating schema...");

      // Note: This requires recreating the DataSource with synchronize enabled
      // For production, it's better to use migrations
      return NextResponse.json({
        success: false,
        error: "Tables are missing. Please enable synchronize temporarily or run migrations.",
        missingTables,
        existingTables: existingTableNames,
        suggestion: "Set DATABASE_SYNC=true in environment variables temporarily, then redeploy",
      });
    }

    await queryRunner.release();

    return NextResponse.json({
      success: true,
      message: "Database schema is initialized",
      tables: existingTableNames,
    });
  } catch (error: any) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 },
    );
  }
}

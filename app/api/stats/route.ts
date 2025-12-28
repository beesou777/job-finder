import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const now = new Date();

    // Get counts by type
    const [jobsCount, internshipsCount] = await Promise.all([
      prisma.job.count({
        where: {
          type: 'job',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      }),
      prisma.job.count({
        where: {
          type: 'internship',
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      })
    ]);

    const total = jobsCount + internshipsCount;

    // Get source breakdown
    const bySourceRaw = await prisma.job.groupBy({
      by: ['source'],
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      _count: {
        id: true
      }
    });

    const bySource = bySourceRaw.map(item => ({
      source: item.source,
      count: item._count.id
    }));

    const response = NextResponse.json({
      success: true,
      data: {
        total,
        totalJobs: jobsCount,
        totalInternships: internshipsCount,
        bySource,
      },
    });

    // Add caching headers
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");

    return response;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

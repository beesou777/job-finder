import { NextResponse } from "next/server";
import { getStats } from "@/server/services/data-fetching";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getStats();
    const response = NextResponse.json({ success: true, data: stats });
    response.headers.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    return response;
  } catch (error: any) {
    console.error("Error fetching stats:", error?.message || error);
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/server/services/data-fetching";

export const dynamic = "force-dynamic";

function boundedInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const limit = boundedInt(params.get("limit"), 12, 1, 50);
    const offset = boundedInt(params.get("offset"), 0, 0, 10000);
    const result = await getJobs({
      jobType: params.get("jobType"),
      urgency: params.get("urgency"),
      type: params.get("type"),
      categoryId: params.get("category"),
      location: params.get("location"),
      search: params.get("search"),
      limit,
      offset,
    });

    const response = NextResponse.json({ success: true, data: result.jobs, total: result.total, limit, offset });
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
    return response;
  } catch (error: any) {
    console.error("Error fetching jobs:", error?.message || error);
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 });
  }
}
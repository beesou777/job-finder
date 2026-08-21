import { NextRequest, NextResponse } from "next/server";
import { searchAllJobs } from "@/server/services/job-search";

export const dynamic = "force-dynamic";

/**
 * Direct job search API - used when AI tool results don't render in chat.
 * Call this with the user's search query to get jobs as JSON.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("q") || searchParams.get("search") || "";
    const location = searchParams.get("location") || undefined;
    const jobType = searchParams.get("jobType") || undefined;
    const type = (searchParams.get("type") as "job" | "internship" | "all") || "all";

    if (!search.trim()) {
      return NextResponse.json({ jobs: [], error: "Search query required" }, { status: 400 });
    }

    const jobs = await searchAllJobs({
      search: search.trim(),
      location,
      jobType,
      type,
      limit: 10,
    });

    const response = NextResponse.json({
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        applyUrl: j.applyUrl,
        source: j.source,
        salaryText: j.salaryText,
        description: j.description ? j.description.slice(0, 300) : null,
      })),
    });
    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return response;
  } catch (error: unknown) {
    console.error("[chat/search] Error:", error);
    return NextResponse.json({ jobs: [], error: "Search failed" }, { status: 500 });
  }
}

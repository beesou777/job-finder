import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const parsedLimit = Number.parseInt(params.get("limit") || "50", 10);
    const parsedOffset = Number.parseInt(params.get("offset") || "0", 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(50, Math.max(1, parsedLimit)) : 50;
    const offset = Number.isFinite(parsedOffset) ? Math.min(10000, Math.max(0, parsedOffset)) : 0;
    const source = params.get("source")?.slice(0, 50);
    const type = params.get("type");
    const now = new Date();

    const repository = (await getDataSource()).getRepository(Job);
    let query = repository.createQueryBuilder("job")
      .leftJoin("job.category", "category")
      .select([
        "job.id", "job.title", "job.company", "job.location", "job.applyUrl",
        "job.type", "job.postedAt", "job.expiresAt", "job.salaryText",
        "job.jobType", "job.source", "job.lastVerifiedAt",
        "category.id", "category.name", "category.slug",
      ])
      .where("job.isActive = true")
      .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

    if (source) query = query.andWhere("job.source = :source", { source });
    if (type === "job" || type === "internship") query = query.andWhere("job.type = :type", { type });

    const rows = await query.orderBy("job.postedAt", "DESC", "NULLS LAST").skip(offset).take(limit + 1).getMany();
    const hasMore = rows.length > limit;
    const jobs = rows.slice(0, limit);
    const response = NextResponse.json({ success: true, count: jobs.length, limit, offset, hasMore, data: jobs });
    response.headers.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    return response;
  } catch (error: any) {
    console.error("Error fetching job data:", error?.message || error);
    return NextResponse.json({ success: false, error: "Failed to fetch job data" }, { status: 500 });
  }
}

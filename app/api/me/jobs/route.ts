import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/services/auth";
import { getDataSource } from "@/lib/db";
import { User } from "@/server/db/entities/User";
import { searchAllJobs } from "@/server/services/job-search";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get("pageSize") || 10)));
  const user = await (
    await getDataSource()
  )
    .getRepository(User)
    .findOneBy({ id: Number(session.user.id) });
  if (!user) return NextResponse.json({ jobs: [] });
  const keywords = [user.preferredRole, ...(user.preferredKeywords || [])].filter(Boolean);
  const selectedJobType =
    user.preferredJobType && user.preferredJobType !== "Any" ? user.preferredJobType : undefined;
  const selectedWorkMode =
    user.preferredWorkMode && user.preferredWorkMode !== "Any" ? user.preferredWorkMode : undefined;
  const jobType = selectedJobType || selectedWorkMode;
  const allMatches = await searchAllJobs({
    search: keywords.join("|") || undefined,
    matchAny: true,
    location: user.preferredLocation || undefined,
    jobType,
    type: "all",
    limit: Math.min(100, Math.max(pageSize * 3, 30)),
    offset: 0,
  });
  const start = (page - 1) * pageSize;
  const jobs = allMatches.slice(start, start + pageSize);
  const hasNextPage = start + pageSize < allMatches.length;
  return NextResponse.json({
    jobs: jobs.slice(0, pageSize),
    page,
    pageSize,
    hasNextPage,
    total: allMatches.length,
  });
}

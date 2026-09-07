import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/services/auth";
import { getDataSource } from "@/lib/db";
import { User } from "@/server/db/entities/User";
import { searchAllJobs } from "@/server/services/job-search";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type JobsResponse = {
  jobs: Awaited<ReturnType<typeof searchAllJobs>>;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  total: number;
  cv?: {
    url: string | null;
    filename: string | null;
    role: string | null;
    skills: string[];
  } | null;
  matchedKeywords?: string[];
};

type CacheEntry = { expiresAt: number; value: JobsResponse };
const CACHE_TTL_MS = 30_000;
const MAX_CACHE_ENTRIES = 500;
const responseCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<JobsResponse>>();

function cacheKey(
  userId: number,
  page: number,
  pageSize: number,
  source: string,
  preferences: Record<string, unknown>,
) {
  return JSON.stringify({ userId, page, pageSize, source, preferences });
}

function remember(key: string, value: JobsResponse) {
  responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  while (responseCache.size > MAX_CACHE_ENTRIES) {
    responseCache.delete(responseCache.keys().next().value as string);
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const pageSize = Math.min(20, Math.max(1, Number(url.searchParams.get("pageSize") || 10)));
  const matchMode = url.searchParams.get("mode") || "all"; // "cv" | "preferences" | "all"

  const user = await (await getDataSource()).getRepository(User).findOne({
    select: [
      "id",
      "preferredRole",
      "preferredKeywords",
      "preferredLocation",
      "preferredJobType",
      "preferredWorkMode",
      "cvUrl",
      "cvFilename",
      "cvRole",
      "cvSkills",
    ],
    where: { id: Number(session.user.id) },
  });
  if (!user) return NextResponse.json({ jobs: [] });
  const preferences = {
    preferredRole: user.preferredRole,
    preferredKeywords: user.preferredKeywords,
    preferredLocation: user.preferredLocation,
    preferredJobType: user.preferredJobType,
    preferredWorkMode: user.preferredWorkMode,
    cvRole: user.cvRole,
    cvSkills: user.cvSkills,
  };
  const key = cacheKey(user.id, page, pageSize, matchMode, preferences);
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.value);
  if (cached) responseCache.delete(key);

  const existing = inFlight.get(key);
  if (existing) return NextResponse.json(await existing);

  const responsePromise = (async () => {
    const cvKeywords = [user.cvRole, ...(user.cvSkills || [])].filter(Boolean) as string[];
    const prefKeywords = [user.preferredRole, ...(user.preferredKeywords || [])].filter(
      Boolean,
    ) as string[];

    const rawKeywords =
      matchMode === "cv" && cvKeywords.length > 0
        ? cvKeywords
        : matchMode === "preferences" && prefKeywords.length > 0
          ? prefKeywords
          : [...cvKeywords, ...prefKeywords];

    // Clean keywords: split comma-separated strings (e.g. "frontend, fullstack, developer") into individual search terms
    const cleanKeywords = Array.from(
      new Set(
        rawKeywords
          .flatMap((k) => (typeof k === "string" ? k.split(/[,;/]+/) : []))
          .map((k) => k.trim())
          .filter(Boolean),
      ),
    );

    const selectedJobType =
      user.preferredJobType && user.preferredJobType !== "Any" ? user.preferredJobType : undefined;
    const selectedWorkMode =
      user.preferredWorkMode && user.preferredWorkMode !== "Any"
        ? user.preferredWorkMode
        : undefined;
    const jobType = selectedJobType || selectedWorkMode;
    const start = (page - 1) * pageSize;

    const searchParams = {
      search: cleanKeywords.join("|") || undefined,
      matchAny: true,
      location: user.preferredLocation || undefined,
      jobType,
      type: "all" as const,
    };

    // Primary search with all user criteria
    let jobs = await searchAllJobs({
      ...searchParams,
      limit: pageSize + 1,
      offset: start,
    });

    // Fallback Tier 1: If 0 matches and user specified a location, try without location constraint
    if (jobs.length === 0 && searchParams.location) {
      jobs = await searchAllJobs({
        ...searchParams,
        location: undefined,
        limit: pageSize + 1,
        offset: start,
      });
    }

    // Fallback Tier 2: If still 0 matches and jobType was set, try without jobType constraint
    if (jobs.length === 0 && searchParams.jobType) {
      jobs = await searchAllJobs({
        ...searchParams,
        location: undefined,
        jobType: undefined,
        limit: pageSize + 1,
        offset: start,
      });
    }

    // Fallback Tier 3: If still 0 matches, search with candidate's primary role title
    if (jobs.length === 0 && (user.cvRole || user.preferredRole)) {
      const primaryRole = (user.cvRole || user.preferredRole || "").split(/[,;/]+/)[0]?.trim();
      if (primaryRole) {
        jobs = await searchAllJobs({
          search: primaryRole,
          matchAny: true,
          limit: pageSize + 1,
          offset: start,
        });
      }
    }

    // Fallback Tier 4: Return latest vacancies so user never sees an empty screen
    if (jobs.length === 0) {
      jobs = await searchAllJobs({
        limit: pageSize + 1,
        offset: start,
      });
    }

    const hasNextPage = jobs.length > pageSize;
    const visibleJobs = jobs.slice(0, pageSize);
    const result: JobsResponse = {
      jobs: visibleJobs,
      page,
      pageSize,
      hasNextPage,
      total: start + visibleJobs.length + (hasNextPage ? 1 : 0),
      cv: user.cvUrl
        ? {
            url: user.cvUrl,
            filename: user.cvFilename,
            role: user.cvRole,
            skills: user.cvSkills || [],
          }
        : null,
      matchedKeywords: cleanKeywords,
    };
    remember(key, result);
    return result;
  })();

  inFlight.set(key, responsePromise);
  try {
    return NextResponse.json(await responsePromise);
  } finally {
    inFlight.delete(key);
  }
}

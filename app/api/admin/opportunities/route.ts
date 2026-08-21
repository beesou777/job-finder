import "reflect-metadata";
import { NextRequest, NextResponse } from "next/server";
import { findOpportunityGaps } from "@/app/services/OpportunityMatchingService";
import {
  scoreAllOpportunities,
  filterOpportunities,
  OpportunityScore,
} from "@/app/services/OpportunityScoringService";
import { MatchStatus } from "@/app/services/OpportunityMatchingService";
import { OpportunityLevel } from "@/app/services/OpportunityScoringService";

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;

export const dynamic = "force-dynamic";

interface OpportunitiesResponse {
  success: boolean;
  data: OpportunityScore[];
  total: number;
  filters?: {
    status?: MatchStatus;
    level?: OpportunityLevel | OpportunityLevel[];
    minScore?: number;
  };
  meta: {
    notOnPlatform: number;
    alreadyOnPlatform: number;
    veryHigh: number;
    high: number;
    medium: number;
    low: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const statusFilter = searchParams.get("status") as MatchStatus | null;
    const levelFilter = searchParams.get("level") as OpportunityLevel | null;
    const minScore = searchParams.get("minScore")
      ? parseInt(searchParams.get("minScore")!)
      : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    // Find opportunity gaps
    const matchResults = await findOpportunityGaps();

    // Score all opportunities
    let opportunities = await scoreAllOpportunities(matchResults);

    // Apply filters
    if (statusFilter || levelFilter || minScore !== undefined) {
      opportunities = filterOpportunities(opportunities, {
        status: statusFilter || undefined,
        level: levelFilter || undefined,
        minScore,
      });
    }

    // Limit results
    const limitedOpportunities = opportunities.slice(0, limit);

    // Serialize dates to ISO strings for JSON response
    const serializedOpportunities = limitedOpportunities.map((opp) => ({
      ...opp,
      lastJobDate: opp.lastJobDate ? opp.lastJobDate.toISOString() : null,
      linkedInJobs: opp.linkedInJobs?.map((job) => ({
        ...job,
        job_date: job.job_date
          ? job.job_date instanceof Date
            ? job.job_date.toISOString()
            : new Date(job.job_date).toISOString()
          : null,
      })),
    }));

    // Calculate metadata
    const meta = {
      notOnPlatform: opportunities.filter((o) => o.status === MatchStatus.NOT_ON_PLATFORM).length,
      alreadyOnPlatform: opportunities.filter((o) => o.status === MatchStatus.ALREADY_ON_PLATFORM)
        .length,
      veryHigh: opportunities.filter((o) => o.level === "VERY_HIGH").length,
      high: opportunities.filter((o) => o.level === "HIGH").length,
      medium: opportunities.filter((o) => o.level === "MEDIUM").length,
      low: opportunities.filter((o) => o.level === "LOW").length,
    };

    const response: OpportunitiesResponse = {
      success: true,
      data: serializedOpportunities as any, // Type assertion needed due to date serialization
      total: opportunities.length,
      filters: {
        status: statusFilter || undefined,
        level: levelFilter || undefined,
        minScore,
      },
      meta,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch opportunities",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 },
    );
  }
}

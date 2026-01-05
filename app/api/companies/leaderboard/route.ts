import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { CompanyEnrichment, HiringIntentLevel } from "@/entities/CompanyEnrichment";

export const dynamic = "force-dynamic";

/**
 * GET /api/companies/leaderboard
 * Get high hiring intent companies leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "intent"; // intent, jobs7d, jobs30d, contacts
    const limit = parseInt(searchParams.get("limit") || "20");
    const minLevel = searchParams.get("minLevel") as HiringIntentLevel | null;
    
    let query = enrichmentRepository
      .createQueryBuilder("enrichment")
      .leftJoinAndSelect("enrichment.company", "company")
      .where("1=1");
    
    if (minLevel) {
      const levels = [HiringIntentLevel.LOW, HiringIntentLevel.MEDIUM, HiringIntentLevel.HIGH, HiringIntentLevel.VERY_HIGH];
      const minIndex = levels.indexOf(minLevel);
      if (minIndex >= 0) {
        query = query.andWhere(`enrichment.intentLevel IN ('${levels.slice(minIndex).join("','")}')`);
      }
    }
    
    switch (type) {
      case "intent":
        query = query
          .orderBy("enrichment.intentScore", "DESC")
          .addOrderBy("enrichment.jobsLast7Days", "DESC");
        break;
      case "jobs7d":
        query = query
          .orderBy("enrichment.jobsLast7Days", "DESC")
          .addOrderBy("enrichment.intentScore", "DESC");
        break;
      case "jobs30d":
        query = query
          .orderBy("enrichment.jobsLast30Days", "DESC")
          .addOrderBy("enrichment.intentScore", "DESC");
        break;
      case "contacts":
        query = query
          .where("(enrichment.email IS NOT NULL OR enrichment.phoneNumber IS NOT NULL)")
          .orderBy("enrichment.intentScore", "DESC");
        break;
      default:
        query = query.orderBy("enrichment.intentScore", "DESC");
    }
    
    query = query.take(limit);
    
    const enrichments = await query.getMany();
    
    return NextResponse.json({
      success: true,
      type,
      data: enrichments.map((e, index) => ({
        rank: index + 1,
        id: e.id,
        companyId: e.companyId,
        companyName: e.company.name,
        domain: e.company.domain,
        email: e.email,
        phoneNumber: e.phoneNumber,
        intentScore: e.intentScore,
        intentLevel: e.intentLevel,
        jobsLast7Days: e.jobsLast7Days,
        jobsLast30Days: e.jobsLast30Days,
        hasCareerPage: e.hasCareerPage,
        careerPageUrl: e.careerPageUrl,
        isPitchTarget: e.isPitchTarget,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


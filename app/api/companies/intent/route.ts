import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { CompanyEnrichment, HiringIntentLevel } from "@/entities/CompanyEnrichment";
import { updateIntentScore } from "@/app/services/HiringIntentScoringService";

export const dynamic = "force-dynamic";

/**
 * GET /api/companies/intent
 * Get companies with hiring intent filters
 */
export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
    
    const searchParams = request.nextUrl.searchParams;
    const intentLevel = searchParams.get("level") as HiringIntentLevel | null;
    const minScore = searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!) : null;
    const maxScore = searchParams.get("maxScore") ? parseInt(searchParams.get("maxScore")!) : null;
    const hasContact = searchParams.get("hasContact") === "true";
    const isPitchTarget = searchParams.get("isPitchTarget") === "true";
    const hasCareerPage = searchParams.get("hasCareerPage") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "intentScore"; // intentScore, jobsLast7Days, jobsLast30Days
    const sortOrder = searchParams.get("sortOrder") || "DESC";
    
    let query = enrichmentRepository
      .createQueryBuilder("enrichment")
      .leftJoinAndSelect("enrichment.company", "company")
      .where("1=1");
    
    if (intentLevel) {
      query = query.andWhere("enrichment.intentLevel = :intentLevel", { intentLevel });
    }
    
    if (minScore !== null) {
      query = query.andWhere("enrichment.intentScore >= :minScore", { minScore });
    }
    
    if (maxScore !== null) {
      query = query.andWhere("enrichment.intentScore <= :maxScore", { maxScore });
    }
    
    if (hasContact) {
      query = query.andWhere("(enrichment.email IS NOT NULL OR enrichment.phoneNumber IS NOT NULL)");
    }
    
    if (isPitchTarget) {
      query = query.andWhere("enrichment.isPitchTarget = :isPitchTarget", { isPitchTarget: true });
    }
    
    if (hasCareerPage) {
      query = query.andWhere("enrichment.hasCareerPage = :hasCareerPage", { hasCareerPage: true });
    }
    
    // Sort
    const validSortFields = ["intentScore", "jobsLast7Days", "jobsLast30Days", "createdAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "intentScore";
    query = query.orderBy(`enrichment.${sortField}`, sortOrder === "ASC" ? "ASC" : "DESC");
    
    // Pagination
    query = query.skip(offset).take(limit);
    
    const [enrichments, total] = await query.getManyAndCount();
    
    return NextResponse.json({
      success: true,
      data: enrichments.map((e) => ({
        id: e.id,
        companyId: e.companyId,
        companyName: e.company.name,
        domain: e.company.domain,
        email: e.email,
        phoneNumber: e.phoneNumber,
        website: e.website,
        careerPageUrl: e.careerPageUrl,
        intentScore: e.intentScore,
        intentLevel: e.intentLevel,
        jobsLast7Days: e.jobsLast7Days,
        jobsLast30Days: e.jobsLast30Days,
        uniqueJobCategories: e.uniqueJobCategories,
        hasCareerPage: e.hasCareerPage,
        keywordMatches: e.keywordMatches,
        externalStatus: e.externalStatus,
        matchConfidence: e.matchConfidence,
        isPitchTarget: e.isPitchTarget,
        isNewLead: e.isNewLead,
        salesNotes: e.salesNotes,
        lastVerifiedAt: e.lastVerifiedAt,
        updatedAt: e.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching companies with intent:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/companies/intent
 * Recalculate intent scores (for all or specific company)
 */
export async function PUT(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
    
    const body = await request.json();
    const companyId = body.companyId;
    
    if (companyId) {
      // Recalculate for specific company
      const enrichment = await enrichmentRepository.findOne({
        where: { companyId },
        relations: ["company"],
      });
      
      if (!enrichment) {
        return NextResponse.json(
          { error: "Company enrichment not found" },
          { status: 404 }
        );
      }
      
      const { enrichment: updated } = await updateIntentScore(enrichment, "manual_recalculate");
      
      return NextResponse.json({
        success: true,
        enrichment: {
          id: updated.id,
          companyId: updated.companyId,
          intentScore: updated.intentScore,
          intentLevel: updated.intentLevel,
          jobsLast7Days: updated.jobsLast7Days,
          jobsLast30Days: updated.jobsLast30Days,
        },
      });
    } else {
      // Recalculate all (this could be heavy - consider background job)
      const { recalculateAllIntentScores } = await import("@/app/services/CompanyEnrichmentService");
      const result = await recalculateAllIntentScores();
      
      return NextResponse.json({
        success: true,
        result,
      });
    }
  } catch (error: any) {
    console.error("Error recalculating intent scores:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


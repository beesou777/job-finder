import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { CompanyEnrichment } from "@/entities/CompanyEnrichment";
import { HiringIntentScoreHistory } from "@/entities/HiringIntentScoreHistory";

export const dynamic = "force-dynamic";

/**
 * GET /api/companies/[companyId]
 * Get company enrichment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const dataSource = await getDataSource();
    const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
    const historyRepository = dataSource.getRepository(HiringIntentScoreHistory);

    const enrichment = await enrichmentRepository.findOne({
      where: { companyId: params.companyId },
      relations: ["company"],
    });

    let scoreHistory: Array<{ score: number; level: string; signalBreakdown?: unknown; trigger?: string; recordedAt: Date }> = [];
    if (enrichment) {
      const history = await historyRepository.find({
        where: { enrichmentId: enrichment.id },
        order: { recordedAt: "DESC" },
      });
      scoreHistory = history.map((h) => ({
        score: h.score,
        level: h.level,
        signalBreakdown: h.signalBreakdown,
        trigger: h.trigger,
        recordedAt: h.recordedAt,
      }));
    }
    
    if (!enrichment) {
      return NextResponse.json(
        { error: "Company enrichment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: enrichment.id,
        companyId: enrichment.companyId,
        company: {
          id: enrichment.company.id,
          name: enrichment.company.name,
          domain: enrichment.company.domain,
          aliases: enrichment.company.aliases,
        },
        contact: {
          email: enrichment.email,
          phoneNumber: enrichment.phoneNumber,
          website: enrichment.website,
          careerPageUrl: enrichment.careerPageUrl,
          externalProfileUrl: enrichment.externalProfileUrl,
        },
        intent: {
          score: enrichment.intentScore,
          level: enrichment.intentLevel,
          jobsLast7Days: enrichment.jobsLast7Days,
          jobsLast30Days: enrichment.jobsLast30Days,
          uniqueJobCategories: enrichment.uniqueJobCategories,
        },
        signals: {
          hasCareerPage: enrichment.hasCareerPage,
          keywordMatches: enrichment.keywordMatches,
          externalStatus: enrichment.externalStatus,
        },
        matching: {
          confidence: enrichment.matchConfidence,
          similarity: enrichment.matchSimilarity,
          matchedBy: enrichment.matchedBy,
          source: enrichment.source,
          trustScore: enrichment.trustScore,
        },
        sales: {
          isPitchTarget: enrichment.isPitchTarget,
          isNewLead: enrichment.isNewLead,
          salesNotes: enrichment.salesNotes,
        },
        metadata: {
          lastVerifiedAt: enrichment.lastVerifiedAt,
          lastCheckedAt: enrichment.lastCheckedAt,
          createdAt: enrichment.createdAt,
          updatedAt: enrichment.updatedAt,
        },
        scoreHistory,
      },
    });
  } catch (error: any) {
    console.error("Error fetching company enrichment:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/companies/[companyId]
 * Update company enrichment (e.g., sales notes, pitch target flag)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const dataSource = await getDataSource();
    const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
    
    const body = await request.json();
    
    const enrichment = await enrichmentRepository.findOne({
      where: { companyId: params.companyId },
    });
    
    if (!enrichment) {
      return NextResponse.json(
        { error: "Company enrichment not found" },
        { status: 404 }
      );
    }
    
    // Update allowed fields
    if (body.salesNotes !== undefined) {
      enrichment.salesNotes = body.salesNotes;
    }
    
    if (body.isPitchTarget !== undefined) {
      enrichment.isPitchTarget = body.isPitchTarget;
    }
    
    if (body.email !== undefined) {
      enrichment.email = body.email;
    }
    
    if (body.phoneNumber !== undefined) {
      enrichment.phoneNumber = body.phoneNumber;
    }
    
    await enrichmentRepository.save(enrichment);
    
    return NextResponse.json({
      success: true,
      data: {
        id: enrichment.id,
        companyId: enrichment.companyId,
        salesNotes: enrichment.salesNotes,
        isPitchTarget: enrichment.isPitchTarget,
        email: enrichment.email,
        phoneNumber: enrichment.phoneNumber,
      },
    });
  } catch (error: any) {
    console.error("Error updating company enrichment:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


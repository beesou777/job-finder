import { NextRequest, NextResponse } from "next/server";
import { batchEnrichCompanies, enrichCompany } from "@/app/services/CompanyEnrichmentService";
import { ExternalCompanyData } from "@/app/services/CompanyMatchingService";
import { ExternalSource } from "@/entities/CompanyEnrichment";

export const dynamic = "force-dynamic";

/**
 * POST /api/companies/enrich
 * Enrich a single company or batch of companies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a single company or batch
    if (body.name) {
      // Single company
      const externalData: ExternalCompanyData = {
        name: body.name,
        website: body.website || null,
        email: body.email || null,
        phoneNumber: body.phoneNumber || null,
        careerPageUrl: body.careerPageUrl || null,
        externalProfileUrl: body.externalProfileUrl || null,
        status: body.status || null,
        keywordMatches: body.keywordMatches || [],
        source: body.source ? (body.source as ExternalSource) : ExternalSource.MANUAL,
      };
      
      const enrichment = await enrichCompany(externalData, externalData.source || ExternalSource.MANUAL);
      
      return NextResponse.json({
        success: true,
        enrichment: {
          id: enrichment.id,
          companyId: enrichment.companyId,
          companyName: enrichment.company.name,
          intentScore: enrichment.intentScore,
          intentLevel: enrichment.intentLevel,
          matchConfidence: enrichment.matchConfidence,
          matchSimilarity: enrichment.matchSimilarity,
        },
      });
    } else if (Array.isArray(body.companies) || Array.isArray(body)) {
      // Batch companies
      const companies = Array.isArray(body.companies) ? body.companies : body;
      const source = (body.source as ExternalSource) || ExternalSource.MANUAL;
      
      const externalDataArray: ExternalCompanyData[] = companies.map((c: any) => ({
        name: c.name || c.company_name,
        website: c.website || c.websitelink || null,
        email: c.email || null,
        phoneNumber: c.phoneNumber || c.mobile_number || null,
        careerPageUrl: c.careerPageUrl || null,
        externalProfileUrl: c.externalProfileUrl || c.techbehemothsUrl || null,
        status: c.status || null,
        keywordMatches: c.keywordMatches || [],
        source: source,
      }));
      
      const result = await batchEnrichCompanies(externalDataArray, source);
      
      return NextResponse.json({
        success: true,
        result,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request body. Expected 'name' (single) or array of companies (batch)" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error enriching company:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


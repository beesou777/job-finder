import { getDataSource } from "@/lib/db";
import { CanonicalCompany } from "@/server/db/entities/CanonicalCompany";
import { CompanyEnrichment, ExternalSource, MatchConfidence } from "@/server/db/entities/CompanyEnrichment";
import { matchCompany, findOrCreateCompany, ExternalCompanyData } from "./CompanyMatchingService";
import { updateIntentScore } from "./HiringIntentScoringService";

/**
 * Enrich a company with external data
 */
export async function enrichCompany(
  externalData: ExternalCompanyData,
  source: ExternalSource = ExternalSource.MANUAL
): Promise<CompanyEnrichment> {
  const dataSource = await getDataSource();
  const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
  
  // Match company
  const matchResult = await matchCompany(externalData);
  
  // Find or create CanonicalCompany
  const company = await findOrCreateCompany(externalData, matchResult);
  
  // Check if enrichment already exists
  let enrichment = await enrichmentRepository.findOne({
    where: { companyId: company.id },
    relations: ["company"],
  });
  
  // Prepare enrichment data (domain extraction is handled in matchCompany)
  
  const hasCareerPage = !!externalData.careerPageUrl && externalData.careerPageUrl.trim() !== "";
  
  if (enrichment) {
    // Update existing enrichment (idempotent - safe to re-run)
    enrichment.email = externalData.email || enrichment.email;
    enrichment.phoneNumber = externalData.phoneNumber || enrichment.phoneNumber;
    enrichment.website = externalData.website || enrichment.website;
    enrichment.careerPageUrl = externalData.careerPageUrl || enrichment.careerPageUrl;
    enrichment.externalProfileUrl = externalData.externalProfileUrl || enrichment.externalProfileUrl;
    enrichment.hasCareerPage = hasCareerPage;
    enrichment.keywordMatches = externalData.keywordMatches || enrichment.keywordMatches || [];
    enrichment.externalStatus = externalData.status || enrichment.externalStatus;
    enrichment.matchConfidence = matchResult.confidence;
    enrichment.matchSimilarity = matchResult.similarity;
    enrichment.matchedBy = matchResult.matchedBy;
    enrichment.source = source;
    enrichment.isNewLead = matchResult.shouldCreateNew;
    enrichment.lastVerifiedAt = new Date();
  } else {
    // Create new enrichment
    enrichment = enrichmentRepository.create({
      companyId: company.id,
      email: externalData.email || null,
      phoneNumber: externalData.phoneNumber || null,
      website: externalData.website || null,
      careerPageUrl: externalData.careerPageUrl || null,
      externalProfileUrl: externalData.externalProfileUrl || null,
      hasCareerPage: hasCareerPage,
      keywordMatches: externalData.keywordMatches || [],
      externalStatus: externalData.status || null,
      matchConfidence: matchResult.confidence,
      matchSimilarity: matchResult.similarity,
      matchedBy: matchResult.matchedBy,
      source: source,
      trustScore: 1.0, // Default trust score
      isNewLead: matchResult.shouldCreateNew,
      lastVerifiedAt: new Date(),
    } as any) as unknown as CompanyEnrichment;
    
    enrichment = await enrichmentRepository.save(enrichment);
  }
  
  // Load company relation if not already loaded (needed for scoring)
  if (!enrichment.company) {
    const { CanonicalCompany } = await import("@/server/db/entities/CanonicalCompany");
    const companyRepository = dataSource.getRepository(CanonicalCompany);
    enrichment.company = await companyRepository.findOne({ where: { id: company.id } }) || company;
  }
  
  // Calculate and update intent score
  const { enrichment: updatedEnrichment } = await updateIntentScore(
    enrichment,
    `enrichment_${source}`
  );
  
  return updatedEnrichment;
}

/**
 * Batch enrich companies from external data array
 */
export interface EnrichmentResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ company: string; error: string }>;
}

export async function batchEnrichCompanies(
  externalDataArray: ExternalCompanyData[],
  source: ExternalSource = ExternalSource.MANUAL
): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };
  
  for (const externalData of externalDataArray) {
    try {
      if (!externalData.name || externalData.name.trim() === "") {
        result.skipped++;
        continue;
      }
      
      await enrichCompany(externalData, source);
      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        company: externalData.name,
        error: error?.message || "Unknown error",
      });
      console.error(`Error enriching company ${externalData.name}:`, error);
    }
  }
  
  return result;
}

/**
 * Recalculate intent scores for all enrichments
 */
export async function recalculateAllIntentScores(): Promise<{
  updated: number;
  errors: number;
}> {
  const dataSource = await getDataSource();
  const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
  
  const enrichments = await enrichmentRepository.find({
    relations: ["company"],
  });
  
  let updated = 0;
  let errors = 0;
  
  for (const enrichment of enrichments) {
    try {
      await updateIntentScore(enrichment, "bulk_recalculate");
      updated++;
    } catch (error) {
      errors++;
      console.error(`Error updating score for enrichment ${enrichment.id}:`, error);
    }
  }
  
  return { updated, errors };
}


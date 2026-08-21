/**
 * Service to update company enrichments when jobs are scraped
 *
 * This service:
 * 1. Links scraped jobs to enriched companies
 * 2. Updates job activity signals (jobsLast7Days, jobsLast30Days, etc.)
 * 3. Triggers hiring intent score recalculation
 */

import { getDataSource } from "@/lib/db";
import { Job } from "@/server/db/entities/Job";
import { CompanyEnrichment } from "@/server/db/entities/CompanyEnrichment";
import { updateIntentScore } from "./HiringIntentScoringService";

/**
 * Update company enrichments after jobs are scraped
 *
 * This should be called after a scraping run completes
 * to update hiring intent scores based on new job postings
 */
export async function updateEnrichmentsAfterScraping(): Promise<{
  companiesUpdated: number;
  errors: number;
}> {
  const dataSource = await getDataSource();
  const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);

  // Get all enrichments
  const enrichments = await enrichmentRepository.find({
    relations: ["company"],
  });

  let companiesUpdated = 0;
  let errors = 0;

  for (const enrichment of enrichments) {
    try {
      // Recalculate intent score (which also updates job activity signals)
      await updateIntentScore(enrichment, "job_scraping");
      companiesUpdated++;
    } catch (error) {
      errors++;
      console.error(`Error updating enrichment for ${enrichment.company?.name}:`, error);
    }
  }

  return { companiesUpdated, errors };
}

/**
 * Update enrichment for a specific company after jobs are scraped
 *
 * This can be called incrementally during scraping for better performance
 */
export async function updateEnrichmentForCompany(companyName: string): Promise<void> {
  const dataSource = await getDataSource();
  const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
  const { CanonicalCompany } = await import("@/server/db/entities/CanonicalCompany");
  const companyRepository = dataSource.getRepository(CanonicalCompany);

  // Find canonical company by name
  const company = await companyRepository.findOne({
    where: { name: companyName },
  });

  if (!company) {
    // Company not in canonical_companies yet - skip
    return;
  }

  // Find enrichment for this company
  const enrichment = await enrichmentRepository.findOne({
    where: { companyId: company.id },
    relations: ["company"],
  });

  if (!enrichment) {
    // No enrichment exists - skip (we only update existing enrichments)
    return;
  }

  // Update intent score (which recalculates job activity signals)
  await updateIntentScore(enrichment, "job_scraping_incremental");
}

/**
 * Batch update enrichments for multiple companies
 *
 * More efficient than calling updateEnrichmentForCompany multiple times
 */
export async function batchUpdateEnrichmentsForCompanies(companyNames: string[]): Promise<{
  updated: number;
  skipped: number;
  errors: number;
}> {
  const dataSource = await getDataSource();
  const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
  const { CanonicalCompany } = await import("@/server/db/entities/CanonicalCompany");
  const companyRepository = dataSource.getRepository(CanonicalCompany);

  // Get unique company names
  const uniqueNames = [...new Set(companyNames.map((n) => n.trim()))];

  // Find all matching canonical companies
  const companies = await companyRepository.find({
    where: uniqueNames.map((name) => ({ name })),
  });

  const companyMap = new Map(companies.map((c) => [c.name.toLowerCase(), c]));

  // Find enrichments for these companies
  const companyIds = companies.map((c) => c.id);
  const enrichments = await enrichmentRepository.find({
    where: companyIds.map((id) => ({ companyId: id })),
    relations: ["company"],
  });

  const enrichmentMap = new Map(enrichments.map((e) => [e.companyId, e]));

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of companies) {
    const enrichment = enrichmentMap.get(company.id);
    if (!enrichment) {
      skipped++;
      continue;
    }

    try {
      await updateIntentScore(enrichment, "job_scraping_batch");
      updated++;
    } catch (error) {
      errors++;
      console.error(`Error updating enrichment for ${company.name}:`, error);
    }
  }

  return { updated, skipped, errors };
}

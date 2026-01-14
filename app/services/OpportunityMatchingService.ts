/**
 * Opportunity Matching Service
 * Matches LinkedIn companies against platform jobs to identify opportunities
 */

import { getDataSource } from "@/lib/db";
import { LinkedInJob } from "@/entities/LinkedInJob";
import { Job } from "@/entities/Job";
import {
  normalizeCompanyName,
  extractDomain,
  NormalizedCompany,
  normalizeLinkedInCompany,
} from "./CompanyNormalizationService";

export enum MatchStatus {
  ALREADY_ON_PLATFORM = "ALREADY_ON_PLATFORM",
  NOT_ON_PLATFORM = "NOT_ON_PLATFORM",
}

export interface CompanyMatchResult {
  company: string;
  normalizedName: string;
  domain: string | null;
  status: MatchStatus;
  matchedPlatformJobs: Array<{
    id: string;
    title: string;
    source: string;
  }>;
  linkedInJobs: Array<{
    id: number;
    job_id: string;
    title: string;
    job_date: Date | null;
    place: string | null;
    job_link: string | null;
  }>;
}

/**
 * Match a normalized company against platform jobs
 */
async function matchCompanyAgainstPlatform(
  normalized: NormalizedCompany,
  platformJobs: Job[]
): Promise<{
  matched: boolean;
  matchedJobs: Array<{ id: string; title: string; source: string }>;
}> {
  const matchedJobs: Array<{ id: string; title: string; source: string }> = [];

  for (const job of platformJobs) {
    const jobNormalizedName = normalizeCompanyName(job.company);
    
    // Strategy 1: Exact normalized name match
    if (jobNormalizedName === normalized.normalizedName && normalized.normalizedName !== "") {
      matchedJobs.push({
        id: job.id,
        title: job.title,
        source: job.source,
      });
      continue;
    }
    
    // Strategy 2: Domain match (if we have domain from LinkedIn)
    if (normalized.domain) {
      // Platform jobs don't have company domains directly, but we could check
      // if we add domain extraction from applyUrl in the future
    }
    
    // Strategy 3: Fuzzy matching (high similarity threshold)
    if (normalized.normalizedName && jobNormalizedName) {
      const similarity = calculateSimilarity(normalized.normalizedName, jobNormalizedName);
      if (similarity >= 0.85) { // 85% similarity threshold
        matchedJobs.push({
          id: job.id,
          title: job.title,
          source: job.source,
        });
      }
    }
  }

  return {
    matched: matchedJobs.length > 0,
    matchedJobs,
  };
}

/**
 * Simple similarity calculation (Jaccard-like)
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;
  
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Find all companies from LinkedIn jobs and match against platform
 */
export async function findOpportunityGaps(): Promise<CompanyMatchResult[]> {
  const dataSource = await getDataSource();
  const linkedInRepo = dataSource.getRepository(LinkedInJob);
  const jobRepo = dataSource.getRepository(Job);

  // Get all LinkedIn jobs with non-null company
  const linkedInJobs = await linkedInRepo
    .createQueryBuilder("linkedin_job")
    .where("linkedin_job.company IS NOT NULL")
    .andWhere("linkedin_job.company != ''")
    .orderBy("linkedin_job.job_date", "DESC")
    .getMany();

  // Get all platform jobs (for matching)
  const platformJobs = await jobRepo.find({
    select: ["id", "title", "company", "source"],
  });

  // Group LinkedIn jobs by normalized company
  const companyMap = new Map<string, {
    originalName: string;
    normalizedName: string;
    domain: string | null;
    linkedInJobs: typeof linkedInJobs;
  }>();

  for (const linkedInJob of linkedInJobs) {
    if (!linkedInJob.company) continue;
    
    const normalized = normalizeLinkedInCompany(
      linkedInJob.company,
      linkedInJob.company_link,
      linkedInJob.apply_link
    );

    const key = normalized.normalizedName || normalized.originalName.toLowerCase();
    
    if (!companyMap.has(key)) {
      companyMap.set(key, {
        originalName: normalized.originalName,
        normalizedName: normalized.normalizedName,
        domain: normalized.domain,
        linkedInJobs: [],
      });
    }
    
    companyMap.get(key)!.linkedInJobs.push(linkedInJob);
  }

  // Match each company against platform
  const results: CompanyMatchResult[] = [];

  for (const [key, companyData] of companyMap.entries()) {
    const normalized: NormalizedCompany = {
      originalName: companyData.originalName,
      normalizedName: companyData.normalizedName,
      domain: companyData.domain,
    };

    const matchResult = await matchCompanyAgainstPlatform(normalized, platformJobs);

    results.push({
      company: companyData.originalName,
      normalizedName: companyData.normalizedName,
      domain: companyData.domain,
      status: matchResult.matched
        ? MatchStatus.ALREADY_ON_PLATFORM
        : MatchStatus.NOT_ON_PLATFORM,
      matchedPlatformJobs: matchResult.matchedJobs,
      linkedInJobs: companyData.linkedInJobs.map(job => ({
        id: job.id,
        job_id: job.job_id,
        title: job.title,
        job_date: job.job_date,
        place: job.place,
        job_link: job.job_link,
      })),
    });
  }

  return results;
}

import { getDataSource } from "@/lib/db";
import { CompanyEnrichment, HiringIntentLevel } from "@/entities/CompanyEnrichment";
import { HiringIntentScoreHistory } from "@/entities/HiringIntentScoreHistory";
import { Job } from "@/entities/Job";

/**
 * Signal weights for hiring intent scoring
 */
const SIGNAL_WEIGHTS = {
  CAREER_PAGE: 30,
  KEYWORD_MATCH: 10, // per keyword
  ACTIVE_STATUS: 20,
  JOBS_LAST_7_DAYS: 40,
  JOBS_LAST_30_DAYS: 20,
  MULTIPLE_CATEGORIES: 10,
} as const;

const MAX_SCORE = 150;

/**
 * Calculate hiring intent level from score
 */
export function getIntentLevel(score: number): HiringIntentLevel {
  if (score >= 100) return HiringIntentLevel.VERY_HIGH;
  if (score >= 70) return HiringIntentLevel.HIGH;
  if (score >= 40) return HiringIntentLevel.MEDIUM;
  return HiringIntentLevel.LOW;
}

/**
 * Calculate hiring intent score breakdown
 */
export interface ScoreBreakdown {
  careerPage: number;
  keywordMatches: number;
  externalStatus: number;
  jobsLast7Days: number;
  jobsLast30Days: number;
  uniqueCategories: number;
  total: number;
}

/**
 * Calculate hiring intent score from enrichment data
 */
export function calculateIntentScore(
  enrichment: CompanyEnrichment
): ScoreBreakdown {
  let careerPage = 0;
  if (enrichment.hasCareerPage) {
    careerPage = SIGNAL_WEIGHTS.CAREER_PAGE;
  }
  
  const keywordMatches = Math.min(
    (enrichment.keywordMatches?.length || 0) * SIGNAL_WEIGHTS.KEYWORD_MATCH,
    30 // Cap at 3 keywords
  );
  
  let externalStatus = 0;
  if (enrichment.externalStatus === "ACTIVE") {
    externalStatus = SIGNAL_WEIGHTS.ACTIVE_STATUS;
  }
  
  // Jobs in last 7 days (max 40 points)
  const jobsLast7Days = Math.min(
    enrichment.jobsLast7Days * (SIGNAL_WEIGHTS.JOBS_LAST_7_DAYS / 3), // 3 jobs = 40 points
    SIGNAL_WEIGHTS.JOBS_LAST_7_DAYS
  );
  
  // Jobs in last 30 days (max 20 points, but don't double-count 7-day jobs)
  const jobsLast30Days = Math.min(
    Math.max(0, enrichment.jobsLast30Days - enrichment.jobsLast7Days) * (SIGNAL_WEIGHTS.JOBS_LAST_30_DAYS / 5),
    SIGNAL_WEIGHTS.JOBS_LAST_30_DAYS
  );
  
  // Multiple categories bonus
  const uniqueCategories = enrichment.uniqueJobCategories > 1 
    ? SIGNAL_WEIGHTS.MULTIPLE_CATEGORIES 
    : 0;
  
  const total = Math.min(
    careerPage + keywordMatches + externalStatus + jobsLast7Days + jobsLast30Days + uniqueCategories,
    MAX_SCORE
  );
  
  return {
    careerPage,
    keywordMatches,
    externalStatus,
    jobsLast7Days: Math.round(jobsLast7Days),
    jobsLast30Days: Math.round(jobsLast30Days),
    uniqueCategories,
    total: Math.round(total),
  };
}

/**
 * Calculate job activity signals from Job table
 */
export async function calculateJobActivitySignals(
  companyId: string,
  companyName: string
): Promise<{
  jobsLast7Days: number;
  jobsLast30Days: number;
  uniqueJobCategories: number;
}> {
  const dataSource = await getDataSource();
  const jobRepository = dataSource.getRepository(Job);
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Count jobs by company name (since Job.company is a string)
  const jobsLast7Days = await jobRepository
    .createQueryBuilder("job")
    .where("LOWER(TRIM(job.company)) = LOWER(TRIM(:companyName))", {
      companyName: companyName.trim(),
    })
    .andWhere("job.postedAt >= :sevenDaysAgo", { sevenDaysAgo })
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
    .getCount();
  
  const jobsLast30Days = await jobRepository
    .createQueryBuilder("job")
    .where("LOWER(TRIM(job.company)) = LOWER(TRIM(:companyName))", {
      companyName: companyName.trim(),
    })
    .andWhere("job.postedAt >= :thirtyDaysAgo", { thirtyDaysAgo })
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
    .getCount();
  
  // Count unique categories
  const uniqueCategories = await jobRepository
    .createQueryBuilder("job")
    .select("COUNT(DISTINCT job.categoryId)", "count")
    .where("LOWER(TRIM(job.company)) = LOWER(TRIM(:companyName))", {
      companyName: companyName.trim(),
    })
    .andWhere("job.postedAt >= :thirtyDaysAgo", { thirtyDaysAgo })
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
    .andWhere("job.categoryId IS NOT NULL")
    .getRawOne();
  
  const uniqueJobCategories = parseInt(uniqueCategories?.count || "0", 10);
  
  return {
    jobsLast7Days,
    jobsLast30Days,
    uniqueJobCategories,
  };
}

/**
 * Update hiring intent score for an enrichment
 */
export async function updateIntentScore(
  enrichment: CompanyEnrichment,
  trigger: string = "manual"
): Promise<{ enrichment: CompanyEnrichment; breakdown: ScoreBreakdown }> {
  const dataSource = await getDataSource();
  const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
  const historyRepository = dataSource.getRepository(HiringIntentScoreHistory);
  
  // Load company if not loaded
  if (!enrichment.company) {
    const { CanonicalCompany } = await import("@/entities/CanonicalCompany");
    const companyRepository = dataSource.getRepository(CanonicalCompany);
    const company = await companyRepository.findOne({ where: { id: enrichment.companyId } });
    if (company) {
      enrichment.company = company;
    }
  }
  
  if (!enrichment.company) {
    throw new Error(`Company not found for enrichment ${enrichment.id}`);
  }
  
  // Calculate job activity signals
  const jobActivity = await calculateJobActivitySignals(
    enrichment.companyId,
    enrichment.company.name
  );
  
  // Update enrichment with job activity
  enrichment.jobsLast7Days = jobActivity.jobsLast7Days;
  enrichment.jobsLast30Days = jobActivity.jobsLast30Days;
  enrichment.uniqueJobCategories = jobActivity.uniqueJobCategories;
  
  // Calculate score
  const breakdown = calculateIntentScore(enrichment);
  const oldScore = enrichment.intentScore;
  const oldLevel = enrichment.intentLevel;
  
  enrichment.intentScore = breakdown.total;
  enrichment.intentLevel = getIntentLevel(breakdown.total);
  
  // Save enrichment
  await enrichmentRepository.save(enrichment);
  
  // Record history if score changed
  if (oldScore !== breakdown.total || oldLevel !== enrichment.intentLevel) {
    const history = historyRepository.create({
      enrichmentId: enrichment.id,
      score: breakdown.total,
      level: enrichment.intentLevel,
      signalBreakdown: {
        careerPage: breakdown.careerPage,
        keywordMatches: breakdown.keywordMatches,
        externalStatus: breakdown.externalStatus,
        jobsLast7Days: breakdown.jobsLast7Days,
        jobsLast30Days: breakdown.jobsLast30Days,
        uniqueCategories: breakdown.uniqueCategories,
      },
      trigger,
    });
    
    await historyRepository.save(history);
  }
  
  return { enrichment, breakdown };
}


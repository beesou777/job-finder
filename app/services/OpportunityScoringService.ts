/**
 * Opportunity Scoring Service
 * Calculates client opportunity scores for companies
 */

import { CompanyMatchResult, MatchStatus } from "./OpportunityMatchingService";
import { ApproachabilityData, getCompanyApproachability } from "./CompanyApproachabilityService";

export type OpportunityLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export interface OpportunityScore {
  company: string;
  normalizedName: string;
  domain: string | null;
  score: number;
  level: OpportunityLevel;
  reasons: string[];
  linkedInJobCount: number;
  lastJobDate: Date | null;
  hasRecentJobs: boolean;
  isNepalLocation: boolean;
  status: MatchStatus;
  approachability?: ApproachabilityData;
}

/**
 * Check if location is in Nepal
 */
function isNepalLocation(place: string | null): boolean {
  if (!place) return false;
  const lowerPlace = place.toLowerCase();
  const nepalKeywords = [
    "nepal",
    "kathmandu",
    "pokhara",
    "lalitpur",
    "bhaktapur",
    "biratnagar",
    "birgunj",
    "dharan",
    "butwal",
    "hetauda",
    "janakpur",
    "nepalgunj",
  ];
  return nepalKeywords.some(keyword => lowerPlace.includes(keyword));
}

/**
 * Calculate opportunity score for a company
 */
export async function calculateOpportunityScore(
  matchResult: CompanyMatchResult
): Promise<OpportunityScore> {
  let score = 0;
  const reasons: string[] = [];

  // Signal 1: Appears on LinkedIn (+30)
  score += 30;
  reasons.push("Appears on LinkedIn");

  // Signal 2: NOT on platform (+50) - This is the key opportunity signal
  if (matchResult.status === MatchStatus.NOT_ON_PLATFORM) {
    score += 50;
    reasons.push("Not posting on our platform");
  } else {
    reasons.push("Already using platform");
  }

  // Signal 3: Posted in last 7 days (+30)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentJobs = matchResult.linkedInJobs.filter(job => {
    if (!job.job_date) return false;
    const jobDate = job.job_date instanceof Date ? job.job_date : new Date(job.job_date);
    return !isNaN(jobDate.getTime()) && jobDate >= sevenDaysAgo;
  });
  
  const hasRecentJobs = recentJobs.length > 0;
  if (hasRecentJobs) {
    score += 30;
    reasons.push(`Posted ${recentJobs.length} job(s) in last 7 days`);
  }

  // Signal 4: Multiple LinkedIn jobs by same company (+20)
  if (matchResult.linkedInJobs.length > 1) {
    score += 20;
    reasons.push(`${matchResult.linkedInJobs.length} active LinkedIn jobs`);
  }

  // Signal 5: Job location = Nepal (+10)
  const nepalJobs = matchResult.linkedInJobs.filter(
    job => isNepalLocation(job.place)
  );
  
  const hasNepalLocation = nepalJobs.length > 0;
  if (hasNepalLocation) {
    score += 10;
    reasons.push("Hiring in Nepal");
  }

  // Determine level based on score
  let level: OpportunityLevel;
  if (score >= 100) {
    level = "VERY_HIGH";
  } else if (score >= 70) {
    level = "HIGH";
  } else if (score >= 40) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  // Get last job date
  const jobDates = matchResult.linkedInJobs
    .map(job => job.job_date)
    .filter(date => date !== null)
    .map(date => date instanceof Date ? date : new Date(date as string))
    .filter(date => !isNaN(date.getTime())) // Filter out invalid dates
    .sort((a, b) => b.getTime() - a.getTime());
  
  const lastJobDate = jobDates.length > 0 ? jobDates[0] : null;

  // Get approachability data from JSON files
  const approachability = await getCompanyApproachability(
    matchResult.company,
    matchResult.domain
  );

  // Bonus points if we have contact info from JSON files
  if (approachability.hasContactInfo) {
    score += 15;
    reasons.push("Contact info available in our database");
  }

  // Recalculate level after bonus
  let finalLevel: OpportunityLevel;
  if (score >= 100) {
    finalLevel = "VERY_HIGH";
  } else if (score >= 70) {
    finalLevel = "HIGH";
  } else if (score >= 40) {
    finalLevel = "MEDIUM";
  } else {
    finalLevel = "LOW";
  }

  return {
    company: matchResult.company,
    normalizedName: matchResult.normalizedName,
    domain: matchResult.domain,
    score,
    level: finalLevel,
    reasons,
    linkedInJobCount: matchResult.linkedInJobs.length,
    lastJobDate,
    hasRecentJobs,
    isNepalLocation: hasNepalLocation,
    status: matchResult.status,
    approachability,
  };
}

/**
 * Score all companies from match results
 */
export async function scoreAllOpportunities(
  matchResults: CompanyMatchResult[]
): Promise<OpportunityScore[]> {
  const scores = await Promise.all(
    matchResults.map(calculateOpportunityScore)
  );
  
  return scores.sort((a, b) => {
    // Sort by: NOT_ON_PLATFORM first, then by score descending
    if (a.status !== b.status) {
      return a.status === MatchStatus.NOT_ON_PLATFORM ? -1 : 1;
    }
    return b.score - a.score;
  });
}

/**
 * Filter opportunities by level and status
 */
export function filterOpportunities(
  opportunities: OpportunityScore[],
  options: {
    level?: OpportunityLevel | OpportunityLevel[];
    status?: MatchStatus;
    minScore?: number;
  }
): OpportunityScore[] {
  let filtered = [...opportunities];

  if (options.status) {
    filtered = filtered.filter(opp => opp.status === options.status);
  }

  if (options.level) {
    const levels = Array.isArray(options.level) ? options.level : [options.level];
    filtered = filtered.filter(opp => levels.includes(opp.level));
  }

  if (options.minScore !== undefined) {
    filtered = filtered.filter(opp => opp.score >= options.minScore!);
  }

  return filtered;
}

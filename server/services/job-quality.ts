import { JobData } from "@/src/scrapers/core/types";

export type DeadlineConfidence = "exact" | "relative" | "inferred" | "unknown";

export function getDeadlineConfidence(deadline?: string, expiresAt?: Date): DeadlineConfidence {
  if (!deadline && !expiresAt) return "unknown";
  if (deadline && /(day|days)\s+(left|from now)/i.test(deadline)) return "relative";
  if (deadline && !Number.isNaN(new Date(deadline).getTime())) return "exact";
  return expiresAt ? "inferred" : "unknown";
}

export function calculateJobQuality(job: JobData): number {
  let score = 20;
  if (job.company?.trim()) score += 15;
  if (job.location?.trim()) score += 10;
  if (job.description && job.description.trim().length >= 200) score += 20;
  else if (job.description?.trim()) score += 8;
  if (job.requirements && job.requirements.trim().length >= 80) score += 10;
  if (job.expiresAt || job.deadline) score += 10;
  if (job.postedAt) score += 5;
  if (job.category?.trim()) score += 5;
  if (job.salaryText && !/negotiable|not disclosed/i.test(job.salaryText)) score += 5;
  return Math.min(100, score);
}

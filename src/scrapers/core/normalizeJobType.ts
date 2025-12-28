import { JobTypeEnum } from "@/entities/Job";

/**
 * Normalize job type string to JobTypeEnum
 * Handles various formats like "Full Time", "full-time", "Fulltime", etc.
 */
export function normalizeJobType(jobType: string | null | undefined): JobTypeEnum | null {
  if (!jobType) return null;
  
  const lower = jobType.toLowerCase().trim();
  
  // Full-time variations
  if ((lower.includes("full") && lower.includes("time")) || lower === "fulltime" || lower === "full-time") {
    return JobTypeEnum.FULL_TIME;
  }
  
  // Part-time variations
  if ((lower.includes("part") && lower.includes("time")) || lower === "parttime" || lower === "part-time") {
    return JobTypeEnum.PART_TIME;
  }
  
  // Contract
  if (lower.includes("contract")) {
    return JobTypeEnum.CONTRACT;
  }
  
  // Remote
  if (lower.includes("remote")) {
    return JobTypeEnum.REMOTE;
  }
  
  // Hybrid
  if (lower.includes("hybrid")) {
    return JobTypeEnum.HYBRID;
  }
  
  // On-site variations
  if (lower.includes("on-site") || lower.includes("onsite") || lower.includes("on site") || lower.includes("office")) {
    return JobTypeEnum.ONSITE;
  }
  
  // Freelance
  if (lower.includes("freelance")) {
    return JobTypeEnum.FREELANCE;
  }
  
  // Temporary
  if (lower.includes("temporary") || lower.includes("temp")) {
    return JobTypeEnum.TEMPORARY;
  }
  
  // Internship
  if (lower.includes("intern")) {
    return JobTypeEnum.INTERNSHIP;
  }
  
  return null;
}


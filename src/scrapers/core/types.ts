import { z } from "zod";

export const JobDataSchema = z.object({
  title: z.string().min(1),
  applyUrl: z.string().url(),
  company: z.string().optional(),
  location: z.string().optional(),
  salaryText: z.string().optional(),
  deadline: z.string().optional(),
  jobType: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["job", "internship"]).default("job"),
  source: z.string(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  expiresAt: z.date().optional(),
});

export type JobData = z.infer<typeof JobDataSchema>;

/**
 * Calculate expiration date from deadline string or default to 1 month from now
 */
export function calculateExpirationDate(deadline?: string, createdAt?: Date): Date {
  if (deadline) {
    // Try to parse deadline string
    const parsed = parseDeadline(deadline);
    if (parsed) {
      return parsed;
    }
  }
  
  // Default: 1 month from creation date or now
  const baseDate = createdAt || new Date();
  const expiresAt = new Date(baseDate);
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  return expiresAt;
}

/**
 * Parse deadline string to Date
 */
function parseDeadline(deadline: string): Date | null {
  try {
    // Try common formats
    const date = new Date(deadline);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try parsing "DD/MM/YYYY" or "MM/DD/YYYY"
    const parts = deadline.split(/[\/\-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  } catch {
    // Ignore parsing errors
  }
  
  return null;
}

/**
 * Detect if a job is an internship based on title, URL, or category
 */
export function detectJobType(
  title: string,
  url: string,
  category?: string
): "job" | "internship" {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const lowerCategory = category?.toLowerCase() || "";

  const internshipKeywords = [
    "intern",
    "internship",
    "trainee",
    "traineeship",
    "apprentice",
  ];

  const hasInternshipKeyword =
    internshipKeywords.some((keyword) => lowerTitle.includes(keyword)) ||
    internshipKeywords.some((keyword) => lowerUrl.includes(keyword)) ||
    internshipKeywords.some((keyword) => lowerCategory.includes(keyword));

  return hasInternshipKeyword ? "internship" : "job";
}


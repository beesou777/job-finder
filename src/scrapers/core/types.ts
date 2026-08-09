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
  postedAt: z.date().optional(),
  sourceJobId: z.string().optional(),
});

export type JobData = z.infer<typeof JobDataSchema>;

function collapseRepeatedText(value?: string): string | undefined {
  if (!value) return value;
  let normalized = value.replace(/\s+/g, " ").trim();
  const words = normalized.split(" ");
  if (words.length >= 2 && words.length % 2 === 0) {
    const half = words.length / 2;
    if (words.slice(0, half).join(" ").toLowerCase() === words.slice(half).join(" ").toLowerCase()) {
      normalized = words.slice(0, half).join(" ");
    }
  }
  return normalized;
}

function normalizeSalary(value?: string): string | undefined {
  const normalized = collapseRepeatedText(value);
  if (!normalized) return normalized;
  return normalized.replace(/\bRs\.?\s*([\d,]+)\s*(?:per|\/)?\s*month\b/i, "NPR $1/month");
}

/** Clean common scraper artifacts before jobs are persisted or rendered. */
export function normalizeJobData(job: JobData): JobData {
  return {
    ...job,
    title: collapseRepeatedText(job.title) || job.title,
    company: collapseRepeatedText(job.company),
    location: collapseRepeatedText(job.location),
    category: collapseRepeatedText(job.category),
    salaryText: normalizeSalary(job.salaryText),
    description: collapseRepeatedText(job.description),
    requirements: collapseRepeatedText(job.requirements),
  };
}

/**
 * Calculate expiration date only when the source supplied a parseable deadline.
 * Unknown deadlines must stay unknown and are handled through source verification.
 */
export function calculateExpirationDate(deadline?: string, createdAt?: Date): Date | undefined {
  if (deadline) {
    // Try to parse deadline string
    const parsed = parseDeadline(deadline);
    if (parsed) {
      return parsed;
    }
  }
  
  return undefined;
}

/**
 * Parse deadline string to Date
 */
function parseDeadline(deadline: string): Date | null {
  try {
    // Try parsing "X days left" or "X day left" patterns first
    const daysLeftMatch = deadline.match(/(\d+)\s*(?:day|days)?\s*left/i);
    if (daysLeftMatch) {
      const days = parseInt(daysLeftMatch[1]);
      if (!isNaN(days)) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        return expirationDate;
      }
    }
    
    // Try "X days from now" pattern
    const daysFromNowMatch = deadline.match(/(\d+)\s*(?:day|days)\s+from\s+now/i);
    if (daysFromNowMatch) {
      const days = parseInt(daysFromNowMatch[1]);
      if (!isNaN(days)) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        return expirationDate;
      }
    }
    
    // Try date format with "days from now" (e.g., "30-January-2026 (19 days from now)")
    const dateWithDaysMatch = deadline.match(/(\d{1,2}[-/]\w+[-/]\d{4})\s*\((\d+)\s*(?:day|days)\s*from\s*now\)/i);
    if (dateWithDaysMatch) {
      const days = parseInt(dateWithDaysMatch[2]);
      if (!isNaN(days)) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
        return expirationDate;
      }
    }
    
    // Try common date formats
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


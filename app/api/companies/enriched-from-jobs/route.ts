import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/server/db/entities/Job";
import * as fs from "fs";
import * as path from "path";
import { compareTwoStrings } from "string-similarity";

export const dynamic = "force-dynamic";

interface JsonCompany {
  company_name?: string;
  name?: string;
  mobile_number?: string;
  email?: string;
  website?: string;
  websitelink?: string;
  location?: string;
  phoneNumber?: string;
  careerPageUrl?: string;
}

interface EnrichedCompany {
  companyName: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  location?: string;
  jobsCount: number;
  jobsLast7Days: number;
  jobsLast30Days: number;
  latestJobTitle?: string;
  latestJobUrl?: string;
  matchConfidence: number;
  matchedFrom: string; // Which JSON file it matched from
  intentScore: number;
}

/**
 * Load all JSON company data files
 */
function loadJsonCompanies(): JsonCompany[] {
  const utilsDir = path.join(process.cwd(), "utils");
  const companies: JsonCompany[] = [];

  const jsonFiles = [
    "ramrojob_companies.json",
    "virit-jobs.json",
    "workhub.json",
    "mero-job.json",
    "results.json",
  ];

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(utilsDir, file);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const jsonData = JSON.parse(fileContent);

        // Handle different JSON structures
        if (jsonData.companies && Array.isArray(jsonData.companies)) {
          jsonData.companies.forEach((comp: any) => {
            companies.push({ ...comp, _source: file });
          });
        } else if (jsonData.results && Array.isArray(jsonData.results)) {
          jsonData.results.forEach((comp: any) => {
            companies.push({ ...comp, _source: file });
          });
        } else if (Array.isArray(jsonData)) {
          jsonData.forEach((comp: any) => {
            companies.push({ ...comp, _source: file });
          });
        }
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }

  return companies;
}

/**
 * Normalize company name for comparison
 */
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ") // Remove special characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\b(pvt|ltd|llc|inc|corp|limited|company|co)\b/gi, "") // Remove common suffixes
    .trim();
}

/**
 * Find best matching company from JSON data
 */
function findMatchingCompany(
  jobCompanyName: string,
  jsonCompanies: JsonCompany[]
): { company: JsonCompany; confidence: number; source: string } | null {
  const normalizedJobName = normalizeCompanyName(jobCompanyName);
  let bestMatch: JsonCompany | null = null;
  let bestConfidence = 0;
  let bestSource = "";

  for (const jsonCompany of jsonCompanies) {
    const jsonName = jsonCompany.company_name || jsonCompany.name;
    if (!jsonName) continue;

    const normalizedJsonName = normalizeCompanyName(jsonName);
    
    // Calculate similarity
    const similarity = compareTwoStrings(normalizedJobName, normalizedJsonName);
    
    // If similarity is higher than 90% (0.9) and better than previous match
    if (similarity >= 0.9 && similarity > bestConfidence) {
      bestMatch = jsonCompany;
      bestConfidence = similarity;
      
      // Determine source file from _source field or structure
      const source = (jsonCompany as any)._source || "";
      if (source.includes("ramrojob")) {
        bestSource = "ramrojob";
      } else if (source.includes("virit")) {
        bestSource = "virit";
      } else if (source.includes("workhub")) {
        bestSource = "workhub";
      } else if (source.includes("mero-job")) {
        bestSource = "mero-job";
      } else if (source.includes("results")) {
        bestSource = "results";
      } else {
        // Fallback: determine by structure
        if (jsonCompany.company_name) {
          bestSource = jsonCompany.email?.includes("ramrojob") ? "ramrojob" : "virit";
        } else if (jsonCompany.name) {
          bestSource = (jsonCompany as any).careerPageUrl ? "results" : "workhub";
        } else {
          bestSource = "unknown";
        }
      }
    }
  }

  if (bestMatch && bestConfidence >= 0.9) {
    return { company: bestMatch, confidence: bestConfidence, source: bestSource };
  }

  return null;
}

/**
 * GET /api/companies/enriched-from-jobs
 * Get companies from Jobs table matched with JSON data
 */
export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    // Load JSON company data
    const jsonCompanies = loadJsonCompanies();
    console.log(`Loaded ${jsonCompanies.length} companies from JSON files`);

    // Get all non-expired jobs
    const now = new Date();
    const allJobs = await jobRepository
      .createQueryBuilder("job")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
      .andWhere("job.company IS NOT NULL")
      .andWhere("job.company != ''")
      .orderBy("job.postedAt", "DESC")
      .getMany();

    console.log(`Found ${allJobs.length} non-expired jobs`);

    // Group jobs by company name
    const companyJobMap = new Map<string, Job[]>();
    for (const job of allJobs) {
      const companyName = job.company!.trim();
      if (!companyJobMap.has(companyName)) {
        companyJobMap.set(companyName, []);
      }
      companyJobMap.get(companyName)!.push(job);
    }

    // Match companies and enrich data
    const enrichedCompanies: EnrichedCompany[] = [];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const [companyName, jobs] of companyJobMap.entries()) {
      // Find matching company from JSON
      const match = findMatchingCompany(companyName, jsonCompanies);
      
      if (match) {
        const jsonCompany = match.company;
        
        // Count jobs in last 7 and 30 days
        const jobsLast7Days = jobs.filter(
          (j) => j.postedAt && j.postedAt >= sevenDaysAgo
        ).length;
        const jobsLast30Days = jobs.filter(
          (j) => j.postedAt && j.postedAt >= thirtyDaysAgo
        ).length;

        // Get latest job
        const latestJob = jobs[0]; // Already sorted by postedAt DESC

        // Calculate intent score based on job activity
        const intentScore = Math.round(
          jobsLast7Days * 10 + // Weight recent jobs more
          jobsLast30Days * 3 +
          jobs.length * 1
        );

        enrichedCompanies.push({
          companyName,
          email: jsonCompany.email || undefined,
          phoneNumber: jsonCompany.mobile_number || jsonCompany.phoneNumber || undefined,
          website: jsonCompany.website || jsonCompany.websitelink || undefined,
          location: jsonCompany.location || undefined,
          jobsCount: jobs.length,
          jobsLast7Days,
          jobsLast30Days,
          latestJobTitle: latestJob.title,
          latestJobUrl: latestJob.applyUrl,
          matchConfidence: Math.round(match.confidence * 100),
          matchedFrom: match.source,
          intentScore,
        });
      }
    }

    // Sort by jobs count (most active first)
    enrichedCompanies.sort((a, b) => b.jobsCount - a.jobsCount);

    const response = NextResponse.json({
      success: true,
      total: enrichedCompanies.length,
      data: enrichedCompanies,
    });

    // Disable caching in development
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error: any) {
    console.error("Error fetching enriched companies from jobs:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

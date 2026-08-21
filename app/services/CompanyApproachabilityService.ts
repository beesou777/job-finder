import { normalizeCompanyName, extractDomain } from "./CompanyNormalizationService";
import { readFileSync } from "fs";
import { join } from "path";
import { getDataSource } from "@/lib/db";
import { CompanyEnrichment, ApproachabilityLevel } from "@/server/db/entities/CompanyEnrichment";
import { CanonicalCompany } from "@/server/db/entities/CanonicalCompany";

interface CompanyFromJSON {
  name: string;
  website?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
}

export interface ApproachabilityData {
  isKnownCompany: boolean;
  hasContactInfo: boolean;
  email?: string | null;
  phoneNumber?: string | null;
  website?: string | null;
  source?: string; // Which JSON file or 'DB'
  score?: number;
  level?: ApproachabilityLevel;
}

// Cache for loaded companies
let cachedCompanies: Map<string, CompanyFromJSON[]> | null = null;

/**
 * Load companies from JSON files
 * Uses fs.readFileSync for server-side JSON loading
 */
async function loadCompanyData(): Promise<Map<string, CompanyFromJSON[]>> {
  if (cachedCompanies) {
    return cachedCompanies;
  }

  const companies = new Map<string, CompanyFromJSON[]>();

  try {
    // Get the project root directory (assuming we're in app/services)
    const projectRoot = process.cwd();
    const utilsPath = join(projectRoot, "utils");

    // Load ramrojob_companies.json
    try {
      const ramrojobPath = join(utilsPath, "ramrojob_companies.json");
      const ramrojobContent = readFileSync(ramrojobPath, "utf-8");
      const ramrojobData = JSON.parse(ramrojobContent);
      if (ramrojobData.companies) {
        const ramrojobCompanies = ramrojobData.companies.map((c: any) => ({
          name: c.company_name || c.name,
          website: c.websitelink || c.website,
          email: c.email,
          phoneNumber: c.mobile_number || c.phoneNumber,
          location: c.location,
        }));
        companies.set("ramrojob", ramrojobCompanies);
      }
    } catch (error) {
      console.warn("Failed to load ramrojob_companies.json:", error);
    }

    // Load mero-job.json
    try {
      const merojobPath = join(utilsPath, "mero-job.json");
      const merojobContent = readFileSync(merojobPath, "utf-8");
      const merojobData = JSON.parse(merojobContent);
      if (merojobData.results) {
        const merojobCompanies = merojobData.results.map((c: any) => ({
          name: c.name || c.org_alt_name,
          website: c.website,
          email: null, // mero-job.json doesn't have email
          phoneNumber: null,
          location: c.address || c.location,
        }));
        companies.set("merojob", merojobCompanies);
      }
    } catch (error) {
      console.warn("Failed to load mero-job.json:", error);
    }

    // Load workhub.json
    try {
      const workhubPath = join(utilsPath, "workhub.json");
      const workhubContent = readFileSync(workhubPath, "utf-8");
      const workhubData = JSON.parse(workhubContent);
      if (workhubData.companies) {
        const workhubCompanies = workhubData.companies.map((c: any) => ({
          name: c.name,
          website: c.website,
          email: null,
          phoneNumber: null,
          location: c.location,
        }));
        companies.set("workhub", workhubCompanies);
      }
    } catch (error) {
      console.warn("Failed to load workhub.json:", error);
    }

    // Load virit-jobs.json
    try {
      const viritPath = join(utilsPath, "virit-jobs.json");
      const viritContent = readFileSync(viritPath, "utf-8");
      const viritData = JSON.parse(viritContent);
      if (viritData.companies) {
        const viritCompanies = viritData.companies.map((c: any) => ({
          name: c.company_name || c.name,
          website: c.website,
          email: c.email,
          phoneNumber: c.mobile_number || c.phoneNumber,
          location: c.location,
        }));
        companies.set("virit", viritCompanies);
      }
    } catch (error) {
      console.warn("Failed to load virit-jobs.json:", error);
    }
  } catch (error) {
    console.error("Error loading company data:", error);
  }

  cachedCompanies = companies;
  return companies;
}

/**
 * Check if a company is approachable based on database or JSON data
 */
export async function getCompanyApproachability(
  companyName: string,
  companyDomain: string | null,
): Promise<ApproachabilityData> {
  // 1. Check Database First
  try {
    const dataSource = await getDataSource();
    const enrichmentRepo = dataSource.getRepository(CompanyEnrichment);

    // Exact match or domain match in DB
    const enrichment = await enrichmentRepo
      .createQueryBuilder("enrichment")
      .leftJoinAndSelect("enrichment.company", "company")
      .where("LOWER(company.name) = LOWER(:name)", { name: companyName })
      .orWhere(companyDomain ? "LOWER(enrichment.website) LIKE LOWER(:domain)" : "1=0", {
        domain: `%${companyDomain}%`,
      })
      .getOne();

    if (enrichment) {
      return {
        isKnownCompany: true,
        hasContactInfo: !!(enrichment.email || enrichment.phoneNumber),
        email: enrichment.email,
        phoneNumber: enrichment.phoneNumber,
        website: enrichment.website,
        source: "DB",
        score: enrichment.approachabilityScore,
        level: enrichment.approachabilityLevel,
      };
    }
  } catch (dbError) {
    console.warn("Failed to check database for approachability:", dbError);
  }

  // 2. Fallback to JSON files
  const companies = await loadCompanyData();
  const normalizedName = normalizeCompanyName(companyName);

  // Search through all company sources
  for (const [source, companyList] of companies.entries()) {
    for (const company of companyList) {
      const companyNormalizedName = normalizeCompanyName(company.name);

      // Match by normalized name
      if (companyNormalizedName === normalizedName && normalizedName !== "") {
        // Filter out LinkedIn URLs from website
        const website =
          company.website && !company.website.includes("linkedin.com") ? company.website : null;

        return {
          isKnownCompany: true,
          hasContactInfo: !!(company.email || company.phoneNumber),
          email: company.email,
          phoneNumber: company.phoneNumber,
          website,
          source,
        };
      }

      // Match by domain if available (but skip LinkedIn URLs)
      if (companyDomain && company.website) {
        const companyDomainNormalized = extractDomain(company.website);
        if (companyDomainNormalized && companyDomainNormalized === companyDomain) {
          // Only return if it's not a LinkedIn URL
          if (!company.website.includes("linkedin.com")) {
            return {
              isKnownCompany: true,
              hasContactInfo: !!(company.email || company.phoneNumber),
              email: company.email,
              phoneNumber: company.phoneNumber,
              website: company.website,
              source,
            };
          }
        }
      }
    }
  }

  return {
    isKnownCompany: false,
    hasContactInfo: false,
  };
}

/**
 * Batch check approachability for multiple companies
 */
export async function batchGetApproachability(
  companies: Array<{ name: string; domain: string | null }>,
): Promise<Map<string, ApproachabilityData>> {
  const results = new Map<string, ApproachabilityData>();

  // Load all company data once
  await loadCompanyData();

  for (const company of companies) {
    const approachability = await getCompanyApproachability(company.name, company.domain);
    results.set(company.name, approachability);
  }

  return results;
}

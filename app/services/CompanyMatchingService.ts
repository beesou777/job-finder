import { getDataSource } from "@/lib/db";
import { CanonicalCompany } from "@/server/db/entities/CanonicalCompany";
import { CompanyEnrichment, MatchConfidence, ExternalSource } from "@/server/db/entities/CompanyEnrichment";
import { compareTwoStrings } from "string-similarity";

export interface ExternalCompanyData {
  name: string;
  website?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  careerPageUrl?: string | null;
  externalProfileUrl?: string | null;
  status?: string;
  keywordMatches?: string[];
  location?: string | null;
  source?: ExternalSource;
}

export interface MatchResult {
  company: CanonicalCompany | null;
  confidence: MatchConfidence;
  similarity: number;
  matchedBy: string;
  shouldCreateNew: boolean;
}

/**
 * Normalize company name for matching
 */
function normalizeCompanyName(name: string): string {
  if (!name) return "";
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\b(pvt|pvt\.|private|limited|ltd|ltd\.|inc|inc\.|incorporated|corp|corp\.|corporation)\b/gi, "") // Remove common suffixes
    .trim();
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1].toLowerCase() : null;
  }
}

/**
 * Match external company data to existing CanonicalCompany
 */
export async function matchCompany(
  externalData: ExternalCompanyData
): Promise<MatchResult> {
  const dataSource = await getDataSource();
  const companyRepository = dataSource.getRepository(CanonicalCompany);
  
  const normalizedName = normalizeCompanyName(externalData.name);
  
  // Strategy 1: Exact domain match (highest confidence)
  if (externalData.website) {
    const domain = extractDomain(externalData.website);
    if (domain) {
      const domainMatch = await companyRepository.findOne({
        where: { domain },
      });
      
      if (domainMatch) {
        return {
          company: domainMatch,
          confidence: MatchConfidence.HIGH,
          similarity: 100,
          matchedBy: "domain",
          shouldCreateNew: false,
        };
      }
    }
  }
  
  // Strategy 2: Exact normalized name match
  const allCompanies = await companyRepository.find();
  const exactMatch = allCompanies.find(
    (c) => normalizeCompanyName(c.name) === normalizedName
  );
  
  if (exactMatch) {
    return {
      company: exactMatch,
      confidence: MatchConfidence.HIGH,
      similarity: 100,
      matchedBy: "name",
      shouldCreateNew: false,
    };
  }
  
  // Strategy 3: Fuzzy name matching (using string-similarity)
  let bestMatch: CanonicalCompany | null = null;
  let bestSimilarity = 0;
  
  for (const company of allCompanies) {
    const normalizedCompanyName = normalizeCompanyName(company.name);
    const similarity = compareTwoStrings(normalizedName, normalizedCompanyName);
    
    // Also check aliases
    let aliasSimilarity = 0;
    if (company.aliases && company.aliases.length > 0) {
      aliasSimilarity = Math.max(
        ...company.aliases.map((alias) =>
          compareTwoStrings(normalizedName, normalizeCompanyName(alias))
        )
      );
    }
    
    const maxSimilarity = Math.max(similarity, aliasSimilarity);
    
    if (maxSimilarity > bestSimilarity) {
      bestSimilarity = maxSimilarity;
      bestMatch = company;
    }
  }
  
  // Convert similarity (0-1) to percentage (0-100)
  const similarityPercent = bestSimilarity * 100;
  
  if (bestMatch && similarityPercent >= 94) {
    // 94-100% = HIGH confidence, auto-link
    return {
      company: bestMatch,
      confidence: MatchConfidence.HIGH,
      similarity: similarityPercent,
      matchedBy: "fuzzy",
      shouldCreateNew: false,
    };
  } else if (bestMatch && similarityPercent >= 80) {
    // 80-93% = MEDIUM confidence, flag for review
    return {
      company: bestMatch,
      confidence: MatchConfidence.MEDIUM,
      similarity: similarityPercent,
      matchedBy: "fuzzy",
      shouldCreateNew: false,
    };
  }
  
  // No match found - create new lead company
  return {
    company: null,
    confidence: MatchConfidence.LOW,
    similarity: bestSimilarity * 100,
    matchedBy: "none",
    shouldCreateNew: true,
  };
}

/**
 * Find or create CanonicalCompany based on match result
 */
export async function findOrCreateCompany(
  externalData: ExternalCompanyData,
  matchResult: MatchResult
): Promise<CanonicalCompany> {
  const dataSource = await getDataSource();
  const companyRepository = dataSource.getRepository(CanonicalCompany);
  
  if (matchResult.company) {
    // Update aliases if name is different
    const normalizedExternalName = normalizeCompanyName(externalData.name);
    const normalizedCompanyName = normalizeCompanyName(matchResult.company.name);
    
    if (normalizedExternalName !== normalizedCompanyName && !matchResult.company.aliases.includes(externalData.name)) {
      matchResult.company.aliases = [
        ...(matchResult.company.aliases || []),
        externalData.name,
      ];
      await companyRepository.save(matchResult.company);
    }
    
    // Update domain if not set
    if (!matchResult.company.domain && externalData.website) {
      const domain = extractDomain(externalData.website);
      if (domain) {
        matchResult.company.domain = domain;
        await companyRepository.save(matchResult.company);
      }
    }
    
    return matchResult.company;
  }
  
  // Create new company
  const domain = extractDomain(externalData.website || null);
  const newCompany = companyRepository.create({
    name: externalData.name,
    domain: domain || undefined,
    aliases: [],
    isVerified: false,
  });
  
  return await companyRepository.save(newCompany);
}


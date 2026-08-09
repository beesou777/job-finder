/**
 * Script to enrich companies from JSON files
 * 
 * Usage:
 *   tsx scripts/enrich-companies-from-json.ts <file-path> <source>
 * 
 * Example:
 *   tsx scripts/enrich-companies-from-json.ts utils/results.json techbehemoths
 */

import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";
import { batchEnrichCompanies } from "../app/services/CompanyEnrichmentService";
import { ExternalCompanyData } from "../app/services/CompanyMatchingService";
import { ExternalSource } from "../server/db/entities/CompanyEnrichment";

config();

async function main() {
  const filePath = process.argv[2];
  const sourceArg = process.argv[3] || "manual";
  
  if (!filePath) {
    console.error("❌ Please provide a JSON file path");
    console.log("Usage: tsx scripts/enrich-companies-from-json.ts <file-path> <source>");
    process.exit(1);
  }
  
  // Map source argument to enum
  const sourceMap: Record<string, ExternalSource> = {
    techbehemoths: ExternalSource.TECHBEHEMOTHS,
    ramrojob: ExternalSource.RAMROJOB,
    merojob: ExternalSource.MEROJOB,
    virit: ExternalSource.VIRIT,
    workhub: ExternalSource.WORKHUB,
    manual: ExternalSource.MANUAL,
  };
  
  const source = sourceMap[sourceArg.toLowerCase()] || ExternalSource.MANUAL;
  
  console.log(`📂 Reading file: ${filePath}`);
  console.log(`🏷️  Source: ${source}`);
  
  try {
    const fileContent = readFileSync(join(process.cwd(), filePath), "utf-8");
    const jsonData = JSON.parse(fileContent);
    
    // Handle different JSON structures
    let companies: any[] = [];
    
    if (Array.isArray(jsonData)) {
      companies = jsonData;
    } else if (jsonData.companies && Array.isArray(jsonData.companies)) {
      companies = jsonData.companies;
    } else if (jsonData.results && Array.isArray(jsonData.results)) {
      companies = jsonData.results;
    } else {
      console.error("❌ Invalid JSON structure. Expected array or object with 'companies' or 'results' array");
      process.exit(1);
    }
    
    console.log(`📊 Found ${companies.length} companies to process\n`);
    
    // Transform to ExternalCompanyData format
    const externalDataArray: ExternalCompanyData[] = companies
      .filter((c) => c.name || c.company_name) // Filter out entries without names
      .map((c: any) => {
        // Handle different field names across sources
        const data: ExternalCompanyData = {
          name: c.name || c.company_name,
          website: c.website || c.websitelink || null,
          email: c.email || null,
          phoneNumber: c.phoneNumber || c.mobile_number || null,
          careerPageUrl: c.careerPageUrl || null,
          externalProfileUrl: c.externalProfileUrl || c.techbehemothsUrl || null,
          status: c.status || null,
          keywordMatches: c.keywordMatches || [],
          source: source,
        };
        
        return data;
      });
    
    console.log(`🔄 Enriching ${externalDataArray.length} companies...\n`);
    
    const result = await batchEnrichCompanies(externalDataArray, source);
    
    console.log("\n✅ Enrichment complete!");
    console.log(`   ✅ Success: ${result.success}`);
    console.log(`   ❌ Failed: ${result.failed}`);
    console.log(`   ⏭️  Skipped: ${result.skipped}`);
    
    if (result.errors.length > 0) {
      console.log("\n⚠️  Errors:");
      result.errors.slice(0, 10).forEach((err) => {
        console.log(`   - ${err.company}: ${err.error}`);
      });
      if (result.errors.length > 10) {
        console.log(`   ... and ${result.errors.length - 10} more errors`);
      }
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error?.message || error);
    process.exit(1);
  }
}

// Initialize database connection
import { getDataSource } from "../lib/db";

getDataSource()
  .then(() => main())
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

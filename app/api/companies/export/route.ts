import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { CompanyEnrichment, HiringIntentLevel } from "@/entities/CompanyEnrichment";

export const dynamic = "force-dynamic";

/**
 * Convert data to CSV format
 */
function arrayToCSV(data: any[]): string {
  if (data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (Array.isArray(value)) return `"${value.join("; ")}"`;
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
}

/**
 * GET /api/companies/export
 * Export companies to CSV
 */
export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const enrichmentRepository = dataSource.getRepository(CompanyEnrichment);
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "high-intent"; // high-intent, contacts, pitch-targets, all
    const format = searchParams.get("format") || "csv"; // csv or json
    const minLevel = searchParams.get("minLevel") as HiringIntentLevel | null;
    const minScore = searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!) : null;
    const search = searchParams.get("search") || null; // Company name search
    
    let query = enrichmentRepository
      .createQueryBuilder("enrichment")
      .leftJoinAndSelect("enrichment.company", "company")
      .where("1=1");
    
    switch (type) {
      case "high-intent":
        query = query
          .andWhere("enrichment.intentLevel IN ('HIGH', 'VERY_HIGH')")
          .orderBy("enrichment.intentScore", "DESC");
        break;
      case "contacts":
        query = query
          .andWhere("(enrichment.email IS NOT NULL OR enrichment.phoneNumber IS NOT NULL)")
          .orderBy("enrichment.intentScore", "DESC");
        break;
      case "pitch-targets":
        query = query
          .andWhere("enrichment.isPitchTarget = :isPitchTarget", { isPitchTarget: true })
          .orderBy("enrichment.intentScore", "DESC");
        break;
      case "all":
        query = query.orderBy("enrichment.intentScore", "DESC");
        break;
      default:
        query = query
          .andWhere("enrichment.intentLevel IN ('HIGH', 'VERY_HIGH')")
          .orderBy("enrichment.intentScore", "DESC");
    }
    
    if (minLevel) {
      const levels = [HiringIntentLevel.LOW, HiringIntentLevel.MEDIUM, HiringIntentLevel.HIGH, HiringIntentLevel.VERY_HIGH];
      const minIndex = levels.indexOf(minLevel);
      if (minIndex >= 0) {
        query = query.andWhere(`enrichment.intentLevel IN ('${levels.slice(minIndex).join("','")}')`);
      }
    }
    
    if (minScore !== null) {
      query = query.andWhere("enrichment.intentScore >= :minScore", { minScore });
    }
    
    if (search) {
      query = query.andWhere("company.name ILIKE :search", { search: `%${search}%` });
    }
    
    const enrichments = await query.getMany();
    
    // If JSON format is requested, return companies with email, phone, and website
    if (format === "json") {
      // Filter to only companies that have at least email, phone, or website
      const jsonData = enrichments
        .filter((e) => e.email || e.phoneNumber || e.website)
        .map((e) => ({
          company_name: e.company.name,
          mobile_number: e.phoneNumber || "",
          email: e.email || "",
          websitelink: e.website || null,
          location: null, // Can be added if location data is available
        }));

      const jsonResponse = {
        companies: jsonData,
      };

      return new NextResponse(JSON.stringify(jsonResponse, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="companies-${type}-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }
    
    // Format data for CSV
    const csvData = enrichments.map((e) => ({
      "Company Name": e.company.name,
      "Domain": e.company.domain || "",
      "Email": e.email || "",
      "Phone Number": e.phoneNumber || "",
      "Website": e.website || "",
      "Career Page URL": e.careerPageUrl || "",
      "Intent Score": e.intentScore,
      "Intent Level": e.intentLevel,
      "Jobs (Last 7 Days)": e.jobsLast7Days,
      "Jobs (Last 30 Days)": e.jobsLast30Days,
      "Unique Categories": e.uniqueJobCategories,
      "Has Career Page": e.hasCareerPage ? "Yes" : "No",
      "Keywords": e.keywordMatches?.join("; ") || "",
      "External Status": e.externalStatus || "",
      "Match Confidence": e.matchConfidence || "",
      "Is Pitch Target": e.isPitchTarget ? "Yes" : "No",
      "Sales Notes": e.salesNotes || "",
      "Last Verified": e.lastVerifiedAt ? e.lastVerifiedAt.toISOString() : "",
      "Updated At": e.updatedAt.toISOString(),
    }));
    
    const csv = arrayToCSV(csvData);
    
    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="companies-${type}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting companies:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}


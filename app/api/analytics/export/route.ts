
import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/app/services/AnalyticsService";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        let data: any[] = [];
        let filename = "export.csv";

        if (type === "trends") {
            // Weekly Hiring Trends
            const forecastData = await AnalyticsService.getForecast(7);
            data = forecastData.forecast.map(f => ({
                Date: f.date,
                Predicted_Count: f.predictedCount
            }));
            filename = "weekly_hiring_trends.csv";
        }
        else if (type === "leads") {
            // High Intent Company Leads
            const companies = await AnalyticsService.getCompanyIntentScores();
            data = companies.map(c => ({
                Company: c.company,
                Intent_Score: c.intentScore,
                Recent_Jobs: c.recentCount,
                Total_Jobs: c.totalCount,
                Verdict: c.verdict
            }));
            filename = "company_leads.csv";
        }

        // Convert JSON to CSV with Governance Metadata
        if (data.length > 0) {
            const watermark = `PLATFORM_WATERMARK: Nepal Job Finder - Admin Intelligence Export`;
            const generatedAt = `GENERATED_AT: ${new Date().toLocaleString()}`;
            const confidentiality = `CONFIDENTIALITY: Internal Use Only - Platform IP Protected`;

            const metadataHeader = `# ${watermark}\n# ${generatedAt}\n# ${confidentiality}\n\n`;

            const headers = Object.keys(data[0]).join(",");
            const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
            const csv = `${metadataHeader}${headers}\n${rows}`;

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="${filename}"`
                }
            });
        }

        return NextResponse.json({ error: "No data found" }, { status: 404 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

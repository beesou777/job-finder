
import { NextResponse } from "next/server";
import { AnalyticsService } from "@/app/services/AnalyticsService";
import { AlertService } from "@/app/services/AlertService";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "30d"; // 7d, 30d, 90d

        // Fetch all data in parallel
        const [
            overview,
            growthTrends,
            sourceStats,
            categoryStats,
            jobTypeStats,
            locationStats,
            companyStats,
            seoInsights,
            alerts,
            forecast,
            indices,
            intentScores
        ] = await Promise.all([
            AnalyticsService.getExecutiveOverview(),
            AnalyticsService.getGrowthTrends(range === "7d" ? 7 : 30),
            AnalyticsService.getSourceStats(),
            AnalyticsService.getCategoryStats(),
            AnalyticsService.getJobTypeStats(),
            AnalyticsService.getLocationStats(),
            AnalyticsService.getCompanyStats(),
            AnalyticsService.getSeoInsights(),
            AlertService.checkSystemHealth(),
            AnalyticsService.getForecast(7),
            AnalyticsService.getMarketIndices(),
            AnalyticsService.getCompanyIntentScores()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                overview,
                growthTrends,
                sourceStats,
                categoryStats,
                jobTypeStats,
                locationStats,
                companyStats,
                seoInsights,
                alerts,
                forecast,
                indices,
                intentScores
            }
        });
    } catch (error: any) {
        console.error("Analytics API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

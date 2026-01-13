
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
            AnalyticsService.getGrowthTrends(range === "7d" ? 7 : range === "90d" ? 90 : 30),
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

        // Get strong matches count from enriched companies
        let strongMatchesCount = 0;
        try {
            const enrichedResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/companies/enriched-from-jobs`, {
                cache: 'no-store',
            });
            if (enrichedResponse.ok) {
                const enrichedData = await enrichedResponse.json();
                if (enrichedData.success && enrichedData.data) {
                    // Count companies with 90%+ match confidence
                    strongMatchesCount = enrichedData.data.filter((c: any) => 
                        c.matchConfidence && c.matchConfidence >= 90
                    ).length;
                }
            }
        } catch (error) {
            console.error("Error fetching strong matches:", error);
        }

        // Update overview with strong matches count
        const overviewWithStrongMatches = {
            ...overview,
            strongMatches: strongMatchesCount
        };

        return NextResponse.json({
            success: true,
            data: {
                overview: overviewWithStrongMatches,
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
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
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

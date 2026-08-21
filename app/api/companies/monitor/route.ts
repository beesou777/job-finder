import { NextRequest, NextResponse } from "next/server";
import {
  monitorAllCareerPages,
  monitorHighIntentCareerPages,
} from "@/app/services/CareerPageMonitoringService";

export const dynamic = "force-dynamic";

/**
 * POST /api/companies/monitor
 * Trigger career page monitoring (manual trigger for testing)
 *
 * Note: In production, this should be a scheduled job (cron, queue worker, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const scope = body.scope || "all"; // "all" or "high-intent"

    if (scope === "high-intent") {
      const result = await monitorHighIntentCareerPages();
      return NextResponse.json({
        success: true,
        scope: "high-intent",
        result,
      });
    } else {
      const result = await monitorAllCareerPages();
      return NextResponse.json({
        success: true,
        scope: "all",
        result,
      });
    }
  } catch (error: any) {
    console.error("Error monitoring career pages:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

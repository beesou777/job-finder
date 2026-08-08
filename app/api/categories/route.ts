import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/data-fetching";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const requestedLimit = Number.parseInt(params.get("limit") || "20", 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 20;
    const categories = await getCategories({ popular: params.get("popular") === "true", limit });
    const response = NextResponse.json({ success: true, data: categories, total: categories.length });
    response.headers.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
    return response;
  } catch (error: any) {
    console.error("Error fetching categories:", error?.message || error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

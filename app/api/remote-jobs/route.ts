import { NextRequest, NextResponse } from "next/server";

import { fetchRemoteJobsFromAPI } from "@/lib/data-fetching";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "21");

    try {
        const data = await fetchRemoteJobsFromAPI(page, limit);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Proxy error fetching remote jobs:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

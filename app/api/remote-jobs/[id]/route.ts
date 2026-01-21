import { NextRequest, NextResponse } from "next/server";

import { fetchRemoteJobDetailsFromAPI } from "@/lib/data-fetching";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    try {
        const data = await fetchRemoteJobDetailsFromAPI(id);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Proxy error fetching remote job details for ${id}:`, error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

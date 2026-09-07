import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/server/services/data-fetching";
import { addUtmParams } from "@/lib/utils";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await getJobById(params.id);

    if (!job) {
      return NextResponse.redirect(new URL("/jobs", request.url));
    }

    const redirectUrl = addUtmParams(job.applyUrl, job.source, job.id);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error redirecting to job:", error);
    return NextResponse.redirect(new URL("/jobs", request.url));
  }
}

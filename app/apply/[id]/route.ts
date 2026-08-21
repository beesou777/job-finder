import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/server/db/entities/Job";
import { addUtmParams } from "@/lib/utils";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const job = await jobRepository.findOne({ where: { id: params.id } });

    if (!job) {
      return NextResponse.redirect(new URL("/jobs", request.url));
    }

    return NextResponse.redirect(addUtmParams(job.applyUrl, job.source, job.id), {
      status: 302,
    });
  } catch (error) {
    console.error("Error redirecting to job:", error);
    return NextResponse.redirect(new URL("/jobs", request.url));
  }
}

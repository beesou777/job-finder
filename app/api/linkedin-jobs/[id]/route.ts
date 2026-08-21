import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { LinkedInJob } from "@/server/db/entities/LinkedInJob";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataSource = await getDataSource();
    const linkedInJobRepository = dataSource.getRepository(LinkedInJob);

    const job = await linkedInJobRepository.findOne({
      where: { id: parseInt(params.id) },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        job_id: job.job_id,
        title: job.title,
        company: job.company,
        company_link: job.company_link,
        place: job.place,
        job_date: job.job_date,
        job_link: job.job_link,
        apply_link: job.apply_link,
        description: job.description,
        insights: job.insights,
        created_at: job.created_at,
      },
    });
  } catch (error: any) {
    console.error("Error fetching LinkedIn job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch LinkedIn job",
      },
      { status: 500 },
    );
  }
}

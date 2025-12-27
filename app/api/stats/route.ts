import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";

export async function GET() {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    const total = await jobRepository.count();

    const bySource = await jobRepository
      .createQueryBuilder("job")
      .select("job.source", "source")
      .addSelect("COUNT(*)", "count")
      .groupBy("job.source")
      .getRawMany();

    return NextResponse.json({
      success: true,
      data: {
        total,
        bySource,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}


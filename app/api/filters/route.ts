import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Job, JobTypeEnum } from "@/entities/Job";

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // Filter by job type if provided
    const now = new Date();

    // Build base query
    let query = jobRepository
      .createQueryBuilder("job")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

    if (type) {
      query = query.andWhere("job.type = :type", { type });
    }

    // Get unique job types (employment types like Full-time, Part-time, Contract, Remote, Hybrid, etc.)
    const jobTypesQuery = query.clone();
    const jobTypes = await jobTypesQuery
      .select("job.jobType", "jobType")
      .addSelect("COUNT(*)", "count")
      .andWhere("job.jobType IS NOT NULL AND job.jobType != ''")
      .groupBy("job.jobType")
      .orderBy("COUNT(*)", "DESC")
      .getRawMany();

    // Get unique locations (non-null, non-empty)
    const locationsQuery = query.clone();
    const locations = await locationsQuery
      .select("job.location", "location")
      .addSelect("COUNT(*)", "count")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
      .andWhere("job.location IS NOT NULL AND job.location != ''")
      .groupBy("job.location")
      .orderBy("COUNT(*)", "DESC")
      .limit(50) // Limit to top 50 locations
      .getRawMany();

    // Map job types to enum values with labels
    const jobTypeLabels: Record<JobTypeEnum, string> = {
      [JobTypeEnum.FULL_TIME]: "Full time",
      [JobTypeEnum.PART_TIME]: "Part time",
      [JobTypeEnum.CONTRACT]: "Contract",
      [JobTypeEnum.REMOTE]: "Remote",
      [JobTypeEnum.HYBRID]: "Hybrid",
      [JobTypeEnum.ONSITE]: "On-Site",
      [JobTypeEnum.FREELANCE]: "Freelance",
      [JobTypeEnum.TEMPORARY]: "Temporary",
      [JobTypeEnum.INTERNSHIP]: "Internship",
    };

    // Group job types by enum value and sum counts
    const jobTypeMap = new Map<JobTypeEnum, number>();
    jobTypes.forEach((jt: any) => {
      const jobTypeValue = jt.jobType as JobTypeEnum;
      if (jobTypeValue && Object.values(JobTypeEnum).includes(jobTypeValue)) {
        const currentCount = jobTypeMap.get(jobTypeValue) || 0;
        jobTypeMap.set(jobTypeValue, currentCount + parseInt(jt.count || 0));
      }
    });

    // Convert to array and sort by count
    const normalizedJobTypes = Array.from(jobTypeMap.entries())
      .map(([value, count]) => ({ 
        value, 
        label: jobTypeLabels[value] || value, 
        count 
      }))
      .sort((a, b) => b.count - a.count);

    const response = NextResponse.json({
      success: true,
      data: {
        jobTypes: normalizedJobTypes,
        locations: locations.map((l: any) => ({
          value: l.location,
          label: l.location,
          count: parseInt(l.count) || 0,
        })),
      },
    });

    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error: any) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch filters",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

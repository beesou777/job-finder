import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { LinkedInJob } from "@/entities/LinkedInJob";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const dataSource = await getDataSource();
    const linkedInJobRepository = dataSource.getRepository(LinkedInJob);

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const company = searchParams.get("company") || "";
    const place = searchParams.get("place") || "";
    const datePosted = searchParams.get("datePosted") || "";
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Build query
    let query = linkedInJobRepository.createQueryBuilder("job");

    // Apply filters
    if (search) {
      query = query.andWhere(
        "(job.title ILIKE :search OR job.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (company) {
      query = query.andWhere("job.company ILIKE :company", {
        company: `%${company}%`,
      });
    }

    if (place) {
      query = query.andWhere("job.place ILIKE :place", {
        place: `%${place}%`,
      });
    }

    // Date posted filter
    if (datePosted) {
      switch (datePosted) {
        case "today": {
          const todayEnd = new Date(now);
          todayEnd.setHours(23, 59, 59, 999);
          query = query.andWhere("job.job_date >= :todayStart AND job.job_date <= :todayEnd", {
            todayStart: now,
            todayEnd,
          });
          break;
        }
        case "3days": {
          const threeDaysAgo = new Date(now);
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          query = query.andWhere("job.job_date >= :threeDaysAgo", {
            threeDaysAgo,
          });
          break;
        }
        case "7days": {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          query = query.andWhere("job.job_date >= :sevenDaysAgo", {
            sevenDaysAgo,
          });
          break;
        }
        case "30days": {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          query = query.andWhere("job.job_date >= :thirtyDaysAgo", {
            thirtyDaysAgo,
          });
          break;
        }
      }
    }

    // Get total count
    const total = await query.getCount();

    // Order by job_date descending (newest first), then by created_at
    query = query
      .orderBy("job.job_date", "DESC", "NULLS LAST")
      .addOrderBy("job.created_at", "DESC");

    // Apply pagination
    const jobs = await query.skip(offset).take(limit).getMany();

    // Get unique companies and places for filters
    const companiesQuery = linkedInJobRepository
      .createQueryBuilder("job")
      .select("job.company", "company")
      .addSelect("COUNT(*)", "count")
      .where("job.company IS NOT NULL AND job.company != ''")
      .groupBy("job.company")
      .orderBy("COUNT(*)", "DESC")
      .limit(50);

    const placesQuery = linkedInJobRepository
      .createQueryBuilder("job")
      .select("job.place", "place")
      .addSelect("COUNT(*)", "count")
      .where("job.place IS NOT NULL AND job.place != ''")
      .groupBy("job.place")
      .orderBy("COUNT(*)", "DESC")
      .limit(50);

    const [companies, places] = await Promise.all([
      companiesQuery.getRawMany(),
      placesQuery.getRawMany(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs.map((job) => ({
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
        })),
        filters: {
          companies: companies.map((c: any) => ({
            value: c.company,
            count: parseInt(c.count),
          })),
          places: places.map((p: any) => ({
            value: p.place,
            count: parseInt(p.count),
          })),
        },
      },
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Error fetching LinkedIn jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch LinkedIn jobs",
      },
      { status: 500 }
    );
  }
}


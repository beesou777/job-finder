import "reflect-metadata";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { Category } from "@/entities/Category";
import { LinkedInJob } from "@/entities/LinkedInJob";

export interface GetJobsOptions {
    jobType?: string | null;
    urgency?: string | null;
    type?: string | null;
    categoryId?: string | null;
    location?: string | null;
    search?: string | null;
    limit?: number;
    offset?: number;
}

async function getJobsUncached(options: GetJobsOptions = {}) {
    const {
        jobType,
        urgency,
        type,
        categoryId,
        location,
        search,
        limit: requestedLimit = 12,
        offset: requestedOffset = 0,
    } = options;
    const limit = Math.min(50, Math.max(1, requestedLimit));
    const offset = Math.min(10000, Math.max(0, requestedOffset));

    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const now = new Date();

    let query = jobRepository
        .createQueryBuilder("job")
        .leftJoin("job.category", "category")
        .select([
            "job.id", "job.title", "job.company", "job.location", "job.applyUrl",
            "job.type", "job.createdAt", "job.postedAt", "job.expiresAt", "job.deadline",
            "job.lastVerifiedAt", "job.deadlineConfidence", "job.qualityScore",
            "job.salaryText", "job.jobType", "job.source",
            "category.id", "category.name", "category.slug",
        ])
        .where("job.isActive = true")
        .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

    if (jobType) {
        query = query.andWhere("job.jobType = :jobType", { jobType });
    }

    if (urgency) {
        switch (urgency) {
            case "today":
                const todayEnd = new Date(now);
                todayEnd.setHours(23, 59, 59, 999);
                query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :todayEnd", { now, todayEnd });
                break;
            case "3days":
                const threeDaysFromNow = new Date(now);
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                threeDaysFromNow.setHours(23, 59, 59, 999);
                query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :threeDaysFromNow", { now, threeDaysFromNow });
                break;
            case "7days":
                const sevenDaysFromNow = new Date(now);
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                sevenDaysFromNow.setHours(23, 59, 59, 999);
                query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :sevenDaysFromNow", { now, sevenDaysFromNow });
                break;
            case "30days":
                const thirtyDaysFromNow = new Date(now);
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                thirtyDaysFromNow.setHours(23, 59, 59, 999);
                query = query.andWhere("job.expiresAt >= :now AND job.expiresAt <= :thirtyDaysFromNow", { now, thirtyDaysFromNow });
                break;
        }
    }

    if (type) {
        query = query.andWhere("job.type = :type", { type });
    }

    if (categoryId) {
        query = query.andWhere("job.categoryId = :categoryId", { categoryId });
    }

    if (location) {
        query = query.andWhere("job.location ILIKE :location", { location: `%${location}%` });
    }

    if (search) {
        query = query.andWhere(
            "(job.title ILIKE :search OR job.company ILIKE :search OR category.name ILIKE :search OR job.description ILIKE :search)",
            { search: `%${search}%` }
        );
    }

    const total = await query.clone().getCount();

    if (urgency) {
        query = query
            .orderBy("job.expiresAt", "ASC", "NULLS LAST")
            .addOrderBy("job.postedAt", "DESC", "NULLS LAST")
            .addOrderBy("job.createdAt", "DESC");
    } else {
        query = query
            .orderBy("job.postedAt", "DESC", "NULLS LAST")
            .addOrderBy("job.createdAt", "DESC");
    }

    const jobsEntities = await query
        .skip(offset)
        .take(limit)
        .getMany();

    const jobs = jobsEntities.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        applyUrl: job.applyUrl,
        type: job.type,
        createdAt: job.createdAt,
        postedAt: job.postedAt || job.createdAt,
        expiresAt: job.expiresAt,
        deadline: job.deadline,
        lastVerifiedAt: job.lastVerifiedAt,
        deadlineConfidence: job.deadlineConfidence,
        qualityScore: job.qualityScore,
        salaryText: job.salaryText || "Negotiable",
        jobType: job.jobType,
        source: job.source,
        category: job.category ? {
            id: job.category.id,
            name: job.category.name,
            slug: job.category.slug,
        } : null,
    }));

    return { jobs, total };
}

/** Cached getJobs - 5 min revalidate to reduce DB egress */
export async function getJobs(options: GetJobsOptions = {}) {
  const allowedUrgencies = new Set(["today", "3days", "7days", "30days"]);
  const allowedTypes = new Set(["job", "internship"]);
  const normalizedOptions: GetJobsOptions = {
    ...options,
    limit: Math.min(50, Math.max(1, options.limit ?? 12)),
    offset: Math.min(10000, Math.max(0, options.offset ?? 0)),
    search: options.search?.trim().slice(0, 100) || undefined,
    location: options.location?.trim().slice(0, 80) || undefined,
    urgency: options.urgency && allowedUrgencies.has(options.urgency) ? options.urgency : undefined,
    type: options.type && allowedTypes.has(options.type) ? options.type : undefined,
    categoryId: options.categoryId && /^[0-9a-f-]{36}$/i.test(options.categoryId) ? options.categoryId : undefined,
    jobType: options.jobType?.trim().slice(0, 30) || undefined,
  };
  const key = [
    "jobs",
    String(normalizedOptions.limit),
    String(normalizedOptions.offset),
    String(normalizedOptions.type ?? ""),
    String(normalizedOptions.search ?? ""),
    String(normalizedOptions.categoryId ?? ""),
    String(normalizedOptions.location ?? ""),
    String(normalizedOptions.jobType ?? ""),
    String(normalizedOptions.urgency ?? ""),
  ];
  return unstable_cache(
    () => getJobsUncached(normalizedOptions),
    key,
    { revalidate: 600, tags: ["jobs"] }
  )();
}

async function getStatsUncached() {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const now = new Date();

    const statsResults = await jobRepository
        .createQueryBuilder("job")
        .select("job.type", "type")
        .addSelect("COUNT(*)", "count")
        .where("job.isActive = true")
        .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
        .groupBy("job.type")
        .getRawMany();

    let totalJobs = 0;
    let totalInternships = 0;

    for (const stat of statsResults) {
        if (stat.type === "job") {
            totalJobs = parseInt(stat.count) || 0;
        } else if (stat.type === "internship") {
            totalInternships = parseInt(stat.count) || 0;
        }
    }

    return {
        total: totalJobs + totalInternships,
        totalJobs,
        totalInternships,
    };
}

/** Cached getStats - 5 min to reduce egress */
export async function getStats() {
    return unstable_cache(getStatsUncached, ["stats"], { revalidate: 1800, tags: ["jobs"] })();
}

async function getCategoriesUncached(options: { popular?: boolean; limit?: number } = {}) {
    const { popular = false, limit = 20 } = options;
    const dataSource = await getDataSource();
    const categoryRepository = dataSource.getRepository(Category);

    let categories;
    if (popular) {
        const categoriesWithJobs = await categoryRepository
            .createQueryBuilder("categories")
            .leftJoin("categories.jobs", "job")
            .where("job.isActive = true")
            .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now: new Date() })
            .select("categories.id", "id")
            .addSelect("categories.name", "name")
            .addSelect("categories.slug", "slug")
            .addSelect("COUNT(job.id)", "jobCount")
            .groupBy("categories.id")
            .having("COUNT(job.id) > 0")
            .orderBy("COUNT(job.id)", "DESC")
            .limit(limit)
            .getRawMany();

        categories = categoriesWithJobs.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            jobCount: parseInt(c.jobCount) || 0,
        }));

        if (categories.length === 0) {
            const allCategories = await categoryRepository.find({
                order: { name: "ASC" },
                take: limit,
            });
            categories = allCategories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                jobCount: 0,
            }));
        }
    } else {
        const allCategoriesWithCounts = await categoryRepository
            .createQueryBuilder("categories")
            .leftJoin("categories.jobs", "job")
            .select("categories.id", "id")
            .addSelect("categories.name", "name")
            .addSelect("categories.slug", "slug")
            .addSelect("COUNT(job.id)", "jobCount")
            .groupBy("categories.id")
            .orderBy("categories.name", "ASC")
            .limit(limit)
            .getRawMany();

        categories = allCategoriesWithCounts.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            jobCount: parseInt(c.jobCount) || 0,
        }));
    }

    return categories;
}

/** Cached getCategories - 5 min to reduce egress */
export async function getCategories(options: { popular?: boolean; limit?: number } = {}) {
    const key = ["categories", String(options.popular ?? false), String(options.limit ?? 20)];
    return unstable_cache(
        () => getCategoriesUncached(options),
        key,
        { revalidate: 1800, tags: ["jobs", "categories"] }
    )();
}

export const getLinkedInJobs = cache(async (options: {
    search?: string | null;
    company?: string | null;
    place?: string | null;
    datePosted?: string | null;
    limit?: number;
    offset?: number;
} = {}) => {
    const {
        search,
        company,
        place,
        datePosted,
        limit = 20,
        offset = 0,
    } = options;

    const dataSource = await getDataSource();
    const linkedinRepository = dataSource.getRepository(LinkedInJob);
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let query = linkedinRepository.createQueryBuilder("job")
        .where("job.job_date >= :thirtyDaysAgo", { thirtyDaysAgo });

    if (search) {
        query = query.andWhere(
            "(job.title ILIKE :search OR job.company ILIKE :search OR job.description ILIKE :search)",
            { search: `%${search}%` }
        );
    }

    if (company) {
        query = query.andWhere("job.company = :company", { company });
    }

    if (place) {
        query = query.andWhere("job.place ILIKE :place", { place: `%${place}%` });
    }

    if (datePosted) {
        const now = new Date();
        switch (datePosted) {
            case "today":
                query = query.andWhere("job.job_date >= :today", {
                    today: new Date(now.setHours(0, 0, 0, 0)),
                });
                break;
            case "3days":
                const threeDaysAgo = new Date(now);
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                query = query.andWhere("job.job_date >= :date", { date: threeDaysAgo });
                break;
            case "7days":
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                query = query.andWhere("job.job_date >= :date", { date: sevenDaysAgo });
                break;
            case "30days":
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                query = query.andWhere("job.job_date >= :date", { date: thirtyDaysAgo });
                break;
        }
    }

    const total = await query.clone().getCount();

    const jobs = await query
        .orderBy("job.job_date", "DESC")
        .addOrderBy("job.id", "DESC") // Use ID or created_at
        .skip(offset)
        .take(limit)
        .getMany();

    // Get filter counts for sidebar
    const companies = await linkedinRepository
        .createQueryBuilder("job")
        .select("job.company", "value")
        .addSelect("COUNT(*)", "count")
        .groupBy("job.company")
        .orderBy("COUNT(*)", "DESC")
        .limit(20)
        .getRawMany();

    const places = await linkedinRepository
        .createQueryBuilder("job")
        .select("job.place", "value")
        .addSelect("COUNT(*)", "count")
        .groupBy("job.place")
        .orderBy("COUNT(*)", "DESC")
        .limit(20)
        .getRawMany();

    return {
        jobs,
        total,
        filters: {
            companies: companies.map(c => ({ value: c.value, count: parseInt(c.count) })),
            places: places.map(p => ({ value: p.value, count: parseInt(p.count) }))
        }
    };
});

export const getLinkedInJobDetails = cache(async (id: number) => {
    const dataSource = await getDataSource();
    const linkedinRepository = dataSource.getRepository(LinkedInJob);
    return await linkedinRepository.findOne({ where: { id } });
});

// Fetch AmbitionPad API directly (no CORS proxy - server-side has no CORS restrictions)
// corsproxy.io free tier only works on localhost; direct fetch works in production
async function fetchRemoteJobsFromAPI(page: number, limit: number, search: string) {
    const url = `https://api.ambitionpad.com/api/v1/search/browsejobs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; kamkhoj/1.0; +https://www.kamkhoj.com)",
            "Accept": "application/json",
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "No error body");
        throw new Error(`AmbitionPad Fetch Failed: ${response.status} - ${text.substring(0, 150)}`);
    }
    return await response.json();
}

async function fetchRemoteJobDetailsFromAPI(id: string) {
    const url = `https://api.ambitionpad.com/api/v1/jobs/job/${id}`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; kamkhoj/1.0; +https://www.kamkhoj.com)",
            "Accept": "application/json",
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "No error body");
        throw new Error(`AmbitionPad Detail Fetch Failed: ${response.status} - ${text.substring(0, 150)}`);
    }
    return await response.json();
}

export const getRemoteJobs = cache(async (options: { page?: number; limit?: number; search?: string } = {}) => {
    const page = options.page || 1;
    const limit = options.limit || 21;
    const search = options.search || "";
    try {
        // Call the API directly from the server to avoid localhost proxy issues in RSCs
        const data:any = await fetchRemoteJobsFromAPI(page, limit,search);

        return {
            jobs: data?.data?.jobs || [],
            total: data?.data?.pagination?.total || 0,
            pagination: data?.data?.pagination || null
        };
    } catch (error) {
        console.error("Error fetching remote jobs:", error);
        return { jobs: [], total: 0 };
    }
});

export const getRemoteJobDetails = cache(async (id: string) => {
    try {
        // Call the API directly from the server
        const data:any = await fetchRemoteJobDetailsFromAPI(id);
        return data?.data || null;
    } catch (error) {
        console.error("Error fetching remote job details:", error);
        return null;
    }
});

// For API routes to reuse the same logic
export { fetchRemoteJobsFromAPI, fetchRemoteJobDetailsFromAPI };

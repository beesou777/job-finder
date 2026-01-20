import "reflect-metadata";
import { cache } from "react";
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

export async function getJobs(options: GetJobsOptions = {}) {
    const {
        jobType,
        urgency,
        type,
        categoryId,
        location,
        search,
        limit = 12,
        offset = 0,
    } = options;

    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const now = new Date();

    let query = jobRepository
        .createQueryBuilder("job")
        .leftJoinAndSelect("job.category", "category")
        .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

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

export async function getStats() {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const now = new Date();

    const statsResults = await jobRepository
        .createQueryBuilder("job")
        .select("job.type", "type")
        .addSelect("COUNT(*)", "count")
        .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
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

export async function getCategories(options: { popular?: boolean; limit?: number } = {}) {
    const { popular = false, limit = 20 } = options;
    const dataSource = await getDataSource();
    const categoryRepository = dataSource.getRepository(Category);

    let categories;
    if (popular) {
        const categoriesWithJobs = await categoryRepository
            .createQueryBuilder("category")
            .leftJoin("category.jobs", "job")
            .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now: new Date() })
            .select("category.id", "id")
            .addSelect("category.name", "name")
            .addSelect("category.slug", "slug")
            .addSelect("COUNT(job.id)", "jobCount")
            .groupBy("category.id")
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
            .createQueryBuilder("category")
            .leftJoin("category.jobs", "job")
            .select("category.id", "id")
            .addSelect("category.name", "name")
            .addSelect("category.slug", "slug")
            .addSelect("COUNT(job.id)", "jobCount")
            .groupBy("category.id")
            .orderBy("category.name", "ASC")
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

export const getRemoteJobs = cache(async (options: { page?: number; limit?: number } = {}) => {
    const page = options.page || 1;
    const limit = options.limit || 21;

    try {
        const response = await fetch(`https://api.ambitionpad.com/api/v1/search/browsejobs?page=${page}&limit=${limit}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) throw new Error("Failed to fetch remote jobs");
        const data = await response.json();

        return {
            jobs: data.data.jobs || [],
            total: data.data.pagination?.total || 0,
            pagination: data.data.pagination
        };
    } catch (error) {
        console.error("Error fetching remote jobs:", error);
        return { jobs: [], total: 0 };
    }
});

export const getRemoteJobDetails = cache(async (id: string) => {
    try {
        const response = await fetch(`https://api.ambitionpad.com/api/v1/jobs/job/${id}`, {
            next: { revalidate: 3600 }
        });

        if (!response.ok) throw new Error("Failed to fetch remote job details");
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching remote job details:", error);
        return null;
    }
});

import { getDataSource } from "@/lib/db";
import { Job } from "@/server/db/entities/Job";
import { LinkedInJob } from "@/server/db/entities/LinkedInJob";
import { Category } from "@/server/db/entities/Category";
export interface JobSearchParams {
  search?: string;
  location?: string;
  jobType?: string;
  type?: "job" | "internship" | "all";
  limit?: number;
}

export interface JobSearchResult {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  applyUrl: string;
  type: "job" | "internship" | "linkedin";
  jobType: string | null;
  salaryText?: string;
  source: string;
  category?: string | null;
  description?: string | null;
  expiresAt?: Date | null;
  postedAt?: Date | null;
}

/**
 * Build search: require at least ONE term to match TITLE or CATEGORY (role relevance).
 * This avoids matching jobs where the keyword only appears tangentially in description
 * (e.g. "designer" matching "content strategies" jobs that mention "design" in description).
 */
function buildSearchConditions(
  search: string,
  prefix: string,
  useOr = false
): { sql: string; params: Record<string, string> } {
  const terms = search.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { sql: "1=1", params: {} };
  const joinOp = useOr ? " OR " : " AND ";

  const params: Record<string, string> = {};
  terms.forEach((term, i) => {
    params[`term${i}`] = `%${term}%`;
  });

  if (prefix === "job") {
    const matchConditions = terms
      .map(
        (_, i) =>
          `(job.title ILIKE :term${i} OR category.name ILIKE :term${i} OR job.company ILIKE :term${i} OR job.description ILIKE :term${i} OR job.requirements ILIKE :term${i})`
      )
      .join(joinOp);
    return {
      sql: `(${matchConditions})`,
      params,
    };
  }
  const conditions = terms
    .map(
      (_, i) =>
        `(lj.title ILIKE :term${i} OR lj.company ILIKE :term${i} OR lj.place ILIKE :term${i} OR lj.description ILIKE :term${i})`
    )
    .join(joinOp);
  const titleMatch = terms.map((_, i) => `lj.title ILIKE :term${i}`).join(" OR ");
  return {
    sql: `(${conditions}) AND (${titleMatch})`,
    params,
  };
}

/**
 * Search jobs from the database - used by AI chat
 */
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult[]> {
  const dataSource = await getDataSource();
  const jobRepository = dataSource.getRepository(Job);

  const { search, location, jobType, type = "job", limit = 10 } = params;
  const now = new Date();

  let query = jobRepository
    .createQueryBuilder("job")
    .leftJoinAndSelect("job.category", "category")
    .where("job.isActive = true")
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

  if (type !== "all") {
    query = query.andWhere("job.type = :type", { type });
  }

  if (jobType) {
    query = query.andWhere("job.jobType = :jobType", { jobType });
  }
  if (location) {
    query = query.andWhere("job.location ILIKE :location", { location: `%${location}%` });
  }
  if (search?.trim()) {
    const { sql, params } = buildSearchConditions(search, "job");
    query = query.andWhere(sql, params);
    query = query.addSelect(`CASE WHEN job.title ILIKE :rankSearch THEN 0 WHEN category.name ILIKE :rankSearch THEN 1 ELSE 2 END`, "relevance");
    query = query.setParameter("rankSearch", `%${search.trim()}%`);
  }

  const jobs = await query
    .orderBy("relevance", "ASC")
    .addOrderBy("job.postedAt", "DESC", "NULLS LAST")
    .addOrderBy("job.createdAt", "DESC")
    .take(limit)
    .getMany();

  const results = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    applyUrl: job.applyUrl,
    type: job.type as "job" | "internship",
    jobType: job.jobType,
    salaryText: job.salaryText || "Negotiable",
    source: job.source,
    category: job.category?.name ?? null,
    description: job.description ?? null,
    expiresAt: job.expiresAt,
    postedAt: job.postedAt,
  }));
  return results;
}

/**
 * Search across ALL sources: Nepal jobs, internships, and LinkedIn jobs.
 * Thinks like a human - searches descriptions, titles, requirements.
 */
export async function searchAllJobs(params: JobSearchParams): Promise<JobSearchResult[]> {
  const { search, location, jobType, type = "all", limit = 12 } = params;
  const perSource = Math.ceil(limit / 2);

  const dataSource = await getDataSource();
  const jobRepo = dataSource.getRepository(Job);
  const linkedInRepo = dataSource.getRepository(LinkedInJob);
  const now = new Date();

  // 1. Nepal jobs + internships (both if type is "all")
  let jobsQuery = jobRepo
    .createQueryBuilder("job")
    .leftJoinAndSelect("job.category", "category")
    .where("job.isActive = true")
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now });

  if (type !== "all") {
    jobsQuery = jobsQuery.andWhere("job.type = :type", { type });
  }
  if (jobType) {
    jobsQuery = jobsQuery.andWhere("job.jobType = :jobType", { jobType });
  }
  if (location) {
    jobsQuery = jobsQuery.andWhere("job.location ILIKE :location", { location: `%${location}%` });
  }
  if (search?.trim()) {
    const { sql, params } = buildSearchConditions(search, "job");
    jobsQuery = jobsQuery.andWhere(sql, params);
    jobsQuery = jobsQuery.addSelect(`CASE WHEN job.title ILIKE :jobRankSearch THEN 0 WHEN category.name ILIKE :jobRankSearch THEN 1 ELSE 2 END`, "relevance");
    jobsQuery = jobsQuery.setParameter("jobRankSearch", `%${search.trim()}%`);
  }

  // 2. LinkedIn jobs
  let linkedInQuery = linkedInRepo.createQueryBuilder("lj");
  if (search?.trim()) {
    const { sql, params } = buildSearchConditions(search, "linkedin");
    linkedInQuery = linkedInQuery.andWhere(sql, params);
  }
  if (location) {
    linkedInQuery = linkedInQuery.andWhere("lj.place ILIKE :location", {
      location: `%${location}%`,
    });
  }

  let [nepalJobs, linkedInJobs] = await Promise.all([
    jobsQuery
      .orderBy("relevance", "ASC")
      .addOrderBy("job.postedAt", "DESC", "NULLS LAST")
      .take(perSource)
      .getMany(),
    linkedInQuery
      .orderBy("lj.job_date", "DESC", "NULLS LAST")
      .take(perSource)
      .getMany(),
  ]);

  if (nepalJobs.length === 0 && linkedInJobs.length === 0 && search?.trim()) {
    const terms = search.trim().split(/\s+/).filter(Boolean);
    if (terms.length >= 2) {
      const fallbackSearch = terms.slice(0, 3).join(" ");
      const { sql: jobSql, params: jobParams } = buildSearchConditions(fallbackSearch, "job", true);
      const { sql: liSql, params: liParams } = buildSearchConditions(fallbackSearch, "linkedin", true);
      let fallbackJobsQ = jobRepo
        .createQueryBuilder("job")
        .leftJoinAndSelect("job.category", "category")
        .where("job.isActive = true")
        .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
        .andWhere(jobSql, jobParams);
      let fallbackLiQ = linkedInRepo.createQueryBuilder("lj").andWhere(liSql, liParams);
      if (type !== "all") fallbackJobsQ = fallbackJobsQ.andWhere("job.type = :type", { type });
      if (jobType) fallbackJobsQ = fallbackJobsQ.andWhere("job.jobType = :jobType", { jobType });
      if (location) {
        fallbackJobsQ = fallbackJobsQ.andWhere("job.location ILIKE :location", { location: `%${location}%` });
        fallbackLiQ = fallbackLiQ.andWhere("lj.place ILIKE :location", { location: `%${location}%` });
      }
      [nepalJobs, linkedInJobs] = await Promise.all([
        fallbackJobsQ.orderBy("job.postedAt", "DESC", "NULLS LAST").take(perSource).getMany(),
        fallbackLiQ.orderBy("lj.job_date", "DESC", "NULLS LAST").take(perSource).getMany(),
      ]);
    }
  }

  let results: JobSearchResult[] = [
    ...nepalJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      applyUrl: job.applyUrl,
      type: job.type as "job" | "internship",
      jobType: job.jobType,
      salaryText: job.salaryText || "Negotiable",
      source: job.source,
      category: job.category?.name ?? null,
      description: job.description ?? null,
      expiresAt: job.expiresAt,
      postedAt: job.postedAt,
    })),
    ...linkedInJobs.map((job) => ({
      id: `linkedin-${job.id}`,
      title: job.title,
      company: job.company,
      location: job.place,
      applyUrl: job.apply_link || job.job_link || "",
      type: "linkedin" as const,
      jobType: null,
      salaryText: undefined,
      source: "LinkedIn",
      category: null,
      description: job.description ?? null,
      expiresAt: null,
      postedAt: job.job_date,
    })),
  ];

  return results.slice(0, limit);
}

/**
 * Broader search when no exact matches - uses role keyword or "developer" to find similar jobs.
 * Avoids framework-only terms so we don't filter to 0 again.
 */
export async function searchSimilarJobs(params: JobSearchParams): Promise<JobSearchResult[]> {
  const terms = (params.search || "").trim().split(/\s+/).filter(Boolean);
  const similarKeyword = terms[0] || "jobs";
  return searchAllJobs({
    ...params,
    search: similarKeyword,
    location: params.location,
    jobType: undefined,
  });
}

/** Fetch schema info for AI - categories, searchable fields */
export async function getJobSearchSchema(): Promise<{
  categories: string[];
  schema: string;
}> {
  const dataSource = await getDataSource();
  const categoryRepo = dataSource.getRepository(Category);
  const categories = await categoryRepo.find({ select: ["name"], order: { name: "ASC" } });
  const categoryNames = categories.map((c) => c.name).filter(Boolean);

  const schema = `DATABASE SCHEMA (PostgreSQL):
- jobs: id, title, company, location, salaryText, jobType, type (job|internship), description, requirements, categoryId, source, postedAt
- linkedin_jobs: id, title, company, place (location), description, job_date
- categories: id, name (joined to jobs via categoryId)

SEARCHABLE FIELDS (ILIKE): title, company, location/place, category.name, description, requirements
jobType enum: full-time, part-time, contract, remote, hybrid, onsite, freelance, temporary, internship
type: "job" | "internship" | "all"`;
  return { categories: categoryNames, schema };
}

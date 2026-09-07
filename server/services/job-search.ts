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
  offset?: number;
  matchAny?: boolean;
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
  useOr = false,
): { sql: string; params: Record<string, string> } {
  const terms = search.includes("|")
    ? search
        .split("|")
        .map((term) => term.trim())
        .filter(Boolean)
    : search.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { sql: "1=1", params: {} };
  const joinOp = useOr ? " OR " : " AND ";

  const aliasGroups = [
    ["frontend", "front end", "front-end"],
    ["backend", "back end", "back-end"],
    ["fullstack", "full stack", "full-stack"],
    ["mern stack", "mern-stack", "mernstack"],
  ];
  const variants = terms.map((term) => {
    const normalized = term.toLowerCase().replace(/\s+/g, " ").trim();
    const values = new Set([normalized]);
    for (const group of aliasGroups) {
      for (const alias of group) {
        if (!normalized.includes(alias)) continue;
        for (const replacement of group) {
          values.add(normalized.replace(alias, replacement));
        }
      }
    }
    return [...values];
  });

  const params: Record<string, string> = {};
  variants.forEach((termVariants, termIndex) => {
    termVariants.forEach((variant, variantIndex) => {
      params[`term${termIndex}_${variantIndex}`] = `%${variant}%`;
    });
  });

  const matchColumns = (columns: string[], termIndex: number) =>
    variants[termIndex]
      .flatMap((_, variantIndex) =>
        columns.map((column) => `${column} ILIKE :term${termIndex}_${variantIndex}`),
      )
      .join(" OR ");

  if (prefix === "job") {
    const columns = [
      "job.title",
      "category.name",
      "job.categoryOld",
      "job.company",
      "job.location",
      "job.description",
      "job.requirements",
    ];
    const matchConditions = terms.map((_, i) => `(${matchColumns(columns, i)})`).join(joinOp);
    return {
      sql: `(${matchConditions})`,
      params,
    };
  }
  const columns = ["lj.title", "lj.company", "lj.place", "lj.description"];
  const conditions = terms.map((_, i) => `(${matchColumns(columns, i)})`).join(joinOp);
  if (useOr) {
    return {
      sql: `(${conditions})`,
      params,
    };
  }
  const titleMatch = terms.map((_, i) => `(${matchColumns(["lj.title"], i)})`).join(" OR ");
  return {
    sql: `(${conditions}) AND (${titleMatch})`,
    params,
  };
}

/**
 * Builds smart location conditions for jobs and LinkedIn tables.
 * Strips redundant country names (Nepal/NP), handles comma-separated cities,
 * and matches remote opportunities.
 */
export function buildLocationConditions(
  location: string | undefined | null,
  prefix: "job" | "lj",
): { sql: string; params: Record<string, string> } | null {
  if (!location || !location.trim()) return null;

  const terms = location
    .split(/[,/|;]+/)
    .map((t) => t.trim())
    .filter((t) => {
      const lower = t.toLowerCase();
      return lower && lower !== "nepal" && lower !== "np";
    });

  if (terms.length === 0) return null;

  const params: Record<string, string> = {};
  const col = prefix === "job" ? "job.location" : "lj.place";

  const valleyAliases: Record<string, string[]> = {
    lalitpur: ["lalitpur", "patan", "kathmandu", "kathmandu valley"],
    kathmandu: ["kathmandu", "lalitpur", "kathmandu valley"],
    bhaktapur: ["bhaktapur", "kathmandu", "lalitpur", "kathmandu valley"],
  };

  const conditions: string[] = [];
  terms.forEach((term, termIdx) => {
    const lower = term.toLowerCase();
    const aliases = valleyAliases[lower] || [term];
    aliases.forEach((alias, aliasIdx) => {
      const paramName = `${prefix}Loc_${termIdx}_${aliasIdx}`;
      params[paramName] = `%${alias}%`;
      conditions.push(`${col} ILIKE :${paramName}`);
    });
  });

  // Always include remote jobs
  if (prefix === "job") {
    conditions.push("job.location ILIKE '%remote%'");
    conditions.push("job.jobType ILIKE '%remote%'");
  } else {
    conditions.push("lj.place ILIKE '%remote%'");
  }

  return {
    sql: `(${conditions.join(" OR ")})`,
    params,
  };
}

/**
 * Search jobs from the database - used by AI chat
 */
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult[]> {
  const dataSource = await getDataSource();
  const jobRepository = dataSource.getRepository(Job);

  const { search, location, jobType, type = "job", limit = 10, matchAny = false } = params;
  const now = new Date();
  const recentNullSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let query = jobRepository
    .createQueryBuilder("job")
    .leftJoinAndSelect("job.category", "category")
    .where("job.isActive = true")
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
    .andWhere("(job.expiresAt IS NOT NULL OR job.createdAt >= :recentNullSince)", {
      recentNullSince,
    });

  if (type !== "all") {
    query = query.andWhere("job.type = :type", { type });
  }

  if (jobType) {
    query = query.andWhere("job.jobType = :jobType", { jobType });
  }
  if (location) {
    const locCond = buildLocationConditions(location, "job");
    if (locCond) query = query.andWhere(locCond.sql, locCond.params);
  }
  if (search?.trim()) {
    const { sql, params } = buildSearchConditions(search, "job", matchAny);
    query = query.andWhere(sql, params);
    query = query.addSelect(
      `CASE WHEN job.title ILIKE :rankSearch THEN 0 WHEN category.name ILIKE :rankSearch THEN 1 ELSE 2 END`,
      "relevance",
    );
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
  const {
    search,
    location,
    jobType,
    type = "all",
    limit = 12,
    offset = 0,
    matchAny = false,
  } = params;
  // We merge local jobs first and LinkedIn jobs second. Each source must therefore
  // provide enough candidates to cover the requested combined page; splitting the
  // limit in half caused valid matches from either source to be silently omitted.
  const perSource = limit + offset;

  const dataSource = await getDataSource();
  const jobRepo = dataSource.getRepository(Job);
  const linkedInRepo = dataSource.getRepository(LinkedInJob);
  const now = new Date();
  const linkedinSince = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const recentNullSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const jobLocCondition = location ? buildLocationConditions(location, "job") : null;
  const liLocCondition = location ? buildLocationConditions(location, "lj") : null;

  // 1. Nepal jobs + internships (both if type is "all")
  let jobsQuery = jobRepo
    .createQueryBuilder("job")
    .leftJoinAndSelect("job.category", "category")
    .select([
      "job.id",
      "job.title",
      "job.company",
      "job.location",
      "job.applyUrl",
      "job.type",
      "job.jobType",
      "job.salaryText",
      "job.source",
      "job.expiresAt",
      "job.postedAt",
      "job.createdAt",
      "category.id",
      "category.name",
    ])
    .where("job.isActive = true")
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
    .andWhere("(job.expiresAt IS NOT NULL OR job.createdAt >= :recentNullSince)", {
      recentNullSince,
    });

  if (type !== "all") {
    jobsQuery = jobsQuery.andWhere("job.type = :type", { type });
  }
  if (jobType) {
    jobsQuery = jobsQuery.andWhere("job.jobType = :jobType", { jobType });
  }
  if (jobLocCondition) {
    jobsQuery = jobsQuery.andWhere(jobLocCondition.sql, jobLocCondition.params);
  }
  if (search?.trim()) {
    const { sql, params } = buildSearchConditions(search, "job", matchAny);
    jobsQuery = jobsQuery.andWhere(sql, params);
    jobsQuery = jobsQuery.addSelect(
      `CASE WHEN job.title ILIKE :jobRankSearch THEN 0 WHEN category.name ILIKE :jobRankSearch THEN 1 ELSE 2 END`,
      "relevance",
    );
    jobsQuery = jobsQuery.setParameter("jobRankSearch", `%${search.trim()}%`);
  }

  // 2. LinkedIn jobs
  let linkedInQuery = linkedInRepo
    .createQueryBuilder("lj")
    .select([
      "lj.id",
      "lj.title",
      "lj.company",
      "lj.place",
      "lj.apply_link",
      "lj.job_link",
      "lj.job_date",
    ])
    .where("lj.job_date >= :linkedinSince", { linkedinSince });
  if (search?.trim()) {
    const { sql, params } = buildSearchConditions(search, "linkedin", matchAny);
    linkedInQuery = linkedInQuery.andWhere(sql, params);
  }
  if (liLocCondition) {
    linkedInQuery = linkedInQuery.andWhere(liLocCondition.sql, liLocCondition.params);
  }
  if (jobType) {
    const jt = jobType.toLowerCase();
    if (jt === "remote") {
      linkedInQuery = linkedInQuery.andWhere(
        "(lj.place ILIKE :remoteP OR lj.description ILIKE :remoteP OR lj.title ILIKE :remoteP)",
        { remoteP: "%remote%" },
      );
    } else if (jt === "hybrid") {
      linkedInQuery = linkedInQuery.andWhere(
        "(lj.place ILIKE :hybridP OR lj.description ILIKE :hybridP)",
        { hybridP: "%hybrid%" },
      );
    } else if (jt === "onsite") {
      linkedInQuery = linkedInQuery.andWhere("lj.place ILIKE :onsiteP", {
        onsiteP: "%on-site%",
      });
    }
  }
  if (type === "internship") {
    linkedInQuery = linkedInQuery.andWhere(
      "(lj.title ILIKE :internP OR lj.description ILIKE :internP)",
      { internP: "%intern%" },
    );
  } else if (type === "job") {
    linkedInQuery = linkedInQuery.andWhere("lj.title NOT ILIKE :internP", {
      internP: "%intern%",
    });
  }

  let [nepalJobs, linkedInJobs] = await Promise.all([
    jobsQuery
      .orderBy("relevance", "ASC")
      .addOrderBy("job.postedAt", "DESC", "NULLS LAST")
      .take(perSource)
      .getMany(),
    linkedInQuery.orderBy("lj.job_date", "DESC", "NULLS LAST").take(perSource).getMany(),
  ]);

  // If strict 3-day window has 0 LinkedIn jobs, relax window to 30 days
  if (linkedInJobs.length === 0) {
    const extendedSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let relaxedLiQuery = linkedInRepo
      .createQueryBuilder("lj")
      .select([
        "lj.id",
        "lj.title",
        "lj.company",
        "lj.place",
        "lj.apply_link",
        "lj.job_link",
        "lj.job_date",
      ])
      .where("lj.job_date >= :extendedSince", { extendedSince });
    if (search?.trim()) {
      const { sql, params } = buildSearchConditions(search, "linkedin", matchAny);
      relaxedLiQuery = relaxedLiQuery.andWhere(sql, params);
    }
    if (liLocCondition) {
      relaxedLiQuery = relaxedLiQuery.andWhere(liLocCondition.sql, liLocCondition.params);
    }
    linkedInJobs = await relaxedLiQuery
      .orderBy("lj.job_date", "DESC", "NULLS LAST")
      .take(perSource)
      .getMany();
  }

  // Local scraped jobs are the primary source. If the stricter combined query
  // misses them, retry the local table independently with OR keyword matching
  // before accepting LinkedIn-only results.
  if (nepalJobs.length === 0 && search?.trim()) {
    const { sql, params } = buildSearchConditions(search, "job", true);
    let localFallback = jobRepo
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.category", "category")
      .select([
        "job.id",
        "job.title",
        "job.company",
        "job.location",
        "job.applyUrl",
        "job.type",
        "job.jobType",
        "job.salaryText",
        "job.source",
        "job.expiresAt",
        "job.postedAt",
        "job.createdAt",
        "category.id",
        "category.name",
      ])
      .where("job.isActive = true")
      .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
      .andWhere("(job.expiresAt IS NOT NULL OR job.createdAt >= :recentNullSince)", {
        recentNullSince,
      })
      .andWhere(sql, params);
    if (type !== "all") localFallback = localFallback.andWhere("job.type = :type", { type });
    if (jobType)
      localFallback = localFallback.andWhere("job.jobType = :jobType", {
        jobType,
      });
    if (jobLocCondition)
      localFallback = localFallback.andWhere(jobLocCondition.sql, jobLocCondition.params);
    nepalJobs = await localFallback
      .orderBy("job.postedAt", "DESC", "NULLS LAST")
      .take(perSource)
      .getMany();
  }

  if (nepalJobs.length === 0 && linkedInJobs.length === 0 && search?.trim()) {
    const terms = search.trim().split(/\s+/).filter(Boolean);
    if (terms.length >= 2) {
      const fallbackSearch = terms.slice(0, 3).join(" ");
      const { sql: jobSql, params: jobParams } = buildSearchConditions(fallbackSearch, "job", true);
      const { sql: liSql, params: liParams } = buildSearchConditions(
        fallbackSearch,
        "linkedin",
        true,
      );
      let fallbackJobsQ = jobRepo
        .createQueryBuilder("job")
        .leftJoinAndSelect("job.category", "category")
        .select([
          "job.id",
          "job.title",
          "job.company",
          "job.location",
          "job.applyUrl",
          "job.type",
          "job.jobType",
          "job.salaryText",
          "job.source",
          "job.expiresAt",
          "job.postedAt",
          "job.createdAt",
          "category.id",
          "category.name",
        ])
        .where("job.isActive = true")
        .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
        .andWhere("(job.expiresAt IS NOT NULL OR job.createdAt >= :recentNullSince)", {
          recentNullSince,
        })
        .andWhere(jobSql, jobParams);
      let fallbackLiQ = linkedInRepo
        .createQueryBuilder("lj")
        .select([
          "lj.id",
          "lj.title",
          "lj.company",
          "lj.place",
          "lj.apply_link",
          "lj.job_link",
          "lj.job_date",
        ])
        .where("lj.job_date >= :linkedinSince", { linkedinSince })
        .andWhere(liSql, liParams);
      if (type !== "all") fallbackJobsQ = fallbackJobsQ.andWhere("job.type = :type", { type });
      if (jobType)
        fallbackJobsQ = fallbackJobsQ.andWhere("job.jobType = :jobType", {
          jobType,
        });
      if (jobType) {
        const jt = jobType.toLowerCase();
        if (jt === "remote") {
          fallbackLiQ = fallbackLiQ.andWhere(
            "(lj.place ILIKE :fallbackRemoteP OR lj.description ILIKE :fallbackRemoteP OR lj.title ILIKE :fallbackRemoteP)",
            { fallbackRemoteP: "%remote%" },
          );
        } else if (jt === "hybrid") {
          fallbackLiQ = fallbackLiQ.andWhere(
            "(lj.place ILIKE :fallbackHybridP OR lj.description ILIKE :fallbackHybridP)",
            { fallbackHybridP: "%hybrid%" },
          );
        } else if (jt === "onsite") {
          fallbackLiQ = fallbackLiQ.andWhere("lj.place ILIKE :fallbackOnsiteP", {
            fallbackOnsiteP: "%on-site%",
          });
        }
      }
      if (type === "internship") {
        fallbackLiQ = fallbackLiQ.andWhere(
          "(lj.title ILIKE :fallbackInternP OR lj.description ILIKE :fallbackInternP)",
          { fallbackInternP: "%intern%" },
        );
      } else if (type === "job") {
        fallbackLiQ = fallbackLiQ.andWhere("lj.title NOT ILIKE :fallbackInternP", {
          fallbackInternP: "%intern%",
        });
      }
      if (jobLocCondition) {
        fallbackJobsQ = fallbackJobsQ.andWhere(jobLocCondition.sql, jobLocCondition.params);
      }
      if (liLocCondition) {
        fallbackLiQ = fallbackLiQ.andWhere(liLocCondition.sql, liLocCondition.params);
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

  // Keep locally scraped KamKhoj jobs ahead of LinkedIn jobs. Pagination is
  // applied after this ordering so LinkedIn results never jump ahead.
  return results.slice(offset, offset + limit);
}

/** Count all exact preference matches without applying a result cap. */
export async function countAllJobs(params: JobSearchParams): Promise<number> {
  const { search, location, jobType, type = "all", matchAny = false } = params;
  const dataSource = await getDataSource();
  const now = new Date();
  const linkedinSince = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const recentNullSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const jobLoc = location ? buildLocationConditions(location, "job") : null;
  const liLoc = location ? buildLocationConditions(location, "lj") : null;

  let jobsQuery = dataSource
    .getRepository(Job)
    .createQueryBuilder("job")
    .leftJoin("job.category", "category")
    .where("job.isActive = true")
    .andWhere("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now })
    .andWhere("(job.expiresAt IS NOT NULL OR job.createdAt >= :recentNullSince)", {
      recentNullSince,
    });

  if (type !== "all") jobsQuery = jobsQuery.andWhere("job.type = :type", { type });
  if (jobType) jobsQuery = jobsQuery.andWhere("job.jobType = :jobType", { jobType });
  if (jobLoc) {
    jobsQuery = jobsQuery.andWhere(jobLoc.sql, jobLoc.params);
  }
  if (search?.trim()) {
    const condition = buildSearchConditions(search, "job", matchAny);
    jobsQuery = jobsQuery.andWhere(condition.sql, condition.params);
  }

  let linkedInQuery = dataSource
    .getRepository(LinkedInJob)
    .createQueryBuilder("lj")
    .where("lj.job_date >= :linkedinSince", { linkedinSince });

  if (search?.trim()) {
    const condition = buildSearchConditions(search, "linkedin", matchAny);
    linkedInQuery = linkedInQuery.andWhere(condition.sql, condition.params);
  }
  if (liLoc) {
    linkedInQuery = linkedInQuery.andWhere(liLoc.sql, liLoc.params);
  }
  if (jobType) {
    const jt = jobType.toLowerCase();
    if (jt === "remote") {
      linkedInQuery = linkedInQuery.andWhere(
        "(lj.place ILIKE :countRemoteP OR lj.description ILIKE :countRemoteP OR lj.title ILIKE :countRemoteP)",
        { countRemoteP: "%remote%" },
      );
    } else if (jt === "hybrid") {
      linkedInQuery = linkedInQuery.andWhere(
        "(lj.place ILIKE :countHybridP OR lj.description ILIKE :countHybridP)",
        { countHybridP: "%hybrid%" },
      );
    } else if (jt === "onsite") {
      linkedInQuery = linkedInQuery.andWhere("lj.place ILIKE :countOnsiteP", {
        countOnsiteP: "%on-site%",
      });
    }
  }
  if (type === "internship") {
    linkedInQuery = linkedInQuery.andWhere(
      "(lj.title ILIKE :countInternP OR lj.description ILIKE :countInternP)",
      { countInternP: "%intern%" },
    );
  } else if (type === "job") {
    linkedInQuery = linkedInQuery.andWhere("lj.title NOT ILIKE :countInternP", {
      countInternP: "%intern%",
    });
  }

  const [localTotal, linkedInTotal] = await Promise.all([
    jobsQuery.getCount(),
    linkedInQuery.getCount(),
  ]);
  return localTotal + linkedInTotal;
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
  const categories = await categoryRepo.find({
    select: ["name"],
    order: { name: "ASC" },
  });
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

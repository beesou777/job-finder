import { MigrationInterface, QueryRunner } from "typeorm";

/** Accelerates the leading-wildcard ILIKE predicates used by job search. */
export class AddTrigramSearchIndexes1787000000007 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_title_trgm" ON "jobs" USING GIN ("title" gin_trgm_ops)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_company_trgm" ON "jobs" USING GIN ("company" gin_trgm_ops)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_location_trgm" ON "jobs" USING GIN ("location" gin_trgm_ops)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_description_trgm" ON "jobs" USING GIN ("description" gin_trgm_ops)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_requirements_trgm" ON "jobs" USING GIN ("requirements" gin_trgm_ops)`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_linkedin_title_trgm" ON "linkedin_jobs" USING GIN ("title" gin_trgm_ops)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_linkedin_company_trgm" ON "linkedin_jobs" USING GIN ("company" gin_trgm_ops)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_linkedin_place_trgm" ON "linkedin_jobs" USING GIN ("place" gin_trgm_ops)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_linkedin_description_trgm" ON "linkedin_jobs" USING GIN ("description" gin_trgm_ops)`);

    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_categories_name_trgm" ON "categories" USING GIN ("name" gin_trgm_ops)`);
  }

  async down(q: QueryRunner) {
    for (const name of [
      "IDX_jobs_title_trgm",
      "IDX_jobs_company_trgm",
      "IDX_jobs_location_trgm",
      "IDX_jobs_description_trgm",
      "IDX_jobs_requirements_trgm",
      "IDX_linkedin_title_trgm",
      "IDX_linkedin_company_trgm",
      "IDX_linkedin_place_trgm",
      "IDX_linkedin_description_trgm",
      "IDX_categories_name_trgm",
    ]) {
      await q.query(`DROP INDEX IF EXISTS "${name}"`);
    }
  }
}

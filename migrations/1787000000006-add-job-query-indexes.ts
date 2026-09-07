import { MigrationInterface, QueryRunner } from "typeorm";
export class AddJobQueryIndexes1787000000006 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_active_expiry_posted" ON "jobs" ("isActive", "expiresAt", "postedAt" DESC)`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_type_jobtype_active" ON "jobs" ("type", "jobType", "isActive")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_category_active" ON "jobs" ("categoryId", "isActive")`);
    await q.query(`CREATE INDEX IF NOT EXISTS "IDX_linkedin_job_date" ON "linkedin_jobs" ("job_date" DESC)`);
  }
  async down(q: QueryRunner) {
    await q.query(`DROP INDEX IF EXISTS "IDX_jobs_active_expiry_posted"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_jobs_type_jobtype_active"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_jobs_category_active"`);
    await q.query(`DROP INDEX IF EXISTS "IDX_linkedin_job_date"`);
  }
}

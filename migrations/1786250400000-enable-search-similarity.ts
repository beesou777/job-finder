import { MigrationInterface, QueryRunner } from "typeorm";

export class EnableSearchSimilarity1786250400000 implements MigrationInterface {
  name = "EnableSearchSimilarity1786250400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_jobs_title_trgm" ON "jobs" USING gin (lower("title") gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_jobs_company_trgm" ON "jobs" USING gin (lower("company") gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_jobs_location_trgm" ON "jobs" USING gin (lower("location") gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_jobs_location_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_jobs_company_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_jobs_title_trgm"`);
  }
}

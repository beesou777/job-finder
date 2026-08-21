import { MigrationInterface, QueryRunner } from "typeorm";
export class AddSavedJobs1787000000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "savedJobIds" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferredKeywords" jsonb NOT NULL DEFAULT '[]'`,
    );
  }
  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "preferredKeywords"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "savedJobIds"`);
  }
}

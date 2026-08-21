import { MigrationInterface, QueryRunner } from "typeorm";
export class AddPreferenceKeywords1787000000003 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferredKeywords" jsonb NOT NULL DEFAULT '[]'`,
    );
  }
  async down(q: QueryRunner) {
    await q.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "preferredKeywords"`);
  }
}

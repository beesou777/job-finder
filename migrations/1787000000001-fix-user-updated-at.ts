import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserUpdatedAt1787000000001 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(
      `UPDATE "users" SET "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP) WHERE "updatedAt" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
  }
  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP DEFAULT`);
  }
}

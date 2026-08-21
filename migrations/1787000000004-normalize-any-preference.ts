import { MigrationInterface, QueryRunner } from "typeorm";
export class NormalizeAnyPreference1787000000004 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`UPDATE "users" SET "preferredJobType" = NULL WHERE "preferredJobType" = 'Any'`);
    await q.query(
      `UPDATE "users" SET "preferredWorkMode" = NULL WHERE "preferredWorkMode" = 'Any'`,
    );
  }
  async down() {}
}

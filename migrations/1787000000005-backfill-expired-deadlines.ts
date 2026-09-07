import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillExpiredDeadlines1787000000005 implements MigrationInterface {
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
      WITH parsed AS (
        SELECT "id",
          CASE
            WHEN "deadline" ~* '^\\s*\\d+\\s*days?\\s*left' THEN CURRENT_TIMESTAMP + (regexp_replace("deadline", '\\D', '', 'g')::int * INTERVAL '1 day')
            WHEN "deadline" ~ '^\\s*\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}' THEN to_date(substring("deadline" from '^\\s*\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}'), 'DD/MM/YYYY')
            WHEN "deadline" ~* '^\\s*[A-Za-z]+\\s+\\d{1,2},\\s+\\d{4}' THEN to_date(substring("deadline" from '^\\s*[A-Za-z]+\\s+\\d{1,2},\\s+\\d{4}'), 'Month DD, YYYY')
            ELSE NULL
          END AS parsed_deadline
        FROM "jobs"
        WHERE "deadline" IS NOT NULL
      )
      UPDATE "jobs" j
      SET "expiresAt" = p.parsed_deadline,
          "isActive" = p.parsed_deadline > CURRENT_TIMESTAMP,
          "inactiveAt" = CASE WHEN p.parsed_deadline <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP ELSE NULL END,
          "inactiveReason" = CASE WHEN p.parsed_deadline <= CURRENT_TIMESTAMP THEN 'deadline_passed' ELSE NULL END
      FROM parsed p
      WHERE j."id" = p."id" AND p.parsed_deadline IS NOT NULL
    `);
  }
  async down() {}
}

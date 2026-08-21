import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeature1786250371262 implements MigrationInterface {
  name = "AddFeature1786250371262";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" DROP CONSTRAINT "FK_company_enrichments_companyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "hiring_intent_score_history" DROP CONSTRAINT "FK_hiring_intent_score_history_enrichmentId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_active_expiry"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_source_last_seen"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_active_type_posted"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_active_category_posted"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_active_jobtype_posted"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_canonical_companies_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_canonical_companies_domain"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_enrichments_companyId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_enrichments_intentScore"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_enrichments_intentLevel"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_enrichments_source"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_enrichments_isNewLead"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_enrichments_isPitchTarget"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_company_enrichments_approachabilityScore"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_hiring_intent_score_history_enrichmentId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_hiring_intent_score_history_recordedAt"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_job_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "totalJobs" integer NOT NULL DEFAULT '0', "activeJobs" integer NOT NULL DEFAULT '0', "expiredJobs" integer NOT NULL DEFAULT '0', "newJobsAdded" integer NOT NULL DEFAULT '0', "jobsExpiringSoon" integer NOT NULL DEFAULT '0', "computedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_500815336f16151fe3e87606d24" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_34c46eca54016927d7b1d1bb39" ON "daily_job_stats" ("date") `,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_source_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "source" character varying NOT NULL, "jobCount" integer NOT NULL DEFAULT '0', "completenessScore" double precision NOT NULL DEFAULT '0', "computedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b8def1f4e679924c7dd71aac1cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e2cc15e957a735a17dd33e9897" ON "daily_source_stats" ("date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13e15c81a0c416b5ea0f5220f4" ON "daily_source_stats" ("source") `,
    );
    await queryRunner.query(
      `CREATE TABLE "canonical_locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "aliases" text array NOT NULL DEFAULT '{}', "type" character varying NOT NULL DEFAULT 'city', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_365b1242597e0d493dfd9589a67" UNIQUE ("name"), CONSTRAINT "PK_094d9feb17123fc23d42db7e396" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_365b1242597e0d493dfd9589a6" ON "canonical_locations" ("name") `,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "salaryText" SET DEFAULT 'Negotiable'`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "firstSeenAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "lastSeenAt" SET DEFAULT now()`);
    // Existing databases can contain duplicate fingerprints from older scraper runs.
    // Keep the most recently seen row before enforcing uniqueness. NULL fingerprints
    // remain allowed for listings that cannot be fingerprinted yet.
    await queryRunner.query(`
            DELETE FROM "jobs" j
            USING (
                SELECT id, ROW_NUMBER() OVER (
                    PARTITION BY "fingerprint"
                    ORDER BY "lastSeenAt" DESC NULLS LAST, "updatedAt" DESC NULLS LAST, id DESC
                ) AS duplicate_rank
                FROM "jobs"
                WHERE "fingerprint" IS NOT NULL
            ) duplicates
            WHERE j.id = duplicates.id AND duplicates.duplicate_rank > 1
        `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_134b54bcf73a18897f8f96f93cc" ON "jobs" ("fingerprint") WHERE "fingerprint" IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "postedAt" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "postedAt" SET DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    await queryRunner.query(
      `ALTER TABLE "canonical_companies" ALTER COLUMN "aliases" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "canonical_companies" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "keywordMatches" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."hiring_intent_level_enum" RENAME TO "hiring_intent_level_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_enrichments_intentlevel_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "intentLevel" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "intentLevel" TYPE "public"."company_enrichments_intentlevel_enum" USING "intentLevel"::"text"::"public"."company_enrichments_intentlevel_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "intentLevel" SET DEFAULT 'LOW'`,
    );
    await queryRunner.query(
      `ALTER TABLE "hiring_intent_score_history" ALTER COLUMN "level" TYPE "public"."company_enrichments_intentlevel_enum" USING "level"::"text"::"public"."company_enrichments_intentlevel_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."hiring_intent_level_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."match_confidence_enum" RENAME TO "match_confidence_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_enrichments_matchconfidence_enum" AS ENUM('HIGH', 'MEDIUM', 'LOW')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "matchConfidence" TYPE "public"."company_enrichments_matchconfidence_enum" USING "matchConfidence"::"text"::"public"."company_enrichments_matchconfidence_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."match_confidence_enum_old"`);
    await queryRunner.query(`ALTER TABLE "company_enrichments" DROP COLUMN "matchSimilarity"`);
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ADD "matchSimilarity" double precision`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."external_source_enum" RENAME TO "external_source_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_enrichments_source_enum" AS ENUM('techbehemoths', 'ramrojob', 'merojob', 'virit', 'workhub', 'manual', 'google', 'linkedin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "source" TYPE "public"."company_enrichments_source_enum" USING "source"::"text"::"public"."company_enrichments_source_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."external_source_enum_old"`);
    await queryRunner.query(`ALTER TABLE "company_enrichments" DROP COLUMN "trustScore"`);
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ADD "trustScore" double precision NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(`ALTER TABLE "company_enrichments" DROP COLUMN "approachabilityLevel"`);
    await queryRunner.query(
      `CREATE TYPE "public"."company_enrichments_approachabilitylevel_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ADD "approachabilityLevel" "public"."company_enrichments_approachabilitylevel_enum" NOT NULL DEFAULT 'LOW'`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "hiring_intent_score_history" ALTER COLUMN "recordedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "linkedin_jobs" ALTER COLUMN "created_at" SET NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_831c674d672de97206d9e27cdb" ON "jobs" ("company") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_f803a854cd07320ee634d8887f" ON "jobs" ("location") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_08f0d5e2aa2045a69046da2364" ON "jobs" ("jobType") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_0438611f1bd3705dc884cfcc06" ON "jobs" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e8aa305dc72304aa862f4863b" ON "jobs" ("firstSeenAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76bdc7912a961acb49fc9b754d" ON "jobs" ("lastSeenAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ed31f1cb9aea3565547298872" ON "jobs" ("sourceJobId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_134b54bcf73a18897f8f96f93c" ON "jobs" ("fingerprint") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ef262360ea20e50890ba754cb5" ON "jobs" ("contentHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_41803e98fece1dd8d35b86cb51" ON "jobs" ("postedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_656cf816796738c59563a79787" ON "jobs" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_394fe3604b0ff7e6fd1b915e4c" ON "canonical_companies" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e48bb7736eb60508fd31ce87e" ON "company_enrichments" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2179f888c07e152db63e91ea21" ON "company_enrichments" ("intentScore") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e6501f4721dc0ef08333f25831" ON "company_enrichments" ("intentLevel") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7ca9bb7368ed5d4661a068fd4b" ON "company_enrichments" ("source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3497023c2dc2fad22e044dcd27" ON "company_enrichments" ("isNewLead") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ce8355327f55dcf93ab5159a7e" ON "company_enrichments" ("approachabilityScore") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_470b8ffec132b43a659d3adfb0" ON "company_enrichments" ("approachabilityLevel") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f07e6c2fde9e264ed35c9810b7" ON "company_enrichments" ("isPitchTarget") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_334d9949cfe6b78f24505e9390" ON "hiring_intent_score_history" ("enrichmentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e822dc99dd6ea8de1d4b534ac8" ON "hiring_intent_score_history" ("recordedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8bfd4e2b390b5bf8da6b400479" ON "linkedin_jobs" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e7336b3b23f86613960a061c53" ON "linkedin_jobs" ("job_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1df4bf5956d0645de8dcbaad5f" ON "linkedin_jobs" ("created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ADD CONSTRAINT "FK_2e48bb7736eb60508fd31ce87e2" FOREIGN KEY ("companyId") REFERENCES "canonical_companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" DROP CONSTRAINT "FK_2e48bb7736eb60508fd31ce87e2"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_1df4bf5956d0645de8dcbaad5f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e7336b3b23f86613960a061c53"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8bfd4e2b390b5bf8da6b400479"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e822dc99dd6ea8de1d4b534ac8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_334d9949cfe6b78f24505e9390"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f07e6c2fde9e264ed35c9810b7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_470b8ffec132b43a659d3adfb0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ce8355327f55dcf93ab5159a7e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3497023c2dc2fad22e044dcd27"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7ca9bb7368ed5d4661a068fd4b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e6501f4721dc0ef08333f25831"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2179f888c07e152db63e91ea21"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2e48bb7736eb60508fd31ce87e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_394fe3604b0ff7e6fd1b915e4c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_656cf816796738c59563a79787"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_41803e98fece1dd8d35b86cb51"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ef262360ea20e50890ba754cb5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_134b54bcf73a18897f8f96f93c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2ed31f1cb9aea3565547298872"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_76bdc7912a961acb49fc9b754d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8e8aa305dc72304aa862f4863b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0438611f1bd3705dc884cfcc06"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_08f0d5e2aa2045a69046da2364"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f803a854cd07320ee634d8887f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_831c674d672de97206d9e27cdb"`);
    await queryRunner.query(`ALTER TABLE "linkedin_jobs" ALTER COLUMN "created_at" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "hiring_intent_score_history" ALTER COLUMN "recordedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."hiring_intent_level_enum_old" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "hiring_intent_score_history" ALTER COLUMN "level" TYPE "public"."hiring_intent_level_enum_old" USING "level"::"text"::"public"."hiring_intent_level_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."hiring_intent_level_enum_old" RENAME TO "hiring_intent_level_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "company_enrichments" DROP COLUMN "approachabilityLevel"`);
    await queryRunner.query(`DROP TYPE "public"."company_enrichments_approachabilitylevel_enum"`);
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ADD "approachabilityLevel" character varying NOT NULL DEFAULT 'LOW'`,
    );
    await queryRunner.query(`ALTER TABLE "company_enrichments" DROP COLUMN "trustScore"`);
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ADD "trustScore" real NOT NULL DEFAULT 1.0`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."external_source_enum_old" AS ENUM('techbehemoths', 'ramrojob', 'merojob', 'virit', 'workhub', 'manual', 'google', 'linkedin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "source" TYPE "public"."external_source_enum_old" USING "source"::"text"::"public"."external_source_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."company_enrichments_source_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."external_source_enum_old" RENAME TO "external_source_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "company_enrichments" DROP COLUMN "matchSimilarity"`);
    await queryRunner.query(`ALTER TABLE "company_enrichments" ADD "matchSimilarity" real`);
    await queryRunner.query(
      `CREATE TYPE "public"."match_confidence_enum_old" AS ENUM('HIGH', 'MEDIUM', 'LOW')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "matchConfidence" TYPE "public"."match_confidence_enum_old" USING "matchConfidence"::"text"::"public"."match_confidence_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."company_enrichments_matchconfidence_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."match_confidence_enum_old" RENAME TO "match_confidence_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."hiring_intent_level_enum_old" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "intentLevel" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "intentLevel" TYPE "public"."hiring_intent_level_enum_old" USING "intentLevel"::"text"::"public"."hiring_intent_level_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "intentLevel" SET DEFAULT 'LOW'`,
    );
    await queryRunner.query(`DROP TYPE "public"."company_enrichments_intentlevel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."company_enrichments_intentlevel_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."hiring_intent_level_enum_old" RENAME TO "hiring_intent_level_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ALTER COLUMN "keywordMatches" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "canonical_companies" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "canonical_companies" ALTER COLUMN "aliases" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "postedAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "postedAt" DROP NOT NULL`);
    await queryRunner.query(`DROP INDEX "public"."UQ_134b54bcf73a18897f8f96f93cc"`);
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "lastSeenAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ALTER COLUMN "firstSeenAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" ALTER COLUMN "salaryText" DROP DEFAULT`);
    await queryRunner.query(`DROP INDEX "public"."IDX_365b1242597e0d493dfd9589a6"`);
    await queryRunner.query(`DROP TABLE "canonical_locations"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_13e15c81a0c416b5ea0f5220f4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e2cc15e957a735a17dd33e9897"`);
    await queryRunner.query(`DROP TABLE "daily_source_stats"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_34c46eca54016927d7b1d1bb39"`);
    await queryRunner.query(`DROP TABLE "daily_job_stats"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_hiring_intent_score_history_recordedAt" ON "hiring_intent_score_history" ("recordedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_hiring_intent_score_history_enrichmentId" ON "hiring_intent_score_history" ("enrichmentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_enrichments_approachabilityScore" ON "company_enrichments" ("approachabilityScore") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_enrichments_isPitchTarget" ON "company_enrichments" ("isPitchTarget") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_enrichments_isNewLead" ON "company_enrichments" ("isNewLead") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_enrichments_source" ON "company_enrichments" ("source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_enrichments_intentLevel" ON "company_enrichments" ("intentLevel") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_enrichments_intentScore" ON "company_enrichments" ("intentScore") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_enrichments_companyId" ON "company_enrichments" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_canonical_companies_domain" ON "canonical_companies" ("domain") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_canonical_companies_name" ON "canonical_companies" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_active_jobtype_posted" ON "jobs" ("isActive", "jobType", "postedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_active_category_posted" ON "jobs" ("categoryId", "isActive", "postedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_active_type_posted" ON "jobs" ("isActive", "postedAt", "type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_source_last_seen" ON "jobs" ("lastSeenAt", "source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_active_expiry" ON "jobs" ("expiresAt", "isActive") `,
    );
    await queryRunner.query(
      `ALTER TABLE "hiring_intent_score_history" ADD CONSTRAINT "FK_hiring_intent_score_history_enrichmentId" FOREIGN KEY ("enrichmentId") REFERENCES "company_enrichments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_enrichments" ADD CONSTRAINT "FK_company_enrichments_companyId" FOREIGN KEY ("companyId") REFERENCES "canonical_companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}

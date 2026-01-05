/**
 * Migration script for Company Enrichment tables
 * 
 * This script creates the company_enrichments and hiring_intent_score_history tables
 * 
 * Usage:
 *   tsx scripts/migrate-company-enrichment.ts
 */

import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDataSource } from "../lib/db";

async function migrateCompanyEnrichment() {
  console.log("🔄 Starting Company Enrichment migration...\n");

  const dataSource = await getDataSource();

  try {
    const queryRunner = dataSource.createQueryRunner();

    // Check if tables already exist
    const companyEnrichmentsExists = await queryRunner.hasTable("company_enrichments");
    const scoreHistoryExists = await queryRunner.hasTable("hiring_intent_score_history");

    if (companyEnrichmentsExists && scoreHistoryExists) {
      console.log("✅ Tables already exist. Migration not needed.\n");
      await queryRunner.release();
      return;
    }

    console.log("📊 Creating tables...\n");

    // Create company_enrichments table
    if (!companyEnrichmentsExists) {
      // Check if enum types exist, create if not
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "hiring_intent_level_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "external_source_enum" AS ENUM('techbehemoths', 'ramrojob', 'merojob', 'virit', 'workhub', 'manual', 'google', 'linkedin');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE "match_confidence_enum" AS ENUM('HIGH', 'MEDIUM', 'LOW');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Check if canonical_companies table exists
      const canonicalCompaniesExists = await queryRunner.hasTable("canonical_companies");
      
      // Create table with or without FK constraint
      if (canonicalCompaniesExists) {
        await queryRunner.query(`
          CREATE TABLE "company_enrichments" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "companyId" uuid NOT NULL UNIQUE,
            "email" varchar,
            "phoneNumber" varchar,
            "website" varchar,
            "careerPageUrl" text,
            "externalProfileUrl" text,
            "hasCareerPage" boolean NOT NULL DEFAULT false,
            "keywordMatches" text[] DEFAULT '{}',
            "externalStatus" varchar,
            "jobsLast7Days" integer NOT NULL DEFAULT 0,
            "jobsLast30Days" integer NOT NULL DEFAULT 0,
            "uniqueJobCategories" integer NOT NULL DEFAULT 0,
            "intentScore" integer NOT NULL DEFAULT 0,
            "intentLevel" hiring_intent_level_enum NOT NULL DEFAULT 'LOW',
            "matchConfidence" match_confidence_enum,
            "matchSimilarity" real,
            "matchedBy" varchar,
            "source" external_source_enum,
            "trustScore" real NOT NULL DEFAULT 1.0,
            "lastVerifiedAt" timestamp,
            "lastCheckedAt" timestamp,
            "salesNotes" text,
            "isNewLead" boolean NOT NULL DEFAULT false,
            "isPitchTarget" boolean NOT NULL DEFAULT false,
            "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FK_company_enrichments_companyId" FOREIGN KEY ("companyId") 
              REFERENCES "canonical_companies"("id") ON DELETE CASCADE
          );
        `);
      } else {
        // Create table without FK constraint - will be added when canonical_companies is created
        await queryRunner.query(`
          CREATE TABLE "company_enrichments" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "companyId" uuid NOT NULL UNIQUE,
            "email" varchar,
            "phoneNumber" varchar,
            "website" varchar,
            "careerPageUrl" text,
            "externalProfileUrl" text,
            "hasCareerPage" boolean NOT NULL DEFAULT false,
            "keywordMatches" text[] DEFAULT '{}',
            "externalStatus" varchar,
            "jobsLast7Days" integer NOT NULL DEFAULT 0,
            "jobsLast30Days" integer NOT NULL DEFAULT 0,
            "uniqueJobCategories" integer NOT NULL DEFAULT 0,
            "intentScore" integer NOT NULL DEFAULT 0,
            "intentLevel" hiring_intent_level_enum NOT NULL DEFAULT 'LOW',
            "matchConfidence" match_confidence_enum,
            "matchSimilarity" real,
            "matchedBy" varchar,
            "source" external_source_enum,
            "trustScore" real NOT NULL DEFAULT 1.0,
            "lastVerifiedAt" timestamp,
            "lastCheckedAt" timestamp,
            "salesNotes" text,
            "isNewLead" boolean NOT NULL DEFAULT false,
            "isPitchTarget" boolean NOT NULL DEFAULT false,
            "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("⚠️  Created table without FK constraint (canonical_companies doesn't exist yet)");
      }

      await queryRunner.query(`
        CREATE INDEX "IDX_company_enrichments_companyId" ON "company_enrichments" ("companyId");
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_company_enrichments_intentScore" ON "company_enrichments" ("intentScore");
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_company_enrichments_intentLevel" ON "company_enrichments" ("intentLevel");
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_company_enrichments_source" ON "company_enrichments" ("source");
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_company_enrichments_isNewLead" ON "company_enrichments" ("isNewLead");
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_company_enrichments_isPitchTarget" ON "company_enrichments" ("isPitchTarget");
      `);

      console.log("✅ Created company_enrichments table");
    } else {
      console.log("ℹ️  company_enrichments table already exists");
    }

    // Create hiring_intent_score_history table
    if (!scoreHistoryExists) {
      await queryRunner.query(`
        CREATE TABLE "hiring_intent_score_history" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "enrichmentId" uuid NOT NULL,
          "score" integer NOT NULL,
          "level" hiring_intent_level_enum NOT NULL,
          "signalBreakdown" jsonb,
          "trigger" text,
          "recordedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "FK_hiring_intent_score_history_enrichmentId" FOREIGN KEY ("enrichmentId") 
            REFERENCES "company_enrichments"("id") ON DELETE CASCADE
        );
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_hiring_intent_score_history_enrichmentId" ON "hiring_intent_score_history" ("enrichmentId");
      `);

      await queryRunner.query(`
        CREATE INDEX "IDX_hiring_intent_score_history_recordedAt" ON "hiring_intent_score_history" ("recordedAt");
      `);

      console.log("✅ Created hiring_intent_score_history table");
    } else {
      console.log("ℹ️  hiring_intent_score_history table already exists");
    }

    // Ensure uuid extension exists
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `).catch(() => {
      // Extension might already exist or not be needed
      console.log("ℹ️  UUID extension check skipped");
    });

    await queryRunner.release();

    console.log("\n✅ Migration complete!\n");
    console.log("   Tables created:");
    console.log("   - company_enrichments");
    console.log("   - hiring_intent_score_history\n");
  } catch (error: any) {
    console.error("❌ Migration failed:", error?.message || error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run migration
migrateCompanyEnrichment()
  .then(() => {
    console.log("🎉 Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration script failed:", error);
    process.exit(1);
  });


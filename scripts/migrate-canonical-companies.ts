/**
 * Migration script to create canonical_companies table if it doesn't exist
 * 
 * Usage:
 *   tsx scripts/migrate-canonical-companies.ts
 */

import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDataSource } from "../lib/db";

async function migrateCanonicalCompanies() {
  console.log("🔄 Creating canonical_companies table...\n");

  const dataSource = await getDataSource();

  try {
    const queryRunner = dataSource.createQueryRunner();

    // Check if table exists
    const tableExists = await queryRunner.hasTable("canonical_companies");

    if (tableExists) {
      console.log("✅ canonical_companies table already exists.\n");
      await queryRunner.release();
      return;
    }

    console.log("📊 Creating canonical_companies table...\n");

    // Create canonical_companies table
    await queryRunner.query(`
      CREATE TABLE "canonical_companies" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL UNIQUE,
        "aliases" text[] DEFAULT '{}',
        "domain" varchar,
        "isVerified" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_canonical_companies_name" ON "canonical_companies" ("name");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_canonical_companies_domain" ON "canonical_companies" ("domain");
    `);

    // Ensure uuid extension exists
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `).catch(() => {
      // Extension might already exist
    });

    await queryRunner.release();

    console.log("✅ Created canonical_companies table\n");
    console.log("📋 Now you can add the FK constraint to company_enrichments:\n");
    console.log("   Run: npm run migrate-company-enrichment-fk\n");
  } catch (error: any) {
    console.error("❌ Migration failed:", error?.message || error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

migrateCanonicalCompanies()
  .then(() => {
    console.log("🎉 Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });


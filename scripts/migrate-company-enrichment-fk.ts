/**
 * Migration script to add foreign key constraint to company_enrichments
 * (Run this after canonical_companies table exists)
 * 
 * Usage:
 *   tsx scripts/migrate-company-enrichment-fk.ts
 */

import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDataSource } from "../lib/db";

async function addForeignKeyConstraint() {
  console.log("🔄 Adding foreign key constraint to company_enrichments...\n");

  const dataSource = await getDataSource();

  try {
    const queryRunner = dataSource.createQueryRunner();

    // Check if tables exist
    const companyEnrichmentsExists = await queryRunner.hasTable("company_enrichments");
    const canonicalCompaniesExists = await queryRunner.hasTable("canonical_companies");

    if (!companyEnrichmentsExists) {
      console.log("❌ company_enrichments table doesn't exist. Run migrate-company-enrichment first.\n");
      await queryRunner.release();
      process.exit(1);
      return;
    }

    if (!canonicalCompaniesExists) {
      console.log("❌ canonical_companies table doesn't exist. Run migrate-canonical-companies first.\n");
      await queryRunner.release();
      process.exit(1);
      return;
    }

    // Check if FK constraint already exists
    const fkExists = await queryRunner.query(`
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'FK_company_enrichments_companyId' 
      AND table_name = 'company_enrichments';
    `);

    if (fkExists && fkExists.length > 0) {
      console.log("✅ Foreign key constraint already exists.\n");
      await queryRunner.release();
      return;
    }

    console.log("📊 Adding foreign key constraint...\n");

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "company_enrichments"
      ADD CONSTRAINT "FK_company_enrichments_companyId" 
      FOREIGN KEY ("companyId") 
      REFERENCES "canonical_companies"("id") 
      ON DELETE CASCADE;
    `);

    await queryRunner.release();

    console.log("✅ Foreign key constraint added successfully!\n");
  } catch (error: any) {
    console.error("❌ Migration failed:", error?.message || error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

addForeignKeyConstraint()
  .then(() => {
    console.log("🎉 Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  });


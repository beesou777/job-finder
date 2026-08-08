import "reflect-metadata";
import "dotenv/config";
import { getDataSource } from "../lib/db";

async function migrate() {
  const dataSource = await getDataSource();
  await dataSource.query(`ALTER TABLE company_enrichments ADD COLUMN IF NOT EXISTS "approachabilityScore" integer NOT NULL DEFAULT 0`);
  await dataSource.query(`ALTER TABLE company_enrichments ADD COLUMN IF NOT EXISTS "approachabilityLevel" varchar NOT NULL DEFAULT 'LOW'`);
  await dataSource.query(`ALTER TABLE company_enrichments ADD COLUMN IF NOT EXISTS "approachabilityLastComputed" timestamp NULL`);
  await dataSource.query(`ALTER TABLE company_enrichments ADD COLUMN IF NOT EXISTS "isPitchTarget" boolean NOT NULL DEFAULT false`);
  await dataSource.query(`CREATE INDEX IF NOT EXISTS "IDX_company_enrichments_approachabilityScore" ON company_enrichments ("approachabilityScore")`);
  await dataSource.query(`CREATE INDEX IF NOT EXISTS "IDX_company_enrichments_isPitchTarget" ON company_enrichments ("isPitchTarget")`);
  console.log("Approachability columns migration complete.");
  await dataSource.destroy();
}

migrate().catch((error) => { console.error("Approachability migration failed:", error); process.exitCode = 1; });

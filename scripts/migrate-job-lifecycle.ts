import "reflect-metadata";
import dotenv from "dotenv";
import { getDataSource } from "../lib/db";

dotenv.config();

export async function migrateJobLifecycle() {
  const dataSource = await getDataSource();
  const runner = dataSource.createQueryRunner();

  try {
    await runner.query(`
      ALTER TABLE jobs
        ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "firstSeenAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "lastSeenAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "lastVerifiedAt" timestamp NULL,
        ADD COLUMN IF NOT EXISTS "inactiveAt" timestamp NULL,
        ADD COLUMN IF NOT EXISTS "inactiveReason" varchar NULL,
        ADD COLUMN IF NOT EXISTS "consecutiveMisses" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "sourceJobId" varchar NULL,
        ADD COLUMN IF NOT EXISTS "deadlineConfidence" varchar NULL,
        ADD COLUMN IF NOT EXISTS "qualityScore" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);
    await runner.query(`UPDATE jobs SET "firstSeenAt" = COALESCE("createdAt", CURRENT_TIMESTAMP), "lastSeenAt" = COALESCE("createdAt", CURRENT_TIMESTAMP), "lastVerifiedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP) WHERE "lastVerifiedAt" IS NULL`);
    await runner.query(`UPDATE jobs SET "isActive" = false, "inactiveAt" = CURRENT_TIMESTAMP, "inactiveReason" = 'deadline_passed' WHERE "expiresAt" IS NOT NULL AND "expiresAt" <= CURRENT_TIMESTAMP`);
    await runner.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_active_expiry" ON jobs ("isActive", "expiresAt")`);
    await runner.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_source_last_seen" ON jobs (source, "lastSeenAt")`);
    await runner.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_active_type_posted" ON jobs ("isActive", type, "postedAt" DESC)`);
    await runner.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_active_category_posted" ON jobs ("isActive", "categoryId", "postedAt" DESC)`);
    await runner.query(`CREATE INDEX IF NOT EXISTS "IDX_jobs_active_jobtype_posted" ON jobs ("isActive", "jobType", "postedAt" DESC)`);
    console.log("Job lifecycle migration completed.");
  } finally {
    await runner.release();
  }
}

if (require.main === module) {
  migrateJobLifecycle().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

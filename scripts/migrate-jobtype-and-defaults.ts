import "reflect-metadata";
import dotenv from "dotenv";
import { getDataSource } from "../lib/db";
import { Job, JobTypeEnum } from "../entities/Job";

// Load environment variables
dotenv.config();

/**
 * Migration script to:
 * 1. Normalize jobType to enum values
 * 2. Update salaryText to default "Negotiable" for null/empty values
 * 3. Copy createdAt to postedAt (or set postedAt to createdAt if postedAt doesn't exist)
 * 4. Add postedAt column if it doesn't exist
 */
async function migrateJobTypeAndDefaults() {
  console.log("🔄 Starting jobType enum and defaults migration...\n");

  // getDataSource() already initializes the connection
  const dataSource = await getDataSource();
  console.log("✅ Database connected\n");

  try {
    const jobRepository = dataSource.getRepository(Job);

    // First, let's add the postedAt column if it doesn't exist (using raw SQL)
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      // Check if postedAt column exists
      const table = await queryRunner.getTable("jobs");
      const hasPostedAt = table?.findColumnByName("postedAt");
      
      if (!hasPostedAt) {
        console.log("📝 Adding postedAt column...");
        await queryRunner.query(`
          ALTER TABLE jobs 
          ADD COLUMN IF NOT EXISTS "postedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log("✅ Added postedAt column\n");
      } else {
        console.log("ℹ️  postedAt column already exists\n");
      }

      // Update postedAt to be the same as createdAt for existing records
      console.log("📝 Copying createdAt to postedAt for existing records...");
      await queryRunner.query(`
        UPDATE jobs 
        SET "postedAt" = "createdAt" 
        WHERE "postedAt" IS NULL OR "postedAt" < "createdAt"
      `);
      console.log("✅ Updated postedAt values\n");
    } finally {
      await queryRunner.release();
    }

    // Import normalizeJobType function
    const { normalizeJobType } = await import("../src/scrapers/core/normalizeJobType");

    // Get all jobs
    console.log("📝 Fetching all jobs...");
    const jobs = await jobRepository.find();
    console.log(`✅ Found ${jobs.length} jobs\n`);

    let updatedJobType = 0;
    let updatedSalary = 0;
    let updatedPostedAt = 0;

    for (const job of jobs) {
      let needsUpdate = false;
      const updates: Partial<Job> = {};

      // Normalize jobType (convert string to enum)
      if (job.jobType) {
        const normalized = normalizeJobType(job.jobType as string);
        if (normalized && normalized !== job.jobType) {
          updates.jobType = normalized;
          needsUpdate = true;
          updatedJobType++;
        } else if (!normalized && job.jobType) {
          // If can't normalize, set to null
          updates.jobType = null as any;
          needsUpdate = true;
          updatedJobType++;
        } else if (!Object.values(JobTypeEnum).includes(job.jobType as JobTypeEnum)) {
          // If jobType is not a valid enum value, normalize it
          const normalized = normalizeJobType(job.jobType as string);
          updates.jobType = normalized;
          needsUpdate = true;
          updatedJobType++;
        }
      }

      // Update salaryText to "Negotiable" if null or empty
      if (!job.salaryText || job.salaryText.trim() === "") {
        updates.salaryText = "Negotiable";
        needsUpdate = true;
        updatedSalary++;
      }

      // Ensure postedAt is set (should already be done by SQL, but double-check)
      if (!job.postedAt) {
        updates.postedAt = job.createdAt || new Date();
        needsUpdate = true;
        updatedPostedAt++;
      }

      if (needsUpdate) {
        await jobRepository.update(job.id, updates);
      }
    }

    console.log("\n✅ Migration complete!");
    console.log(`   - Updated jobType: ${updatedJobType} jobs`);
    console.log(`   - Updated salaryText: ${updatedSalary} jobs`);
    console.log(`   - Updated postedAt: ${updatedPostedAt} jobs\n`);

    // Verify migration
    const jobsWithNullJobType = await jobRepository.count({
      where: { jobType: null as any },
    });
    const jobsWithNegotiableSalary = await jobRepository.count({
      where: { salaryText: "Negotiable" },
    });
    const jobsWithoutPostedAt = await jobRepository
      .createQueryBuilder("job")
      .where("job.postedAt IS NULL")
      .getCount();

    console.log("📊 Migration verification:");
    console.log(`   - Jobs with null jobType: ${jobsWithNullJobType}`);
    console.log(`   - Jobs with "Negotiable" salary: ${jobsWithNegotiableSalary}`);
    console.log(`   - Jobs without postedAt: ${jobsWithoutPostedAt}\n`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
  // Note: We don't destroy the DataSource as it's a singleton that might be reused
}

// Run migration
if (require.main === module) {
  migrateJobTypeAndDefaults()
    .then(() => {
      console.log("✅ Migration script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateJobTypeAndDefaults };


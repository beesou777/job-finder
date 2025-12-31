/**
 * Script to fix JobSniper job types (distinguish between internships and jobs)
 * Run with: npm run fix:jobssniper-types or yarn fix:jobssniper-types
 * 
 * This script updates existing JobSniper jobs in the database to correctly
 * distinguish between internships and regular jobs based on:
 * - kind_of_jobs field containing "intern" or "internship"
 * - title containing internship keywords
 * - jobType field
 */

import "reflect-metadata";
import { config } from "dotenv";
import { getDataSource } from "../lib/db";
import { Job } from "../entities/Job";

// Load environment variables
config();

async function fixJobSniperTypes() {
  try {
    console.log("🔄 Initializing database connection...");
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);

    console.log("🔍 Finding all JobSniper jobs...\n");

    // Get all JobSniper jobs
    const jobs = await jobRepository.find({
      where: { source: "jobssniper" },
    });

    if (jobs.length === 0) {
      console.log("⚠️  No JobSniper jobs found in database.");
      process.exit(0);
    }

    console.log(`📊 Found ${jobs.length} JobSniper jobs to check\n`);

    let updated = 0;
    let alreadyCorrect = 0;
    let errors = 0;

    const internshipKeywords = [
      "intern",
      "internship",
      "trainee",
      "traineeship",
      "apprentice",
    ];

    for (const job of jobs) {
      try {
        // Check if it should be an internship
        const titleLower = (job.title || "").toLowerCase();
        const jobTypeLower = (job.jobType || "").toLowerCase();
        const categoryLower = (job.categoryOld || "").toLowerCase();

        const hasInternshipKeyword =
          internshipKeywords.some((keyword) => titleLower.includes(keyword)) ||
          internshipKeywords.some((keyword) => jobTypeLower.includes(keyword)) ||
          internshipKeywords.some((keyword) => categoryLower.includes(keyword));

        const shouldBeInternship = hasInternshipKeyword;
        const currentType = job.type || "job";

        if (shouldBeInternship && currentType !== "internship") {
          job.type = "internship";
          await jobRepository.save(job);
          updated++;
          console.log(
            `  ✅ Updated: "${job.title.substring(0, 50)}..." → internship`
          );
        } else if (!shouldBeInternship && currentType !== "job") {
          job.type = "job";
          await jobRepository.save(job);
          updated++;
          console.log(
            `  ✅ Updated: "${job.title.substring(0, 50)}..." → job`
          );
        } else {
          alreadyCorrect++;
        }
      } catch (error: any) {
        errors++;
        console.error(
          `  ❌ Error processing job "${job.title}": ${error.message}`
        );
      }
    }

    console.log("\n✅ Job type fixing completed!");
    console.log(`\n📊 Results:`);
    console.log(`   - Total jobs checked: ${jobs.length}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Already correct: ${alreadyCorrect}`);
    if (errors > 0) {
      console.log(`   - Errors: ${errors}`);
    }

    // Show breakdown by type
    const internshipCount = jobs.filter((j) => j.type === "internship").length;
    const jobCount = jobs.filter((j) => j.type === "job").length;
    console.log(`\n📈 Final breakdown:`);
    console.log(`   - Internships: ${internshipCount}`);
    console.log(`   - Jobs: ${jobCount}`);

    await dataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error fixing job types:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixJobSniperTypes();


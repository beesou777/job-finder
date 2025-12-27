import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDataSource } from "../lib/db";
import { Job } from "../entities/Job";
import { Category } from "../entities/Category";

async function testCategoryFilter() {
  console.log("🔍 Testing category filter...\n");

  const dataSource = await getDataSource();
  const jobRepository = dataSource.getRepository(Job);
  const categoryRepository = dataSource.getRepository(Category);

  try {
    // Get a category
    const categories = await categoryRepository.find({ take: 1 });
    
    if (categories.length === 0) {
      console.log("❌ No categories found in database");
      return;
    }

    const testCategory = categories[0];
    console.log(`📋 Testing with category: ${testCategory.name} (${testCategory.id})\n`);

    // Count jobs with this category
    const jobsWithCategory = await jobRepository.count({
      where: { categoryId: testCategory.id },
    });

    console.log(`✅ Jobs with categoryId ${testCategory.id}: ${jobsWithCategory}`);

    // Count all jobs
    const totalJobs = await jobRepository.count();
    console.log(`📊 Total jobs in database: ${totalJobs}`);

    // Count jobs with any categoryId
    const jobsWithAnyCategory = await jobRepository
      .createQueryBuilder("job")
      .where("job.categoryId IS NOT NULL")
      .getCount();

    console.log(`📊 Jobs with any categoryId: ${jobsWithAnyCategory}`);
    console.log(`📊 Jobs without categoryId: ${totalJobs - jobsWithAnyCategory}\n`);

    // Test the query
    const testJobs = await jobRepository
      .createQueryBuilder("job")
      .leftJoinAndSelect("job.category", "category")
      .where("(job.expiresAt IS NULL OR job.expiresAt > :now)", { now: new Date() })
      .andWhere("job.categoryId = :categoryId", { categoryId: testCategory.id })
      .getMany();

    console.log(`🔍 Query test - Found ${testJobs.length} jobs for category ${testCategory.name}`);
    
    if (testJobs.length > 0) {
      console.log(`\n✅ Sample job:`);
      console.log(`   - Title: ${testJobs[0].title}`);
      console.log(`   - Category: ${testJobs[0].category?.name || 'N/A'}`);
      console.log(`   - CategoryId: ${testJobs[0].categoryId || 'N/A'}`);
    } else {
      console.log(`\n⚠️  No jobs found for this category. This could mean:`);
      console.log(`   1. Jobs don't have categoryId set yet`);
      console.log(`   2. All jobs with this category are expired`);
      console.log(`   3. No jobs have been assigned to this category\n`);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

testCategoryFilter()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });


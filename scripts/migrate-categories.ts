import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDataSource } from "../lib/db";
import { Job } from "../entities/Job";
import { Category } from "../entities/Category";

async function migrateCategories() {
  console.log("🔄 Starting category migration...\n");

  const dataSource = await getDataSource();
  const jobRepository = dataSource.getRepository(Job);
  const categoryRepository = dataSource.getRepository(Category);

  try {
    // Step 1: Get all unique category strings from jobs using raw query
    // Check if there's an old 'category' column in the database
    const rawJobs = await jobRepository
      .createQueryBuilder("job")
      .select("job.id", "id")
      .addSelect("job.categoryOld", "categoryOld")
      .getRawMany();

    // Also try to get from any existing category column (if it exists as varchar)
    // We'll use raw SQL to check all possible category columns
    const allCategoryData = await dataSource.query(`
      SELECT id, 
             COALESCE("categoryOld", 
                      (SELECT column_name FROM information_schema.columns 
                       WHERE table_name = 'jobs' AND column_name = 'category' 
                       LIMIT 1)::text) as category_value
      FROM jobs
      WHERE "categoryOld" IS NOT NULL OR EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'category'
      )
      LIMIT 1000
    `).catch(() => []);

    // Get unique category names from categoryOld field
    const categoryNames = new Set<string>();
    
    // First, check if we can get categories from categoryOld
    for (const job of rawJobs) {
      const cat = job.categoryOld;
      if (cat && typeof cat === 'string' && cat.trim().length > 0) {
        categoryNames.add(cat.trim());
      }
    }

    // If no categories found in categoryOld, try to check if there's a category column
    if (categoryNames.size === 0) {
      const categoryColumnCheck = await dataSource.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'category'
      `);
      
      if (categoryColumnCheck.length > 0) {
        // There's a category column, get data from it
        const jobsWithCategory = await dataSource.query(`
          SELECT DISTINCT category 
          FROM jobs 
          WHERE category IS NOT NULL AND category != ''
          LIMIT 100
        `);
        
        jobsWithCategory.forEach((row: any) => {
          if (row.category && row.category.trim().length > 0) {
            categoryNames.add(row.category.trim());
            // Also copy to categoryOld for migration
            dataSource.query(`
              UPDATE jobs 
              SET "categoryOld" = category 
              WHERE category = $1 AND "categoryOld" IS NULL
            `, [row.category]).catch(() => {});
          }
        });
      }
    }

    console.log(`📊 Found ${categoryNames.size} unique categories\n`);

    // Step 2: Create Category entities for each unique name
    const categoryMap = new Map<string, Category>();

    for (const name of categoryNames) {
      // Check if category already exists
      let category = await categoryRepository.findOne({
        where: { name },
      });

      if (!category) {
        // Create slug from name
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        category = categoryRepository.create({
          name,
          slug,
        });
        category = await categoryRepository.save(category);
        console.log(`✅ Created category: ${name} (${category.id})`);
      } else {
        console.log(`ℹ️  Category already exists: ${name}`);
      }

      categoryMap.set(name, category);
    }

    // Step 3: Update all jobs with categoryId
    console.log(`\n🔄 Updating jobs with category IDs...\n`);

    // Step 3: Update all jobs with categoryId
    let updated = 0;
    
    // Get all jobs that have categoryOld set
    const jobsToUpdate = await jobRepository
      .createQueryBuilder("job")
      .where("job.categoryOld IS NOT NULL")
      .getMany();

    for (const job of jobsToUpdate) {
      const catName = (job as any).categoryOld?.trim();
      if (catName && catName.length > 0) {
        const category = categoryMap.get(catName);
        if (category) {
          await jobRepository.update(job.id, {
            categoryId: category.id,
          });
          updated++;
        }
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Created/Found ${categoryMap.size} categories`);
    console.log(`   - Updated ${updated} jobs with category IDs\n`);

    // Step 4: Verify migration
    const jobsWithCategory = await jobRepository.count({
      where: { categoryId: null as any },
    });
    console.log(`   - Jobs without category: ${jobsWithCategory}\n`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

migrateCategories()
  .then(() => {
    console.log("✅ Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration script failed:", error);
    process.exit(1);
  });


import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { getDataSource } from "../lib/db";
import { Category } from "../server/db/entities/Category";

// Common job categories in Nepal
const COMMON_CATEGORIES = [
  "Information Technology",
  "Software Development",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Marketing",
  "Digital Marketing",
  "Sales",
  "Business Development",
  "Finance",
  "Accounting",
  "Banking",
  "Human Resources",
  "Administration",
  "Customer Service",
  "Education",
  "Teaching",
  "Healthcare",
  "Medical",
  "Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Design",
  "Graphic Design",
  "UI/UX Design",
  "Content Writing",
  "Journalism",
  "Media",
  "Hospitality",
  "Tourism",
  "Retail",
  "Logistics",
  "Operations",
  "Project Management",
  "Consulting",
  "Legal",
  "Real Estate",
  "Construction",
  "Manufacturing",
  "Agriculture",
  "NGO",
  "Social Work",
  "Research",
  "Quality Assurance",
  "Network Administration",
  "System Administration",
  "Database Administration",
  "Security",
  "Other",
];

async function seedCategories() {
  console.log("🌱 Seeding categories...\n");

  const dataSource = await getDataSource();
  const categoryRepository = dataSource.getRepository(Category);

  try {
    let created = 0;
    let existing = 0;

    for (const name of COMMON_CATEGORIES) {
      // Check if category already exists
      const existingCategory = await categoryRepository.findOne({
        where: { name },
      });

      if (!existingCategory) {
        // Create slug from name
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const category = categoryRepository.create({
          name,
          slug,
        });

        await categoryRepository.save(category);
        console.log(`✅ Created: ${name}`);
        created++;
      } else {
        console.log(`ℹ️  Already exists: ${name}`);
        existing++;
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   - Created: ${created} categories`);
    console.log(`   - Already existed: ${existing} categories`);
    console.log(`   - Total: ${COMMON_CATEGORIES.length} categories\n`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seedCategories()
  .then(() => {
    console.log("✅ Seed script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });

import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { findOrCreateCategory, normalizeCategoryName } from "../lib/category-matcher";

// Test category assignment with various inputs
const testCategories = [
  "IT",
  "Information Technology",
  "Software Development",
  "Software",
  "Web Development",
  "Web Dev",
  "Marketing",
  "Digital Marketing",
  "Finance",
  "Accounting",
  "HR",
  "Human Resources",
  "Engineering",
  "Civil Engineering",
  "Design",
  "Graphic Design",
  "UI/UX",
  "Content Writing",
  "Unknown Category",
  "Random Category Name",
];

async function testCategoryAssignment() {
  console.log("🧪 Testing category assignment and matching...\n");

  for (const testCat of testCategories) {
    console.log(`\n📝 Testing: "${testCat}"`);
    
    const category = await findOrCreateCategory(testCat);
    if (category) {
      const normalized = normalizeCategoryName(testCat);
      console.log(`   Normalized: "${testCat}" → "${normalized}"`);
      console.log(`   ✅ Result: ${category.name} (${category.id.substring(0, 8)}...)`);
    } else {
      console.log(`   ❌ Failed to create/find category`);
    }
  }

  console.log("\n✅ Test completed!");
  process.exit(0);
}

testCategoryAssignment().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});


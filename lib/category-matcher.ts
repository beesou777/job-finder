import { getDataSource } from "./db";
import { Category } from "@/entities/Category";

/**
 * Find or create a category with fuzzy matching
 * This helps match variations like "IT", "Information Technology", "Software Development", etc.
 */
export async function findOrCreateCategory(categoryName: string): Promise<Category | null> {
  if (!categoryName || categoryName.trim().length === 0) {
    return null;
  }

  const dataSource = await getDataSource();
  const categoryRepository = dataSource.getRepository(Category);

  // First normalize the category name (map variations to standard names)
  const normalizedName = normalizeCategoryName(categoryName.trim());

  // First, try exact match (case-insensitive)
  let category = await categoryRepository.findOne({
    where: { name: normalizedName },
  });

  if (category) {
    console.log(`    ✅ Exact match found: "${normalizedName}" → ${category.name}`);
    return category;
  }

  // Try case-insensitive match
  const existingCategories = await categoryRepository.find();
  const lowerName = normalizedName.toLowerCase();

  // Check for exact case-insensitive match
  for (const cat of existingCategories) {
    if (cat.name.toLowerCase() === lowerName) {
      console.log(`    ✅ Exact case-insensitive match: "${normalizedName}" → ${cat.name}`);
      return cat;
    }
  }

  // Fuzzy matching: check if the category name contains or is contained by existing categories
  // But be more precise - avoid matching short words that appear in longer category names
  for (const cat of existingCategories) {
    const catLower = cat.name.toLowerCase();
    
    // Exact match (already checked above, but double-check)
    if (catLower === lowerName) {
      console.log(`    🔗 Exact match: "${normalizedName}" → ${cat.name}`);
      return cat;
    }
    
    // Only match if one is a significant part of the other (not just a substring)
    // For example: "IT" should match "Information Technology" but not "Digital Marketing"
    const words = lowerName.split(/\s+/);
    const catWords = catLower.split(/\s+/);
    
    // Check if all words from normalized name appear in category (for abbreviations)
    if (words.length <= 2 && words.every(word => word.length >= 2 && catLower.includes(word))) {
      // But avoid false matches - check if it's a meaningful match
      // "IT" should match "Information Technology" but not "Digital Marketing"
      const isMeaningfulMatch = 
        catLower.startsWith(lowerName) || 
        catLower.includes(` ${lowerName} `) ||
        catLower.endsWith(` ${lowerName}`) ||
        (lowerName.length >= 3 && catLower.includes(lowerName));
      
      if (isMeaningfulMatch) {
        console.log(`    🔗 Fuzzy match: "${normalizedName}" → ${cat.name}`);
        return cat;
      }
    }
    
    // Check if category name is contained in normalized name (for full names)
    if (catLower.length >= 5 && lowerName.includes(catLower)) {
      console.log(`    🔗 Contains match: "${normalizedName}" → ${cat.name}`);
      return cat;
    }
  }

  // If no match found, create a new category
  const slug = normalizedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  category = categoryRepository.create({
    name: normalizedName,
    slug,
  });

  category = await categoryRepository.save(category);
  console.log(`    ➕ Created new category: ${normalizedName} (${category.id.substring(0, 8)}...)`);

  return category;
}

/**
 * Map common category variations to standard names
 */
const CATEGORY_MAPPINGS: Record<string, string> = {
  // IT variations
  "it": "Information Technology",
  "information technology": "Information Technology",
  "ict": "Information Technology",
  "software": "Software Development",
  "software engineering": "Software Development",
  "programming": "Software Development",
  "coding": "Software Development",
  "developer": "Software Development",
  "web dev": "Web Development",
  "web developer": "Web Development",
  "frontend": "Web Development",
  "backend": "Software Development",
  "full stack": "Software Development",
  "fullstack": "Software Development",
  "mobile app": "Mobile Development",
  "android": "Mobile Development",
  "ios": "Mobile Development",
  "data": "Data Science",
  "data analyst": "Data Science",
  "data engineer": "Data Science",
  "ai": "Data Science",
  "machine learning": "Data Science",
  "ml": "Data Science",
  
  // Marketing variations
  "marketing": "Marketing",
  "digital marketing": "Digital Marketing",
  "social media": "Digital Marketing",
  "seo": "Digital Marketing",
  "content": "Content Writing",
  "content creator": "Content Writing",
  "copywriting": "Content Writing",
  
  // Design variations
  "design": "Design",
  "graphic design": "Graphic Design",
  "ui": "UI/UX Design",
  "ux": "UI/UX Design",
  "ui/ux": "UI/UX Design",
  "user interface": "UI/UX Design",
  "user experience": "UI/UX Design",
  
  // Engineering variations
  "engineering": "Engineering",
  "civil": "Civil Engineering",
  "mechanical": "Mechanical Engineering",
  "electrical": "Electrical Engineering",
  "computer engineering": "Software Development",
  
  // Finance variations
  "finance": "Finance",
  "accounting": "Accounting",
  "accountant": "Accounting",
  "banking": "Banking",
  "financial": "Finance",
  
  // HR variations
  "hr": "Human Resources",
  "human resource": "Human Resources",
  "recruitment": "Human Resources",
  "talent acquisition": "Human Resources",
  
  // Education variations
  "education": "Education",
  "teaching": "Teaching",
  "teacher": "Teaching",
  "academic": "Education",
  
  // Healthcare variations
  "healthcare": "Healthcare",
  "health": "Healthcare",
  "medical": "Medical",
  "nursing": "Medical",
  "doctor": "Medical",
};

/**
 * Normalize category name using mappings
 */
export function normalizeCategoryName(categoryName: string): string {
  if (!categoryName) return "";
  
  const normalized = categoryName.trim().toLowerCase();
  
  // Check mappings
  if (CATEGORY_MAPPINGS[normalized]) {
    return CATEGORY_MAPPINGS[normalized];
  }
  
  // Check partial matches - but be more precise
  // Only match if the key is a significant part (not just a substring)
  for (const [key, value] of Object.entries(CATEGORY_MAPPINGS)) {
    // If the normalized name is longer, check if key is a meaningful part
    if (normalized.length > key.length) {
      // Check if key appears as a whole word or at the start
      if (normalized.startsWith(key + " ") || normalized.includes(" " + key + " ") || normalized.endsWith(" " + key)) {
        return value;
      }
    } else if (key.length > normalized.length) {
      // If key is longer, check if normalized is a meaningful part
      if (key.startsWith(normalized + " ") || key.includes(" " + normalized + " ") || key.endsWith(" " + normalized)) {
        return value;
      }
    } else if (normalized === key) {
      // Exact match
      return value;
    }
  }
  
  // Return original with proper capitalization
  return categoryName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}


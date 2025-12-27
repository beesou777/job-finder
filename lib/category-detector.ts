import { normalizeCategoryName, findOrCreateCategory } from "./category-matcher";

/**
 * Detect category from job title, description, or other fields
 * This is a fallback when category is not explicitly provided
 */
export async function detectCategoryFromJob(
  title: string,
  description?: string,
  company?: string
): Promise<string | null> {
  const titleLower = title.toLowerCase();
  const descLower = (description || "").toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  // Category keywords mapping (order matters - more specific first)
  const categoryKeywords: Record<string, string[]> = {
    // Most specific first
    "UI/UX Design": [
      "ui/ux", "ui ux", "user interface", "user experience", "ux designer", "ui designer",
      "designer", "design", "figma", "sketch", "prototype"
    ],
    "Graphic Design": [
      "graphic design", "graphic designer", "photoshop", "illustrator", "adobe"
    ],
    "Mobile Development": [
      "mobile", "android", "ios", "react native", "flutter", "kotlin", "swift", "mobile app",
      "mobile developer", "kmp", "kotlin multiplatform", "angularjs", "react native"
    ],
    "Web Development": [
      "web developer", "web dev", "frontend", "react", "angular", "vue", "next.js", "javascript",
      "typescript", "html", "css", "front-end", "front end", "senior react developer",
      "senior react native developer"
    ],
    "Software Development": [
      "software", "developer", "programming", "coding", "programmer", "backend", "full stack",
      "fullstack", "mern", "mean", "stack developer", "senior developer", "principal engineer",
      "staff engineer", "engineering", "engineer", "dot net", ".net", "ruby on rails", "rails",
      "senior backend engineer", "senior software engineer", "senior ruby on rails developer",
      "mid-level kotlin multiplatform", "dot net developer"
    ],
    "Information Technology": [
      "it", "ict", "information technology", "system administrator", "network administrator",
      "devops", "cloud", "infrastructure", "sysadmin", "it administrator", "it admin"
    ],
    "Software Development": [
      "software", "developer", "programming", "coding", "programmer", "backend", "full stack",
      "fullstack", "mern", "mean", "stack developer", "senior developer", "principal engineer",
      "staff engineer", "engineering", "engineer", "dot net", ".net", "ruby on rails", "rails"
    ],
    "Web Development": [
      "web developer", "web dev", "frontend", "react", "angular", "vue", "next.js", "javascript",
      "typescript", "html", "css", "front-end", "front end"
    ],
    "Mobile Development": [
      "mobile", "android", "ios", "react native", "flutter", "kotlin", "swift", "mobile app",
      "mobile developer", "kmp", "kotlin multiplatform"
    ],
    "Data Science": [
      "data science", "data scientist", "data analyst", "data engineer", "data analytics",
      "machine learning", "ml", "ai", "artificial intelligence", "python", "data visualization",
      "analytics", "big data", "data analytics", "data science with python"
    ],
    "UI/UX Design": [
      "ui/ux", "ui ux", "user interface", "user experience", "ux designer", "ui designer",
      "designer", "design", "figma", "sketch", "prototype"
    ],
    "Graphic Design": [
      "graphic design", "graphic designer", "photoshop", "illustrator", "adobe"
    ],
    "Digital Marketing": [
      "digital marketing", "seo", "search engine", "social media", "ppc", "google ads",
      "facebook ads", "instagram", "twitter", "linkedin", "content marketing", "email marketing",
      "growth hacker", "growth marketing", "brand marketing", "branding", "seo specialist",
      "seo expert", "social media manager", "social media content", "twitter expert"
    ],
    "Marketing": [
      "marketing", "marketer", "marketing specialist", "marketing manager", "brand manager"
    ],
    "Sales": [
      "sales", "sales executive", "sales representative", "sdr", "sales development representative",
      "client acquisition", "account executive", "sales manager", "sales intern"
    ],
    "Business Development": [
      "business development", "bd executive", "bd manager", "business operations",
      "business development intern", "business development officer", "business development executive"
    ],
    "Content Writing": [
      "content writer", "content creator", "copywriter", "content writing", "blogger",
      "technical writer", "content specialist"
    ],
    "Human Resources": [
      "human resources", "hr", "recruitment", "recruiter", "talent acquisition", "hr manager",
      "people operations", "staff manager"
    ],
    "Project Management": [
      "project manager", "pm", "scrum master", "product manager", "program manager"
    ],
    "Quality Assurance": [
      "qa", "quality assurance", "test engineer", "testing", "qa engineer", "tester",
      "automation testing", "qa"
    ],
    "Customer Service": [
      "customer service", "customer support", "support executive", "customer care",
      "client support", "help desk"
    ],
    "Finance": [
      "finance", "financial", "financial analyst", "financial advisor", "cfo", "accounting"
    ],
    "Accounting": [
      "accountant", "accounting", "accountancy", "bookkeeping", "audit"
    ],
    "Education": [
      "instructor", "teacher", "mentor", "training", "education", "academic", "tutor",
      "ai/ml instructor", "data engineering instructor", "data science with python instructor",
      "digital marketing instructor", "instructor (mentor)", "instructors", "financial literacy",
      "crypto investment", "instructors (bhutan)"
    ],
    "Video Making Editing": [
      "video editor", "videographer", "video making", "video editing", "video production",
      "photographer", "camera", "cinematography", "ai video editor", "photographer/videographer",
      "photographer videographer", "videography"
    ],
    "Operations": [
      "operations", "operations manager", "ops", "business operations", "business operations intern"
    ],
    "Event Management": [
      "event management", "event planner", "event coordinator"
    ],
    "Game Development": [
      "game developer", "game development", "gaming", "unity", "unreal"
    ],
    "Security": [
      "security", "cybersecurity", "ethical hacking", "penetration testing", "security engineer",
      "ethical hacking & cybersecurity"
    ],
    "Telecom": [
      "telecom", "telecommunications", "telecommunication"
    ],
    "Tourism": [
      "tourism", "travel", "hospitality", "lgbt tourism"
    ],
    "Cloud Computing / Devops": [
      "devops", "cloud computing", "cloud", "aws", "azure", "gcp", "kubernetes", "docker",
      "cloud computing / devops", "devops intern"
    ],
  };

  // Check each category (more specific categories first)
  // Sort keywords by length (longer first) to match more specific terms first
  for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
    // Sort keywords by length (longest first) for more specific matching
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeywords) {
      // Use word boundary matching for short keywords to avoid false matches
      if (keyword.length <= 3) {
        // For short keywords like "IT", "HR", "QA", use word boundaries
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(combined)) {
          return categoryName;
        }
      } else {
        // For longer keywords, simple includes is usually safe
        if (combined.includes(keyword)) {
          return categoryName;
        }
      }
    }
  }

  return null;
}

/**
 * Get or create category for a job, with fallback detection
 */
export async function getCategoryForJob(
  categoryFromScraper?: string,
  title?: string,
  description?: string,
  company?: string
): Promise<{ categoryId: string | null; categoryName: string | null }> {
  // First, try to use category from scraper
  if (categoryFromScraper && categoryFromScraper.trim().length > 0) {
    const normalized = normalizeCategoryName(categoryFromScraper.trim());
    const category = await findOrCreateCategory(normalized);
    if (category) {
      return { categoryId: category.id, categoryName: category.name };
    }
  }

  // Fallback: detect from title/description
  if (title) {
    const detectedCategory = await detectCategoryFromJob(title, description, company);
    if (detectedCategory) {
      const category = await findOrCreateCategory(detectedCategory);
      if (category) {
        return { categoryId: category.id, categoryName: category.name };
      }
    }
  }

  return { categoryId: null, categoryName: null };
}


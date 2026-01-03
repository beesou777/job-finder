import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_API || "https://kamkhoj.eventeir.ai";
const SITE_NAME = "JobKhoj";

/**
 * Generate metadata for job detail pages
 */
export function generateJobMetadata(job: {
  title: string;
  company?: string | null;
  location?: string | null;
  description?: string | null;
  deadline?: string | null;
  id: string;
}): Metadata {
  const title = `${job.title}${job.company ? ` at ${job.company}` : ""}${job.location ? ` - ${job.location}` : ""} | JobKhoj`;
  const description = job.description
    ? `${job.description.substring(0, 120)}...`
    : `Apply for ${job.title}${job.company ? ` at ${job.company}` : ""}${job.location ? ` in ${job.location}` : ""}. Job opportunity in Nepal.${job.deadline ? ` Deadline: ${job.deadline}.` : ""}`;

  return {
    title,
    description,
    openGraph: {
      title: `${job.title}${job.company ? ` at ${job.company}` : ""}`,
      description: `Job opportunity${job.location ? ` in ${job.location}` : " in Nepal"}`,
      type: "article",
      url: `${BASE_URL}/jobs/${job.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title}${job.company ? ` at ${job.company}` : ""}`,
      description: `Job opportunity${job.location ? ` in ${job.location}` : " in Nepal"}`,
    },
    alternates: {
      canonical: `${BASE_URL}/jobs/${job.id}`,
    },
  };
}

/**
 * Generate metadata for category pages
 */
export function generateCategoryMetadata(
  categoryName: string,
  total: number
): Metadata {
  const title = `${categoryName} Jobs in Nepal | ${total}+ ${categoryName} Opportunities ${new Date().getFullYear()}`;
  const description = `Find ${categoryName} jobs in Nepal. Browse ${total}+ ${categoryName} job openings in Kathmandu, Pokhara, and across Nepal. Updated daily. Apply now.`;

  return {
    title,
    description,
    keywords: [
      `${categoryName.toLowerCase()} jobs nepal`,
      `${categoryName.toLowerCase()} jobs kathmandu`,
      `${categoryName.toLowerCase()} careers nepal`,
      `nepal ${categoryName.toLowerCase()} jobs`,
    ],
    openGraph: {
      title: `${categoryName} Jobs in Nepal | JobKhoj`,
      description: `Latest ${categoryName} job opportunities in Nepal`,
      url: `${BASE_URL}/jobs?category=${encodeURIComponent(categoryName.toLowerCase())}`,
    },
    alternates: {
      canonical: `${BASE_URL}/jobs?category=${encodeURIComponent(categoryName.toLowerCase())}`,
    },
  };
}

/**
 * Generate metadata for location pages
 */
export function generateLocationMetadata(
  city: string,
  total: number
): Metadata {
  const title = `Jobs in ${city}, Nepal | ${total}+ Job Opportunities ${city} ${new Date().getFullYear()}`;
  const description = `Find jobs in ${city}, Nepal. Browse ${total}+ job openings in ${city} from top companies. IT jobs, marketing jobs, and more. Updated daily.`;

  return {
    title,
    description,
    keywords: [
      `jobs in ${city.toLowerCase()}`,
      `${city.toLowerCase()} jobs nepal`,
      `jobs ${city.toLowerCase()}`,
      `nepal jobs ${city.toLowerCase()}`,
    ],
    openGraph: {
      title: `Jobs in ${city}, Nepal | JobKhoj`,
      description: `Latest job opportunities in ${city}, Nepal`,
      url: `${BASE_URL}/jobs/location/${encodeURIComponent(city.toLowerCase())}`,
    },
    alternates: {
      canonical: `${BASE_URL}/jobs/location/${encodeURIComponent(city.toLowerCase())}`,
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JobPosting structured data
 */
export function generateJobPostingSchema(job: {
  title: string;
  description?: string | null;
  company?: string | null;
  location?: string | null;
  salaryText?: string | null;
  deadline?: string | null;
  createdAt: Date | string;
  expiresAt?: Date | string | null;
  applyUrl: string;
  type?: string | null;
  id: string;
}) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.title,
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: job.id,
    },
    datePosted: typeof job.createdAt === "string" ? job.createdAt : job.createdAt.toISOString(),
    validThrough: job.expiresAt
      ? typeof job.expiresAt === "string"
        ? job.expiresAt
        : job.expiresAt.toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType:
      job.type === "internship"
        ? "INTERN"
        : job.type === "part-time"
        ? "PART_TIME"
        : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "Company",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Nepal",
        addressCountry: "NP",
      },
    },
    url: job.applyUrl,
  };

  if (job.salaryText) {
    return {
      ...baseSchema,
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "NPR",
        value: {
          "@type": "QuantitativeValue",
          value: job.salaryText,
        },
      },
    };
  }

  return baseSchema;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description: "Best Job Aggregator Sites in Nepal - Find jobs and internships across Nepal from all major portals",
    sameAs: [
      // Add social media URLs when available
      // "https://www.facebook.com/jobkhoj",
      // "https://www.linkedin.com/company/jobkhoj",
    ],
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: "Best Job Aggregator Sites in Nepal - Job aggregator sites in Nepal - Find jobs and internships from all major portals",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate FAQPage structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate CollectionPage structured data for job aggregator
 */
export function generateCollectionPageSchema(totalItems: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Best Job Aggregator Sites in Nepal - JobKhoj",
    description: `Job aggregator sites in Nepal - Browse ${totalItems}+ job listings aggregated from top Nepali job portals including MeroJob, JobsNepal, KumariJob, Kantipur Job, and more.`,
    url: BASE_URL,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalItems,
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: "Job Listings from Multiple Portals",
        description: "Aggregated job listings from all major Nepali job portals",
      },
    },
    about: {
      "@type": "Thing",
      name: "Job Aggregator Sites in Nepal",
      description: "Platform that collects and displays job listings from multiple Nepali job portals in one unified interface",
    },
  };
}

/**
 * Generate ItemList structured data for job aggregator homepage
 */
export function generateJobAggregatorSchema(jobs: Array<{ id: string; title: string; company?: string | null }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Job Aggregator Sites in Nepal - Job Listings",
    description: "Job listings aggregated from top Nepali job portals",
    numberOfItems: jobs.length,
    itemListElement: jobs.map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "JobPosting",
        identifier: job.id,
        title: job.title,
        hiringOrganization: {
          "@type": "Organization",
          name: job.company || "Company",
        },
      },
    })),
  };
}


import { Metadata } from "next";
import { slugify } from "./utils";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

const BASE_URL = SITE_URL;

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
  const title = `${job.title}${job.company ? ` at ${job.company}` : ""}${job.location ? ` - ${job.location}` : ""} | ${SITE_NAME}`;
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
      images: [{ url: DEFAULT_OG_IMAGE }],
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
 * Generate metadata for LinkedIn job detail pages
 */
export function generateLinkedInJobMetadata(job: {
  title: string;
  company?: string | null;
  place?: string | null;
  description?: string | null;
  id: number;
  slug?: string | null;
}): Metadata {
  const title = `${job.title}${job.company ? ` at ${job.company}` : ""}${job.place ? ` - ${job.place}` : ""} | LinkedIn Jobs | ${SITE_NAME}`;
  const description = job.description
    ? `${job.description.substring(0, 155).replace(/\n/g, ' ')}...`
    : `Apply for ${job.title}${job.company ? ` at ${job.company}` : ""}${job.place ? ` in ${job.place}` : ""}. LinkedIn job opportunity.`;

  const jobSlug = job.slug || `${slugify(job.title)}-${job.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${BASE_URL}/linkedin-jobs/${jobSlug}`,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/linkedin-jobs/${jobSlug}`,
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
      title: `${categoryName} Jobs in Nepal | kamkhoj`,
      description: `Latest ${categoryName} job opportunities in Nepal`,
      url: `${BASE_URL}/jobs/category/${slugify(categoryName)}`,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    alternates: {
      canonical: `${BASE_URL}/jobs/category/${slugify(categoryName)}`,
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
      title: `Jobs in ${city}, Nepal | kamkhoj`,
      description: `Latest job opportunities in ${city}, Nepal`,
      url: `${BASE_URL}/jobs/${slugify(city)}`,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    alternates: {
      canonical: `${BASE_URL}/jobs/${slugify(city)}`,
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
    url: `${BASE_URL}/jobs/${job.id}`,
    directApply: false,
  };

  if (job.salaryText) {
    return {
      ...baseSchema,
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "NPR",
        value: {
          "@type": "QuantitativeValue",
          minValue: 0,
          unitText: job.salaryText,
        },
      },
    };
  }

  return baseSchema;
}

/**
 * Generate JobPosting structured data for LinkedIn jobs
 */
export function generateLinkedInJobPostingSchema(job: {
  title: string;
  description?: string | null;
  company?: string | null;
  place?: string | null;
  job_date?: Date | string | null;
  apply_link: string;
  id: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.title,
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: `linkedin-${job.id}`,
    },
    datePosted: job.job_date
      ? (typeof job.job_date === "string" ? job.job_date : job.job_date.toISOString())
      : new Date().toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "Company",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.place || "Nepal",
        addressCountry: "NP",
      },
    },
    url: job.apply_link,
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
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
    logo: `${BASE_URL}/kamkhoj.png`,
    description: "KamKhoj is a Nepal job search and career resource website.",
    sameAs: [
      // Add social media URLs when available
      // "https://www.facebook.com/kamkhoj",
      // "https://www.linkedin.com/company/kamkhoj",
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
    description: "KamKhoj helps job seekers discover Nepal vacancies and career resources.",
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

export function generateCollectionMetadata(input: {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    openGraph: {
      title: input.title,
      description: input.description,
      url: absoluteUrl(input.path),
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} job search` }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
      canonical: absoluteUrl(input.path),
    },
  };
}

/**
 * Generate CollectionPage structured data for job aggregator
 */
export function generateCollectionPageSchema(totalItems: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "KamKhoj job search collection",
    description: `Browse ${totalItems}+ listings organized for Nepal job discovery and continue to the original source to verify final details.`,
    url: BASE_URL,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalItems,
      itemListElement: {
        "@type": "ListItem",
        position: 1,
        name: "Curated job discovery",
        description: "Listings organized for easier comparison by Nepal job seekers",
      },
    },
    about: {
      "@type": "Thing",
      name: "Nepal job search",
      description: "Job discovery and career-resource content for Nepal job seekers",
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
    name: "KamKhoj job listings",
    description: "Listings organized for KamKhoj users",
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


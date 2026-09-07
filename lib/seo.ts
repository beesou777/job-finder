import { Metadata } from "next";
import { slugify } from "./utils";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

const BASE_URL = SITE_URL;

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
    ...(job.expiresAt
      ? {
          validThrough:
            typeof job.expiresAt === "string"
              ? job.expiresAt
              : job.expiresAt.toISOString(),
        }
      : {}),
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
    url: `${BASE_URL}/job/${job.id}`,
    directApply: false,
  };

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


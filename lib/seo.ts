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
  const title = `${job.title}${job.company ? ` at ${job.company}` : ""}${job.place ? ` - ${job.place}` : ""}`;
  const socialTitle = `${title} | ${SITE_NAME}`;
  const description = job.description
    ? `${job.description.substring(0, 155).replace(/\n/g, ' ')}...`
    : `Apply for ${job.title}${job.company ? ` at ${job.company}` : ""}${job.place ? ` in ${job.place}` : ""}. LinkedIn job opportunity.`;

  const jobSlug = job.slug || `${slugify(job.title)}-${job.id}`;

  return {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description,
      type: "article",
      url: `${BASE_URL}/linkedin-jobs/${jobSlug}`,
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
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
  const title = `${categoryName} Jobs in Nepal`;
  const description = `Find ${categoryName} jobs in Nepal and review ${total.toLocaleString()} current listings collected from public job sources before applying on the original site.`;

  return {
    title,
    description,
    openGraph: {
      title: `${categoryName} Jobs in Nepal | ${SITE_NAME}`,
      description,
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
  const title = `Jobs in ${city}, Nepal`;
  const description = `Find jobs in ${city}, Nepal and review ${total.toLocaleString()} current listings collected from public job sources before applying on the original site.`;

  return {
    title,
    description,
    openGraph: {
      title: `Jobs in ${city}, Nepal | ${SITE_NAME}`,
      description,
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
  isRemote?: boolean;
}) {
  const isRemote = job.isRemote || job.type === "remote";
  const employmentType =
    job.type === "internship"
      ? "INTERN"
      : job.type === "part-time"
        ? "PART_TIME"
        : job.type === "full-time"
          ? "FULL_TIME"
          : job.type === "contract"
            ? "CONTRACTOR"
            : undefined;
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
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
    ...(employmentType ? { employmentType } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
    },
    ...(isRemote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: { "@type": "Country", name: "Nepal" },
        }
      : {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              ...(job.location ? { addressLocality: job.location } : {}),
              addressCountry: "NP",
            },
          },
        }),
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
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: `linkedin-${job.id}`,
    },
    ...(job.job_date
      ? {
          datePosted:
            typeof job.job_date === "string" ? job.job_date : job.job_date.toISOString(),
        }
      : {}),
    ...(job.company
      ? { hiringOrganization: { "@type": "Organization", name: job.company } }
      : {}),
    ...(job.place
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.place,
              addressCountry: "NP",
            },
          },
        }
      : {}),
    url: absoluteUrl(`/linkedin-jobs/${job.id}`),
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

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/favicon.svg"),
      width: 64,
      height: 64,
    },
    description: "A Nepal-focused job discovery and search platform.",
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: ["KamKhoj.com", "kamkhoj.com"],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBlogPostingSchema(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
}) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: [DEFAULT_OG_IMAGE],
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absoluteUrl("/kamkhoj.png") },
    },
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


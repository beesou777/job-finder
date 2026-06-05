import { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { ExpiringSection } from "@/components/home/ExpiringSection";
import { LatestJobs } from "@/components/home/LatestJobs";
import { LatestInternships } from "@/components/home/LatestInternships";
import { 
  FeaturesSection, 
  ScrapingInfoSection, 
  ResourcesSection 
} from "@/components/home/HomeStaticSections";
import { FAQ } from "@/components/FAQ";
import { getJobs } from "@/lib/data-fetching";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "Best Job Aggregator Sites in Nepal | Job Aggregator Sites in Nepal | kamkhoj",
  description:
    "Best job aggregator sites in Nepal - Search 10,000+ jobs from MeroJob, JobsNepal, KumariJob, Kantipur Job all in one place. Top job aggregator sites in Nepal. Free job search. Updated daily.",
  keywords: [
    "best job aggregator sites in nepal",
    "job aggregator sites in nepal",
    "jobs in nepal",
    "nepal jobs",
    "jobs kathmandu",
    "job portal nepal",
    "nepal job search",
    "internships nepal",
    "jobs pokhara",
    "nepal employment",
    "job opportunities nepal",
    "remote jobs nepal",
    "part time jobs nepal",
    "merocareer",
    "jobsnepal",
    "kumarijob",
    "internsathi",
    "jobaxle",
    "nepal job aggregator",
    "job aggregator nepal",
    "best job sites nepal",
    "top job aggregator nepal",
  ],
  openGraph: {
    title: "Best Job Aggregator Sites in Nepal | Job Aggregator Sites in Nepal",
    description:
      "Best job aggregator sites in Nepal - Search thousands of jobs from top Nepali job portals all in one place. Find jobs in Kathmandu, Pokhara, and cities across Nepal. Free job search.",
    url: "https://www.kamkhoj.com/",
    siteName: "kamkhoj - Nepal's Best Job Aggregator",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "kamkhoj - Nepal's Job Finder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Job Aggregator Sites in Nepal | kamkhoj",
    description:
      "Best job aggregator sites in Nepal - Search thousands of jobs from top Nepali job portals all in one place",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Revalidate every 5 min to reduce DB egress (ISR)
export const revalidate = 300;

export default async function Home({
  searchParams,
}: {
  searchParams: { urgency?: string };
}) {
  const urgency = searchParams.urgency || "7days";
  
  // Prefetch first 10 jobs for SEO structured data (SSR)
  const { jobs: latestJobs, total } = await getJobs({ limit: 10, type: "job" });

  const baseUrl = SITE_URL;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: "Nepal's #1 Job Finder - Find jobs and internships across Nepal",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Best Job Aggregator Sites in Nepal - kamkhoj",
    description: `Job aggregator sites in Nepal - Browse ${total}+ job listings aggregated from top Nepali job portals`,
    url: baseUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      description: "Job listings aggregated from multiple Nepali job portals",
    },
  };

  const jobPostingStructuredData = latestJobs.map((job: any) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.title,
    identifier: {
      "@type": "PropertyValue",
      name: "kamkhoj",
      value: job.id,
    },
    datePosted: job.createdAt,
    validThrough:
      job.expiresAt ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.type === "internship" ? "INTERN" : "FULL_TIME",
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
    baseSalary: job.salaryText
      ? {
          "@type": "MonetaryAmount",
          currency: "NPR",
          value: {
            "@type": "QuantitativeValue",
            value: job.salaryText,
          },
        }
      : undefined,
    url: job.applyUrl,
  }));

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      {jobPostingStructuredData.map((data: any, index: number) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <HomeHero />
      <ExpiringSection urgency={urgency} />
      <FeaturesSection />
      <LatestJobs />
      <LatestInternships />
      <ScrapingInfoSection />
      <ResourcesSection />
      
      <FAQ />
    </div>
  );
}

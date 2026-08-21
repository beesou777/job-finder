import { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { ExpiringSection } from "@/components/home/ExpiringSection";
import { LatestJobs } from "@/components/home/LatestJobs";
import { LatestInternships } from "@/components/home/LatestInternships";
import {
  FeaturesSection,
  EditorialStandardsSection,
  ScrapingInfoSection,
  ResourcesSection,
} from "@/components/home/HomeStaticSections";
import { FAQ } from "@/components/FAQ";
import { MarketSnapshot } from "@/components/home/MarketSnapshot";
import { getJobs } from "@/server/services/data-fetching";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "KamKhoj | Find Jobs and Internships in Nepal",
  description:
    "Search Nepal jobs and internships, compare the details that matter, and continue to the original source for the final application process.",
  keywords: [
    "jobs in nepal",
    "nepal jobs",
    "nepal job search",
    "internships nepal",
    "remote jobs nepal",
    "career resources nepal",
  ],
  openGraph: {
    title: "KamKhoj | Find Jobs and Internships in Nepal",
    description:
      "Browse Nepal jobs, internships, and practical career resources, then verify final details at the original source.",
    url: "https://www.kamkhoj.com/",
    siteName: "kamkhoj",
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
    title: "KamKhoj | Find Jobs and Internships in Nepal",
    description: "Search Nepal jobs and internships and continue to the original source to apply.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Revalidate every 5 min to reduce DB egress (ISR)
export const revalidate = 300;

export default async function Home({ searchParams }: { searchParams: { urgency?: string } }) {
  const urgency = searchParams.urgency || "7days";

  // Prefetch first 10 jobs for SEO structured data (SSR)
  const { jobs: latestJobs, total } = await getJobs({ limit: 10, type: "job" });

  const baseUrl = SITE_URL;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: "Nepal job search and career resources from KamKhoj",
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
    name: "KamKhoj job search",
    description: `Browse ${total}+ current listings collected for Nepal job discovery and continue to the original source to apply.`,
    url: baseUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      description: "Job listings aggregated from multiple Nepali job portals",
    },
  };

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

      <HomeHero />
      <ExpiringSection urgency={urgency} />
      <FeaturesSection />
      <LatestJobs />
      <LatestInternships />
      <MarketSnapshot />
      <ScrapingInfoSection />
      <EditorialStandardsSection />
      <ResourcesSection />

      <FAQ />
    </div>
  );
}

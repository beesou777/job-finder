import { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { HowWorksSection } from "@/components/home/HomeStaticSections";
import {
  FeaturedJobsSection,
  FinalCtaSection,
  HomeFaqSection,
  ImpactSection,
  LatestOpportunitiesSection,
  ResourcesAndStoriesSection,
  TestimonialsSection,
  WhySection,
} from "@/components/home/HomeReferenceLayout";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import { getJobs } from "@/server/services/data-fetching";

export const metadata: Metadata = {
  title: { absolute: "KamKhoj | Find Jobs and Internships in Nepal" },
  description:
    "Search Nepal jobs and internships, compare the details that matter, and continue to the original source for the final application process.",
  openGraph: {
    title: "KamKhoj | Find Jobs and Internships in Nepal",
    description:
      "Browse Nepal jobs, internships, and practical career resources, then verify final details at the original source.",
    url: "https://www.kamkhoj.com/",
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "KamKhoj job search in Nepal",
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

export default async function Home({ searchParams }: { searchParams: { urgency?: string } }) {
  const structuredData = generateWebSiteSchema();

  // Real listing items for the CollectionPage schema so crawlers and answer
  // engines receive the inventory graph as data, not just rendered cards.
  // Cached server-side (60s); adds no browser Network request.
  const { jobs } = await getJobs({ limit: 10, type: "job" });

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "KamKhoj job search",
    description:
      "Browse current listings collected for Nepal job discovery and continue to the original source to apply.",
    url: `${SITE_URL}/`,
    mainEntity: {
      "@type": "ItemList",
      description: "Job listings aggregated from multiple Nepali job portals",
      numberOfItems: jobs.length,
      itemListElement: jobs.map((job: any, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/job/${job.id}`),
        ...(job.title ? { name: String(job.title) } : {}),
      })),
    },
  };
  const organizationSchema = generateOrganizationSchema();

  return (
    <div className="homepage min-h-screen">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <HomeHero />
      <FeaturedJobsSection />
      <HowWorksSection />
      <LatestOpportunitiesSection />
      <WhySection />
      <ResourcesAndStoriesSection />
      <TestimonialsSection />
      <HomeFaqSection />
      <FinalCtaSection />
    </div>
  );
}

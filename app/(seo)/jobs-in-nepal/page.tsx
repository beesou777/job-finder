import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { getLandingPageRobots, SeoSearchParams, seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["jobs-in-nepal"];

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: SeoSearchParams }) {
  const robots = await getLandingPageRobots(config, searchParams);
  return {
    ...generateCollectionMetadata({
      path: "/jobs-in-nepal",
      title: config.title,
      description: config.description,
      keywords: ["jobs in nepal", "latest jobs in nepal", "nepal jobs", "vacancy in nepal"],
    }),
    robots,
  };
}

export default function Page({ searchParams }: { searchParams: SeoSearchParams }) {
  return (
    <SEOLandingPage
      config={config}
      page={Number(searchParams.page || 1)}
      searchParams={searchParams}
    />
  );
}

import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { getLandingPageRobots, SeoSearchParams, seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["jobs-in-pokhara"];

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: SeoSearchParams }) {
  const robots = await getLandingPageRobots(config, searchParams);
  return {
    ...generateCollectionMetadata({
      path: "/jobs-in-pokhara",
      title: config.title,
      description: config.description,
      keywords: ["jobs in pokhara", "pokhara jobs", "vacancy in pokhara"],
    }),
    robots,
  };
}

export default function Page({ searchParams }: { searchParams: SeoSearchParams }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} searchParams={searchParams} />;
}

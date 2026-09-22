import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { getLandingPageRobots, SeoSearchParams, seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["marketing-jobs-nepal"];

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: SeoSearchParams }) {
  const robots = await getLandingPageRobots(config, searchParams);
  return {
    ...generateCollectionMetadata({
      path: "/marketing-jobs-nepal",
      title: config.title,
      description: config.description,
      keywords: ["marketing jobs nepal", "digital marketing jobs nepal", "sales jobs nepal"],
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

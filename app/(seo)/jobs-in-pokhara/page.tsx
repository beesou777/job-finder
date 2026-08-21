import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { getLandingPageRobots, seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["jobs-in-pokhara"];

export async function generateMetadata() {
  const robots = await getLandingPageRobots(config);
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

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

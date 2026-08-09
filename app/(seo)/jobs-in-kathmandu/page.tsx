import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { getLandingPageRobots, seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["jobs-in-kathmandu"];

export async function generateMetadata() {
  const robots = await getLandingPageRobots(config);
  return {
    ...generateCollectionMetadata({
  path: "/jobs-in-kathmandu",
  title: config.title,
  description: config.description,
  keywords: ["jobs in kathmandu", "job vacancy in kathmandu", "latest jobs kathmandu"],
}),
    robots,
  };
}

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}
import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { getLandingPageRobots, seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["internships-in-nepal"];

export async function generateMetadata() {
  const robots = await getLandingPageRobots(config);
  return {
    ...generateCollectionMetadata({
  path: "/internships-in-nepal",
  title: config.title,
  description: config.description,
  keywords: ["internship in nepal", "internships in kathmandu", "nepal internships"],
}),
    robots,
  };
}

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}
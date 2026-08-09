import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["it-jobs-nepal"];

export const metadata = generateCollectionMetadata({
  path: "/it-jobs-nepal",
  title: config.title,
  description: config.description,
  keywords: ["IT jobs in nepal", "software engineer jobs nepal", "frontend developer jobs nepal"],
});

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

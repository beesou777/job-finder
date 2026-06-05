import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["jobs-in-nepal"];

export const metadata = generateCollectionMetadata({
  path: "/jobs-in-nepal",
  title: config.title,
  description: config.description,
  keywords: ["jobs in nepal", "latest jobs in nepal", "nepal jobs", "vacancy in nepal"],
});

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

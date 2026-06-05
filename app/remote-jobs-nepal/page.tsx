import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["remote-jobs-nepal"];

export const metadata = generateCollectionMetadata({
  path: "/remote-jobs-nepal",
  title: config.title,
  description: config.description,
  keywords: ["remote jobs nepal", "work from home jobs nepal", "international remote jobs"],
});

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

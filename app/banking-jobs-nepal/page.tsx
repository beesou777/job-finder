import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["banking-jobs-nepal"];

export const metadata = generateCollectionMetadata({
  path: "/banking-jobs-nepal",
  title: config.title,
  description: config.description,
  keywords: ["banking jobs nepal", "bank vacancy nepal", "finance jobs nepal"],
});

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

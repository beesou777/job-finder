import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["marketing-jobs-nepal"];

export const metadata = generateCollectionMetadata({
  path: "/marketing-jobs-nepal",
  title: config.title,
  description: config.description,
  keywords: ["marketing jobs nepal", "digital marketing jobs nepal", "sales jobs nepal"],
});

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

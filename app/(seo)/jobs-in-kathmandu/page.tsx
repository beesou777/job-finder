import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["jobs-in-kathmandu"];

export const metadata = generateCollectionMetadata({
  path: "/jobs-in-kathmandu",
  title: config.title,
  description: config.description,
  keywords: ["jobs in kathmandu", "job vacancy in kathmandu", "latest jobs kathmandu"],
});

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

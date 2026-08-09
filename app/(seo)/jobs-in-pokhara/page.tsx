import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { seoLandingPages } from "@/lib/seo-pages";

const config = seoLandingPages["jobs-in-pokhara"];

export const metadata = generateCollectionMetadata({
  path: "/jobs-in-pokhara",
  title: config.title,
  description: config.description,
  keywords: ["jobs in pokhara", "pokhara jobs", "vacancy in pokhara"],
});

export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  return <SEOLandingPage config={config} page={Number(searchParams.page || 1)} />;
}

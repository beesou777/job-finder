import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEOLandingPage } from "@/components/SEOLandingPage";
import { generateCollectionMetadata } from "@/lib/seo";
import { hasIndexChangingSearchParams, isLandingPageIndexable } from "@/lib/seo-pages";
import { roleLandingPages, SEO_MIN_ACTIVE_JOBS } from "@/lib/role-pages";

export const revalidate = 300;

export function generateStaticParams() {
  return Object.keys(roleLandingPages).map((role) => ({ role }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { role: string };
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const config = roleLandingPages[params.role];
  if (!config) return { title: "Role Not Found", robots: { index: false, follow: true } };

  const hasParameters = hasIndexChangingSearchParams(searchParams);
  const hasInventory = await isLandingPageIndexable(config, SEO_MIN_ACTIVE_JOBS);
  return {
    ...generateCollectionMetadata({
      path: config.path!,
      title: config.title,
      description: config.description,
    }),
    robots:
      !hasParameters && hasInventory
        ? { index: true, follow: true }
        : { index: false, follow: true },
  };
}

export default function RolePage({
  params,
  searchParams,
}: {
  params: { role: string };
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
    jobType?: string;
    location?: string;
    urgency?: string;
  };
}) {
  const config = roleLandingPages[params.role];
  if (!config) notFound();
  return (
    <SEOLandingPage
      config={config}
      page={Number(searchParams.page || 1)}
      searchParams={searchParams}
    />
  );
}

import { Metadata } from "next";
import { JobsBrowserPage } from "@/components/jobs/JobsBrowserPage";
import { absoluteUrl } from "@/lib/site";

export function generateMetadata({
  searchParams,
}: {
  searchParams: {
    search?: string;
    category?: string;
    jobType?: string;
    location?: string;
    urgency?: string;
    page?: string;
  };
}): Metadata {
  const page = parseInt(searchParams.page || "1", 10);
  const hasActiveFilters = Boolean(
    searchParams.search ||
    searchParams.category ||
    searchParams.jobType ||
    searchParams.location ||
    searchParams.urgency,
  );
  const shouldNoIndex = hasActiveFilters || page > 1;

  return {
    title: "Internships in Nepal | Browse Latest Internship Openings",
    description:
      "Browse internships in Nepal by company, category, location, and source. Find current internship opportunities and verify details on the original posting.",
    alternates: {
      canonical: absoluteUrl("/internships"),
    },
    robots: shouldNoIndex ? { index: false, follow: true } : undefined,
  };
}

export default function InternshipsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    category?: string;
    jobType?: string;
    location?: string;
    urgency?: string;
    page?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const filterOptions = {
    search: searchParams.search,
    categoryId: searchParams.category,
    type: "internship",
    jobType: searchParams.jobType,
    location: searchParams.location,
    urgency: searchParams.urgency,
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <JobsBrowserPage
        page={page}
        filters={filterOptions}
        basePath="/internships"
        title="Find the Best Internships in Nepal"
        searchPlaceholder="Search internships by title, company, or category..."
      />
    </div>
  );
}

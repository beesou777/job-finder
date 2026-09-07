import { Metadata } from "next";
import { JobsBrowserPage } from "@/components/jobs/JobsBrowserPage";
import { absoluteUrl } from "@/lib/site";

export function generateMetadata({
  searchParams,
}: {
  searchParams: {
    search?: string;
    category?: string;
    type?: string;
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
    searchParams.urgency ||
    (searchParams.type && searchParams.type !== "job"),
  );
  const shouldNoIndex = hasActiveFilters || page > 1;

  return {
    title: "Jobs in Nepal | Browse Latest Job Openings",
    description:
      "Browse active jobs in Nepal by company, category, location, and source. Compare listings from major Nepali job portals in one place.",
    alternates: {
      canonical: absoluteUrl("/jobs"),
    },
    robots: shouldNoIndex ? { index: false, follow: true } : undefined,
  };
}

export default function JobsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    category?: string;
    type?: string;
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
    type: searchParams.type || "job",
    jobType: searchParams.jobType,
    location: searchParams.location,
    urgency: searchParams.urgency,
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <JobsBrowserPage page={page} filters={filterOptions} />
    </div>
  );
}

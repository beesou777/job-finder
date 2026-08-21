import { Metadata } from "next";
import { Suspense } from "react";
import { JobsFiltering } from "@/components/jobs/JobsFiltering";
import { JobsList, JobsSkeleton } from "@/components/jobs/JobsList";
import { getCategories } from "@/server/services/data-fetching";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

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

export default async function JobsPage({
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
  const categories = await getCategories({ limit: 100 });

  // Static filters for now (can be dynamic later)
  const jobTypes = [
    { value: "full-time", label: "Full-time", count: 0 },
    { value: "part-time", label: "Part-time", count: 0 },
    { value: "contract", label: "Contract", count: 0 },
    { value: "remote", label: "Remote", count: 0 },
    { value: "hybrid", label: "Hybrid", count: 0 },
    { value: "onsite", label: "On-site", count: 0 },
  ];

  const locations = [
    { value: "Kathmandu", label: "Kathmandu", count: 0 },
    { value: "Lalitpur", label: "Lalitpur", count: 0 },
    { value: "Bhaktapur", label: "Bhaktapur", count: 0 },
    { value: "Pokhara", label: "Pokhara", count: 0 },
    { value: "Chitwan", label: "Chitwan", count: 0 },
    { value: "Butwal", label: "Butwal", count: 0 },
    { value: "Biratnagar", label: "Biratnagar", count: 0 },
    { value: "Remote", label: "Remote", count: 0 },
  ];

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
      <JobsFiltering categories={categories} jobTypes={jobTypes} locations={locations} />

      <div className="container mx-auto px-4 py-8">
        <Suspense key={JSON.stringify(searchParams)} fallback={<JobsSkeleton />}>
          <JobsList page={page} {...filterOptions} />
        </Suspense>
      </div>
    </div>
  );
}

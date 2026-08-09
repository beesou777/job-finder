import { Metadata } from "next";
import { Suspense } from "react";
import { JobsFiltering } from "@/components/jobs/JobsFiltering";
import { JobsList, JobsSkeleton } from "@/components/jobs/JobsList";
import { getCategories } from "@/server/services/data-fetching";
import { absoluteUrl } from "@/lib/site";

export const dynamic = 'force-dynamic';

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
      searchParams.urgency
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

export default async function InternshipsPage({
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
  const categories = await getCategories({ limit: 100 });
  
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
    type: "internship",
    jobType: searchParams.jobType,
    location: searchParams.location,
    urgency: searchParams.urgency,
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <JobsFiltering 
        categories={categories}
        jobTypes={jobTypes}
        locations={locations}
        basePath="/internships"
        title="Find the Best Internships in Nepal"
        searchPlaceholder="Search internships by title, company, or category..."
      />
      
      <div className="container mx-auto px-4 py-8">
        <Suspense key={JSON.stringify(searchParams)} fallback={<JobsSkeleton />}>
          <JobsList 
            page={page}
            {...filterOptions}
          />
        </Suspense>
      </div>
    </div>
  );
}
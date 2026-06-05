import { Suspense } from "react";
import { JobsFiltering } from "@/components/jobs/JobsFiltering";
import { JobsList, JobsSkeleton } from "@/components/jobs/JobsList";
import { getCategories } from "@/lib/data-fetching";

export const dynamic = 'force-dynamic';

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

import { Suspense } from "react";
import { LinkedInJobsFiltering } from "@/components/linkedin/LinkedInJobsFiltering";
import { LinkedInJobsList, LinkedInJobsSkeleton } from "@/components/linkedin/LinkedInJobsList";
import { LinkedInJobDetail } from "@/components/linkedin/LinkedInJobDetail";
import { getLinkedInJobs } from "@/lib/data-fetching";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LinkedInJobsPage({
  searchParams,
}: {
  searchParams: { 
    search?: string; 
    company?: string; 
    place?: string; 
    datePosted?: string; 
    page?: string; 
    jobId?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const jobId = searchParams.jobId ? parseInt(searchParams.jobId) : undefined;
  
  // Fetch filters AND jobs in one efficient cached call
  const { filters, total, jobs } = await getLinkedInJobs({
      search: searchParams.search,
      company: searchParams.company,
      place: searchParams.place,
      datePosted: searchParams.datePosted,
      limit: 20,
      offset: (page - 1) * 20,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <LinkedInJobsFiltering 
        companies={filters.companies}
        places={filters.places}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">LinkedIn Jobs</h1>
            <p className="text-sm text-gray-600">
              Total {total.toLocaleString()} Jobs found
            </p>
          </div>

          <LinkedInJobsList 
            jobs={jobs}
            total={total}
            page={page}
            search={searchParams.search}
            company={searchParams.company}
            place={searchParams.place}
            datePosted={searchParams.datePosted}
          />
        </div>
      </div>
    </div>
  );
}

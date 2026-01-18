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
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Job List */}
          <div className="w-full md:w-1/3 lg:w-2/5">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Total {total.toLocaleString()} LinkedIn Jobs
                </p>
              </div>

              {/* No key here because data is already resolved, preventing skeleton flicker on selection */}
              <LinkedInJobsList 
                jobs={jobs}
                total={total}
                page={page}
                search={searchParams.search}
                company={searchParams.company}
                place={searchParams.place}
                datePosted={searchParams.datePosted}
                selectedJobId={jobId}
              />
            </div>
          </div>

          {/* Right Side - Job Details */}
          <div className="w-full md:w-2/3 lg:w-3/5">
            <Suspense key={`detail-${jobId}`} fallback={
               <div className="flex items-center justify-center p-12 bg-white border-2 border-dashed border-gray-200 rounded-lg">
                 <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
               </div>
            }>
              <LinkedInJobDetail jobId={jobId} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

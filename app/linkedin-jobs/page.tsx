import { Metadata } from "next";
import { LinkedInJobsFiltering } from "@/components/linkedin/LinkedInJobsFiltering";
import { LinkedInJobsList } from "@/components/linkedin/LinkedInJobsList";
import { getLinkedInJobs } from "@/lib/data-fetching";
import { absoluteUrl } from "@/lib/site";

export const dynamic = 'force-dynamic';

export function generateMetadata({
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
}): Metadata {
  const page = parseInt(searchParams.page || "1", 10);
  const hasActiveFilters = Boolean(
    searchParams.search ||
      searchParams.company ||
      searchParams.place ||
      searchParams.datePosted ||
      searchParams.jobId
  );
  return {
    title: "LinkedIn Jobs | External Job Discovery",
    description:
      "Search LinkedIn-sourced opportunities by company, location, and posting date, then verify the latest details on the original source before applying.",
    alternates: {
      canonical: absoluteUrl("/linkedin-jobs"),
    },
    robots: { index: false, follow: true },
  };
}

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
    <div className="min-h-screen bg-[#070708] text-zinc-100">
      <LinkedInJobsFiltering 
        companies={filters.companies}
        places={filters.places}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">
                External job discovery
              </p>
              <h1 className="text-4xl font-black tracking-tight text-zinc-50">LinkedIn Jobs</h1>
              <p className="mt-3 max-w-2xl text-zinc-400">
                Search LinkedIn-sourced opportunities by company, location, and
                posting date, then verify details on the source before applying.
              </p>
            </div>
            <p className="text-sm font-bold text-zinc-400">
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

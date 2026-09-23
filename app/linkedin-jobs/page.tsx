import { Suspense } from "react";
import { Metadata } from "next";
import { LinkedInJobsFiltering } from "@/components/linkedin/LinkedInJobsFiltering";
import { LinkedInJobsList, LinkedInJobsSkeleton } from "@/components/linkedin/LinkedInJobsList";
import { getLinkedInJobs } from "@/server/services/data-fetching";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LinkedIn Jobs | External Job Discovery",
  description:
    "Search LinkedIn-sourced opportunities by company, location, and posting date, then verify the latest details on the original source before applying.",
  alternates: { canonical: absoluteUrl("/linkedin-jobs") },
  robots: { index: false, follow: true },
};

const ITEMS_PER_PAGE = 20;

export default async function LinkedInJobsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    company?: string;
    place?: string;
    datePosted?: string;
    page?: string;
  };
}) {
  const pageValue = Number.parseInt(searchParams?.page ?? "1", 10);
  const page = Number.isFinite(pageValue) ? Math.min(500, Math.max(1, pageValue)) : 1;

  // Server-side fetch: the browser receives rendered HTML, never a
  // `/api/linkedin-jobs` XHR in DevTools Network.
  const data = await getLinkedInJobs({
    search: searchParams?.search,
    company: searchParams?.company,
    place: searchParams?.place,
    datePosted: searchParams?.datePosted,
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#102e67]">
      <LinkedInJobsFiltering companies={data.filters.companies} places={data.filters.places} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">
              External job discovery
            </p>
            <h1 className="text-4xl font-black tracking-tight text-[#102e67]">LinkedIn Jobs</h1>
            <p className="mt-3 max-w-2xl text-[#617493]">
              Search LinkedIn-sourced opportunities by company, location, and posting date, then
              verify details on the source before applying.
            </p>
          </div>
          <p className="text-sm font-bold text-[#617493]">
            Total {data.total.toLocaleString()} Jobs found
          </p>
        </div>

        <Suspense fallback={<LinkedInJobsSkeleton />}>
          <LinkedInJobsList
            jobs={data.jobs}
            total={data.total}
            page={page}
            search={searchParams?.search}
            company={searchParams?.company}
            place={searchParams?.place}
            datePosted={searchParams?.datePosted}
          />
        </Suspense>
      </div>
    </div>
  );
}

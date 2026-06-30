import { getRemoteJobs } from "@/lib/data-fetching";
import { RemoteJobsFiltering } from "@/components/remote/RemoteJobsFiltering";
import { RemoteJobCard } from "@/components/RemoteJobCard";
import { RemotePagination } from "@/components/remote/RemotePagination";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const dynamic = 'force-dynamic';

export function generateMetadata({
  searchParams,
}: {
  searchParams: {
    page?: string;
    q?: string;
  };
}): Metadata {
  const page = parseInt(searchParams.page || "1", 10);
  return {
    title: "International Remote Jobs",
    description:
      "Browse international remote jobs in technology, design, marketing, and more, then open the original source for the latest application details.",
    alternates: {
      canonical: absoluteUrl("/remote-jobs"),
    },
    robots: { index: false, follow: true },
  };
}

export default async function RemoteJobsPage({
  searchParams,
}: {
  searchParams: { 
    page?: string;
    q?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const ITEMS_PER_PAGE = 21;

  const { jobs, total } = await getRemoteJobs({
    page,
    limit: ITEMS_PER_PAGE,
    search: searchParams.q || "",
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <RemoteJobsFiltering facetCounts={[]} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">
              Global remote work
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white">Remote Jobs</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Browse international remote roles and review company requirements,
              salary text, region, and experience before opening the detail page.
            </p>
          </div>
          <p className="text-sm font-bold text-zinc-300">
            Total {total.toLocaleString()} Jobs found
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-white/10 bg-[#18181a]">
            <p className="text-xl text-zinc-400">No international remote jobs found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              {jobs.map((job: any) => (
                <RemoteJobCard key={job._id} job={job} />
              ))}
            </div>

            {total > ITEMS_PER_PAGE && (
              <div className="mt-8">
                <RemotePagination 
                  currentPage={page}
                  totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
                  totalItems={total}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RemoteJobsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="border border-white/10 bg-[#18181a] h-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-white/10 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

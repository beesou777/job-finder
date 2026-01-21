import { getRemoteJobs } from "@/lib/data-fetching";
import { RemoteJobsFiltering } from "@/components/remote/RemoteJobsFiltering";
import { RemoteJobCard } from "@/components/RemoteJobCard";
import { RemotePagination } from "@/components/remote/RemotePagination";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "International Remote Jobs | kamkhoj",
  description: "Browse high-paying international remote jobs in technology, design, marketing, and more. Apply to top global companies from anywhere.",
};

export const dynamic = 'force-dynamic';

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
    <div className="min-h-screen bg-gray-50">
      {/* We keep the component but it might need updates later if it relies on client-side facet counts */}
      <RemoteJobsFiltering facetCounts={[]} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Remote Jobs</h1>
          <p className="text-sm text-gray-600">
            Total {total.toLocaleString()} Jobs found
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No international remote jobs found matching your criteria.</p>
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
        <Card key={i} className="border border-gray-200 bg-white h-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

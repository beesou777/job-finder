import { JobCard } from "@/components/JobCard";
import { JobsPagination } from "./JobsPagination";
import { getJobs, GetJobsOptions } from "@/server/services/data-fetching";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface JobsListProps extends GetJobsOptions {
  page: number;
}

export async function JobsList({ page, ...options }: JobsListProps) {
  const ITEMS_PER_PAGE = 12;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const { jobs, total } = await getJobs({
    ...options,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#18181a] py-16 text-center">
        <div className="mx-auto max-w-md px-4">
          <p className="mb-2 text-xl font-black text-white">
            No jobs found matching your criteria.
          </p>
          <p className="mb-6 text-sm leading-6 text-zinc-400">
            Try adjusting your search terms or removing some filters to see more results.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/jobs">
              <Button
                size="lg"
                className="rounded-full border border-primary bg-primary px-7 text-zinc-950 hover:bg-white font-black"
              >
                View All Jobs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-zinc-400">
          Showing job leads from public Nepali sources
        </p>
        <p className="text-sm font-bold text-white">{total.toLocaleString()} results</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job as any} />
        ))}
      </div>

      {totalPages > 1 && (
        <JobsPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={ITEMS_PER_PAGE}
          // The Pagination component will need to handle URL updates
          // or we pass a base URL
        />
      )}
    </>
  );
}

export function JobsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[...Array(12)].map((_, i) => (
        <Card key={i} className="border border-white/10 bg-[#18181a] h-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-white/10 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-white/10 rounded w-16 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

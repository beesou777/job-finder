import { JobCard } from "@/components/JobCard";
import { JobsPagination } from "./JobsPagination";
import { getJobs, GetJobsOptions } from "@/lib/data-fetching";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <p className="text-xl text-muted-foreground mb-2">
            No jobs found matching your criteria.
          </p>
          <p className="text-muted-foreground mb-6 text-sm">
            Try adjusting your search terms or removing some filters to see more results.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/jobs">
              <Button>View All Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <>
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
        <Card key={i} className="border-2 border-gray-200 bg-white h-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

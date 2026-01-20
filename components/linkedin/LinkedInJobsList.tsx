import { getLinkedInJobs } from "@/lib/data-fetching";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { slugify } from "@/lib/utils";

import { LinkedInPagination } from "./LinkedInPagination";

interface LinkedInJobsListProps {
  jobs: any[];
  total: number;
  page: number;
  search?: string;
  company?: string;
  place?: string;
  datePosted?: string;
}

export function LinkedInJobsList({
  jobs,
  total,
  page,
  search,
  company,
  place,
  datePosted,
}: LinkedInJobsListProps) {
  const ITEMS_PER_PAGE = 20;

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "N/A";
    const now = new Date();
    const jobDate = new Date(date);
    const diffInMs = now.getTime() - jobDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return `Posted ${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `Posted ${diffInDays}d ago`;
    } else {
      return jobDate.toLocaleDateString();
    }
  };

  if (jobs.length === 0) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6 text-center py-8">
          <p className="text-gray-600">No jobs found matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
      {jobs.map((job) => (
        <Card
          key={job.id}
          className="h-full flex flex-col border border-gray-300 bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex-1 flex flex-col pt-6 pb-6 px-6">
            <div className="flex items-start justify-between gap-3 mb-3 min-h-[4.5rem]">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 leading-snug text-gray-900">
                  {job.title}
                </h3>
                {job.company && (
                  <div className="flex items-center gap-2 mt-2 text-gray-700">
                    <Building2 className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span className="truncate text-sm font-medium">{job.company}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.place && (
                <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span className="truncate">{job.place}</span>
                </Badge>
              )}
              {job.job_date && (
                <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                  <span>{formatRelativeTime(job.job_date)}</span>
                </Badge>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <Link
                href={`/linkedin-jobs/${slugify(job.title)}-${job.id}`}
                className="flex items-center justify-between text-[#0A66C2] hover:text-[#004182] font-semibold text-sm transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>
      ))}

      {total > ITEMS_PER_PAGE && (
        <div className="col-span-full mt-6">
          <LinkedInPagination 
            currentPage={page}
            totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
}

export function LinkedInJobsSkeleton() {
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

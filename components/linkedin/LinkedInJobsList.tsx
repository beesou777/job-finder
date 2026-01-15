import { getLinkedInJobs } from "@/lib/data-fetching";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import Link from "next/link";

import { LinkedInPagination } from "./LinkedInPagination";

interface LinkedInJobsListProps {
  jobs: any[];
  total: number;
  page: number;
  search?: string;
  company?: string;
  place?: string;
  datePosted?: string;
  selectedJobId?: number;
}

export function LinkedInJobsList({
  jobs,
  total,
  page,
  search,
  company,
  place,
  datePosted,
  selectedJobId,
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
    <div className="space-y-3">
      {jobs.map((job) => (
        <Link 
          key={job.id} 
          href={`/linkedin-jobs?jobId=${job.id}${search ? `&search=${search}` : ""}${company ? `&company=${company}` : ""}${place ? `&place=${place}` : ""}${datePosted ? `&datePosted=${datePosted}` : ""}${page > 1 ? `&page=${page}` : ""}`}
          scroll={false}
        >
          <Card
            className={`border-2 cursor-pointer transition-all hover:shadow-md mb-3 ${
              selectedJobId === job.id
                ? "border-[#0A66C2] bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-base text-gray-900 line-clamp-2 flex-1">
                  {job.title}
                </h3>
              </div>
              {job.company && (
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Building2 className="h-4 w-4 mr-1" />
                  <span className="truncate">{job.company}</span>
                </div>
              )}
              {job.place && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{job.place}</span>
                </div>
              )}
              {job.job_date && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatRelativeTime(job.job_date)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}

      {total > ITEMS_PER_PAGE && (
        <div className="mt-6">
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
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="border-2 border-gray-200">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

import { LinkedInPagination } from "./LinkedInPagination";

interface LinkedInJobsListProps {
  jobs: Array<Record<string, any>>;
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
      <Card className="border border-[#dce8f7] bg-white">
        <CardContent className="pt-6 text-center py-8">
          <p className="text-[#617493]">No jobs found matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
      {jobs.map((job) => (
        <Card key={job.id} className="reference-listing-card group">
          <div className="flex items-start gap-3">
            <div className="company-mark listing-company-mark">
              {String(job.company || "L")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#102e67]">
                {job.company || "LinkedIn source"}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#7183a3]">
                LINKEDIN SOURCE
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#8b9bb6]">
              <Clock3 className="h-3.5 w-3.5" /> {formatRelativeTime(job.job_date)}
            </span>
          </div>
          <h3 className="mt-4 line-clamp-2 text-[17px] font-extrabold leading-tight text-[#102e67] transition-colors group-hover:text-primary">
            {job.title}
          </h3>
          <div className="mt-3 space-y-1 text-[13px] text-[#617493]">
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {job.place || "Nepal"}
            </p>
            <p className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Public LinkedIn lead
            </p>
          </div>
          <div className="mt-4 flex min-h-6 flex-wrap gap-2">
            <span className="job-chip">External source</span>
            {job.place && <span className="job-chip">{job.place}</span>}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-[#e7eef8] pt-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-white" />
              Verify on source
            </span>
            <Link
              href={`/linkedin-jobs/${slugify(job.title)}-${job.id}`}
              className="inline-flex items-center gap-1 text-sm font-bold text-primary"
            >
              View job <ArrowRight className="h-4 w-4" />
            </Link>
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
        <Card key={i} className="border border-[#e3edf8] bg-white h-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-[#e9f1fb] rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-[#e9f1fb] rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-4 bg-[#e9f1fb] rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-[#e9f1fb] rounded w-20 animate-pulse"></div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="h-4 bg-[#e9f1fb] rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

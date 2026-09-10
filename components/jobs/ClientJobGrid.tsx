"use client";

import { useEffect, useState } from "react";
import { getJobs, GetJobsOptions, JobItem } from "@/lib/api-client";
import { JobCard } from "@/components/JobCard";

export function ClientJobGrid({
  options,
  emptyMessage,
}: {
  options: GetJobsOptions;
  emptyMessage: string;
}) {
  const [jobs, setJobs] = useState<JobItem[] | null>(null);
  useEffect(() => {
    let active = true;
    getJobs(options)
      .then(({ jobs }) => active && setJobs(jobs))
      .catch(() => active && setJobs([]));
    return () => {
      active = false;
    };
  }, [options.limit, options.type, options.urgency]);
  if (jobs === null)
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-[#e3edf8] bg-[#e9f1fb]"
          />
        ))}
      </div>
    );
  if (!jobs.length)
    return <div className="py-12 text-center text-lg text-zinc-400">{emptyMessage}</div>;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job as any} />
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Clock3, MapPin } from "lucide-react";
import { getJobs, JobItem, GetJobsOptions } from "@/lib/api-client";

type ApiJob = JobItem & {
  title?: string;
  company?: string;
  source?: string;
  location?: string;
  salaryText?: string;
  jobType?: string;
  category?: string | { name?: string };
  postedAt?: string;
  createdAt?: string;
};

export function HomeApiJobRail({
  eyebrow,
  title,
  description,
  options,
}: {
  eyebrow: string;
  title: string;
  description: string;
  options: GetJobsOptions;
}) {
  const [jobs, setJobs] = useState<ApiJob[] | null>(null);

  useEffect(() => {
    let active = true;
    getJobs(options)
      .then(({ jobs: result }) => active && setJobs(result as ApiJob[]))
      .catch(() => active && setJobs([]));
    return () => {
      active = false;
    };
  }, [options.limit, options.type, options.urgency]);

  return (
    <section className="bg-white py-14">
      <div className="site-container">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="home-eyebrow">
              <span />
              {eyebrow}
            </p>
            <h2 className="home-section-title">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          <Link href="/jobs" className="home-text-link hidden sm:flex">
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {jobs === null ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-[270px] animate-pulse rounded-xl bg-blue-50" />
            ))}
          </div>
        ) : jobs.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {jobs.slice(0, 4).map((job) => (
              <ApiJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-blue-100 bg-blue-50/40 px-6 py-10 text-center text-sm text-slate-500">
            No matching jobs are available right now.{" "}
            <Link href="/jobs" className="font-bold text-primary">
              Browse all jobs
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ApiJobCard({ job }: { job: ApiJob }) {
  const company = job.company || job.source || "KamKhoj listing";
  const category =
    typeof job.category === "string" ? job.category : job.category?.name || "Opportunity";
  const postedAt = job.postedAt || job.createdAt;
  const posted = postedAt ? new Date(postedAt) : null;
  const daysAgo =
    posted && !Number.isNaN(posted.getTime())
      ? Math.max(0, Math.floor((Date.now() - posted.getTime()) / 86_400_000))
      : null;
  const initials = company.slice(0, 1).toUpperCase();

  return (
    <article className="reference-job-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="company-mark">{initials}</span>
          <div>
            <p className="truncate text-xs font-bold text-slate-700">{company}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[.08em] text-slate-400">
              {job.source || "Original source"}
            </p>
          </div>
        </div>
        <span className="sr-only">Job opportunity</span>
      </div>
      <h3 className="mt-5 line-clamp-2 text-[15px] font-extrabold leading-5 text-[#112d62]">
        {job.title || "Open opportunity"}
      </h3>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        {job.location || "Nepal"}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <BriefcaseBusiness className="h-3.5 w-3.5" />
        {job.salaryText || "Salary details on source"}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="job-chip">{job.jobType || "Full-time"}</span>
        <span className="job-chip">{category}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock3 className="h-3 w-3" />
          {daysAgo === null ? "Recently posted" : daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
        </span>
        <Link
          href={`/job/${job.id}`}
          className="text-xs font-extrabold text-primary hover:text-accent"
        >
          View details <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

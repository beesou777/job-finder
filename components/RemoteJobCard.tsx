import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Clock3, MapPin } from "lucide-react";
import { slugify } from "@/lib/utils";

interface RemoteJobCardProps {
  job: {
    _id: string;
    jobTitle: string;
    companyName: string;
    region?: string;
    candidateLocation?: string;
    tags?: string[];
    salary?: string;
    neededExperience?: string;
    createdAt?: string;
  };
}

export function RemoteJobCard({ job }: RemoteJobCardProps) {
  const location = job.region || job.candidateLocation || "Remote";
  const days = job.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 86400000))
    : 0;
  return (
    <article className="reference-listing-card group">
      <div className="flex items-start gap-3">
        <div className="company-mark listing-company-mark">
          {job.companyName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[#102e67]">{job.companyName}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#7183a3]">
            REMOTE SOURCE
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#8b9bb6]">
          <Clock3 className="h-3.5 w-3.5" /> {days === 0 ? "Today" : `${days} days ago`}
        </span>
      </div>
      <h2 className="mt-4 line-clamp-2 text-[17px] font-extrabold leading-tight text-[#102e67] transition-colors group-hover:text-primary">
        {job.jobTitle}
      </h2>
      <div className="mt-2 space-y-1 text-[13px] text-[#617493]">
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </p>
        <p className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5" />
          {job.salary || "Negotiable"}
        </p>
      </div>
      <div className="mt-4 flex min-h-6 flex-wrap gap-2">
        {job.tags?.slice(0, 2).map((tag) => (
          <span className="job-chip" key={tag}>
            {tag}
          </span>
        ))}
        {job.neededExperience && <span className="job-chip">{job.neededExperience}</span>}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[#e7eef8] pt-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-white" />
          Verified source
        </span>
        <Link
          href={`/remote-jobs/${slugify(job.jobTitle)}-${job._id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary"
        >
          View job <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

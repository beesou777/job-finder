import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, MapPin } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company?: string;
    location?: string;
    source: string;
    category?: string | { id?: string; name: string; slug?: string };
    type?: "job" | "internship";
    jobType?: string;
    salaryText?: string;
    createdAt?: string;
    postedAt?: string | Date;
    lastVerifiedAt?: string | Date;
  };
}

function relativeTime(value?: string | Date) {
  if (!value) return "Recently";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000));
  return days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`;
}

export function JobCard({ job }: JobCardProps) {
  const company = job.company || job.source || "KamKhoj source";
  const categoryName =
    job.category && typeof job.category === "object" ? job.category.name : job.category;
  const jobType = job.jobType || (job.type === "internship" ? "Internship" : "Full-time");
  const verified = job.lastVerifiedAt || job.createdAt || job.postedAt;

  return (
    <article className="reference-listing-card group">
      <div className="flex items-start gap-3">
        <div className="company-mark listing-company-mark">{company.charAt(0).toUpperCase()}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[#102e67]">{company}</p>
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-[#7183a3]">
            {job.type === "internship" ? "INTERNSHIP" : job.source}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#8b9bb6]">
          <Clock3 className="h-3.5 w-3.5" /> {relativeTime(job.postedAt || job.createdAt)}
        </span>
      </div>
      <h2 className="mt-4 line-clamp-2 text-[17px] font-extrabold leading-tight text-[#102e67] transition-colors group-hover:text-primary">
        {job.title}
      </h2>
      <div className="mt-2 space-y-1 text-[13px] text-[#617493]">
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {job.location || "Nepal"}
        </p>
        <p className="flex items-center gap-2">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          {job.salaryText || "Negotiable"}
        </p>
      </div>
      <div className="mt-4 flex min-h-6 flex-wrap gap-2">
        <span className="job-chip">{jobType}</span>
        {categoryName && <span className="job-chip">{categoryName}</span>}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#e7eef8] pt-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-500 text-white" />
          {verified ? `Verified ${new Date(verified).toLocaleDateString()}` : "Verified source"}
        </span>
        <Link
          href={`/job/${job.id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-[#0d3dba]"
        >
          View job <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

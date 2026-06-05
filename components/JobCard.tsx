import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Briefcase, ArrowRight, Clock3 } from "lucide-react";
import { slugify } from "@/lib/utils";

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
    deadline?: string;
    expiresAt?: string | Date;
    applyUrl: string;
    createdAt?: string;
    postedAt?: string | Date;
  };
}

export function JobCard({ job }: JobCardProps) {
  const postedDate = job.postedAt ? new Date(job.postedAt) : (job.createdAt ? new Date(job.createdAt) : new Date());
  const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate days left until deadline/expiration
  const getDaysLeft = () => {
    if (!job.deadline && !job.expiresAt) return null;
    
    let deadlineDate: Date | null = null;
    
    // Try to parse deadline string first
    if (job.deadline) {
      deadlineDate = new Date(job.deadline);
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = null;
      }
    }
    
    // Fall back to expiresAt if deadline parsing failed
    if (!deadlineDate && job.expiresAt) {
      deadlineDate = new Date(job.expiresAt);
    }
    
    if (!deadlineDate || isNaN(deadlineDate.getTime())) {
      return null;
    }
    
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysLeft = getDaysLeft();

  // Determine job type text
  const jobTypeText = job.jobType || (job.type === "internship" ? "Internship" : "Full Time");
  const salaryText = job.salaryText || "Negotiable";
  const companyInitial = (job.company || job.source || "K").charAt(0).toUpperCase();

  return (
    <Card className="group h-full min-h-[260px] flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#242426] text-zinc-100 shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-primary/80 hover:bg-[#29292c]">
      <CardHeader className="px-6 pb-4 pt-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-zinc-950 text-primary shadow-[0_0_18px_rgba(190,242,100,.18)]">
              <span className="font-mono text-sm font-black">{companyInitial}</span>
            </div>
            <div className="min-w-0">
              {job.company && (
                <Link
                  href={`/company/${slugify(job.company)}`}
                  className="block truncate font-mono text-sm font-black uppercase tracking-[0.18em] text-zinc-200 hover:text-primary"
                >
                  {job.company}
                </Link>
              )}
              <span className="mt-1 block truncate text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
                {job.type === "internship" ? "Internship" : job.source}
              </span>
            </div>
          </div>

          <a
            href={`/apply/${job.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 items-center gap-2 rounded-full border-2 border-primary px-6 py-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-zinc-100 transition-colors hover:bg-primary hover:text-zinc-950 md:inline-flex"
          >
            View Job
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="min-w-0">
          <CardTitle className="mb-2 line-clamp-2 text-xl font-black leading-tight text-zinc-100">
              {job.title}
          </CardTitle>
          {job.location && (
            <Link href={`/jobs/${slugify(job.location)}`} className="inline-flex items-center gap-2 text-base font-semibold text-zinc-300 hover:text-primary">
              <MapPin className="h-4 w-4 text-zinc-500" />
              {job.location}
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-6 pb-6">
        <div className="mb-6 min-h-8">
          {salaryText && (
            <div className="inline-flex items-baseline gap-2 text-2xl font-black text-white">
              {salaryText}
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          {(job.deadline || daysLeft !== null) && (
            <Badge className="max-w-full rounded-full border border-white/25 bg-transparent px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300 hover:bg-transparent">
              <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${
                daysLeft !== null && daysLeft <= 3 
                  ? "text-red-500" 
                  : daysLeft !== null && daysLeft <= 7 
                  ? "text-amber-500" 
                  : "text-gray-500"
              }`} />
              <span className="truncate">
                {daysLeft !== null ? (
                  daysLeft < 0 ? "Expired" : daysLeft === 0 ? "Expires today" : daysLeft === 1 ? "1 day left" : daysLeft <= 7 ? `${daysLeft} days left` : `${daysLeft} days left`
                ) : (
                  job.deadline ? job.deadline : "Deadline: Soon"
                )}
              </span>
            </Badge>
          )}
          {jobTypeText && (
            <Badge className="max-w-full rounded-full border border-white/25 bg-transparent px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300 hover:bg-transparent">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
              <span className="truncate">{jobTypeText}</span>
            </Badge>
          )}
          {job.category && (
            <Link
              href={
                typeof job.category === "object" && job.category !== null && "slug" in job.category
                  ? `/jobs/category/${(job.category as { slug?: string; name: string }).slug || slugify((job.category as { name: string }).name)}`
                  : `/jobs?search=${encodeURIComponent(String(job.category))}`
              }
            >
            <Badge className="max-w-full rounded-full border border-white/25 bg-transparent px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300 hover:bg-transparent">
              <span className="truncate block">
                {typeof job.category === 'object' && job.category !== null && 'name' in job.category 
                  ? (job.category as { name: string }).name 
                  : String(job.category)}
              </span>
            </Badge>
            </Link>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-black text-zinc-400">
            <Clock3 className="h-3.5 w-3.5" />
            {daysAgo <= 0 ? "Posted today" : `${daysAgo}d ago`}
          </span>
          <a
            href={`/apply/${job.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-3 font-mono text-sm font-black uppercase tracking-[0.16em] text-zinc-100 transition-colors hover:bg-primary hover:text-zinc-950 md:hidden"
          >
            View Job
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}


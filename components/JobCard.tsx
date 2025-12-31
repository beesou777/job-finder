import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, ExternalLink, DollarSign, Calendar, Sparkles, Clock, Briefcase, ArrowRight } from "lucide-react";
import { addUtmParams } from "@/lib/utils";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company?: string;
    location?: string;
    source: string;
    category?: string;
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
  const isNew = daysAgo <= 3;

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

  return (
    <Card className="h-full flex flex-col border border-gray-300 bg-white">
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 leading-snug text-gray-900">
              {job.title}
            </CardTitle>
            {job.company && (
              <CardDescription className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span className="truncate text-sm font-medium text-gray-700">{job.company}</span>
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-1.5 items-end ml-2 flex-shrink-0">
            {isNew && (
              <Badge className="text-[10px] px-2 py-0.5 bg-[#0A66C2] text-white border-0 font-medium">
                New
              </Badge>
            )}
            <Badge className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 border-0 font-normal">
              {job.type === "internship" ? "Internship" : job.source}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-6 pb-6">
        {/* Horizontal Badges for Key Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(job.deadline || daysLeft !== null) && (
            <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5 max-w-full">
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
          {job.location && (
            <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5 max-w-full">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
              <span className="truncate max-w-[200px]">{job.location}</span>
            </Badge>
          )}
          {jobTypeText && (
            <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5 max-w-full">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">{jobTypeText}</span>
            </Badge>
          )}
          {salaryText && (
            <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5 max-w-full">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
              <span className="truncate">{salaryText}</span>
            </Badge>
          )}
        </div>

        {job.category && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="text-xs px-2 py-0.5 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-normal max-w-full">
              <span className="truncate block">
                {typeof job.category === 'object' && job.category !== null && 'name' in job.category 
                  ? (job.category as { name: string }).name 
                  : String(job.category)}
              </span>
            </Badge>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <a 
            href={addUtmParams(job.applyUrl, job.source, job.id)} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 text-primary hover:text-primary/90 font-medium text-sm"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}


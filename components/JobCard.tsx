import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, ExternalLink, DollarSign, Calendar, Sparkles, Clock } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company?: string;
    location?: string;
    source: string;
    category?: string;
    type?: "job" | "internship";
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

  return (
    <Card className="h-full flex flex-col border-2 border-gray-200 bg-white relative overflow-hidden">
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2 line-clamp-2 leading-tight font-bold text-gray-900">
              {job.title}
            </CardTitle>
            {job.company && (
              <CardDescription className="flex items-center gap-2 text-base mt-1">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Building2 className="w-4 h-4 flex-shrink-0 text-blue-600" />
                </div>
                <span className="truncate font-semibold text-gray-700">{job.company}</span>
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end ml-2">
            {isNew && (
              <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
            <Badge 
              variant={job.type === "internship" ? "default" : "secondary"} 
              className={`text-xs ${
                job.type === "internship" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-md" 
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {job.type === "internship" ? "Internship" : job.source}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col relative z-10">
        <div className="space-y-3 mb-4">
          {job.location && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />
              </div>
              <span className="truncate text-gray-600 font-medium">{job.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <DollarSign className="w-3.5 h-3.5 flex-shrink-0 text-green-600" />
            </div>
            <span className="truncate text-gray-600 font-medium">
              {job.salaryText || "Negotiable"}
            </span>
          </div>
          {(job.deadline || daysLeft !== null) && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`p-1.5 rounded-lg ${
                daysLeft !== null && daysLeft <= 3 
                  ? "bg-red-100" 
                  : daysLeft !== null && daysLeft <= 7 
                  ? "bg-orange-100" 
                  : "bg-blue-100"
              }`}>
                <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${
                  daysLeft !== null && daysLeft <= 3 
                    ? "text-red-600" 
                    : daysLeft !== null && daysLeft <= 7 
                    ? "text-orange-600" 
                    : "text-blue-600"
                }`} />
              </div>
              <span className="text-gray-600 font-medium">
                {daysLeft !== null ? (
                  <span>
                    {daysLeft < 0 ? (
                      <span className="text-red-600 font-semibold">Expired</span>
                    ) : daysLeft === 0 ? (
                      <span className="text-orange-600 font-semibold">Expires today</span>
                    ) : daysLeft === 1 ? (
                      <span className="text-orange-600 font-semibold">1 day left</span>
                    ) : daysLeft <= 7 ? (
                      <span className="text-orange-600 font-semibold">{daysLeft} days left</span>
                    ) : (
                      <span>{daysLeft} days left</span>
                    )}
                    {job.deadline && (
                      <span className="text-gray-500 ml-1">({job.deadline})</span>
                    )}
                  </span>
                ) : (
                  job.deadline ? `Deadline: ${job.deadline}` : "Deadline: Soon"
                )}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
            <Clock className="w-3 h-3" />
            <span>Posted {daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`}</span>
          </div>
        </div>

        {job.category && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700 font-medium">
              {typeof job.category === 'object' && job.category !== null && 'name' in job.category 
                ? (job.category as { name: string }).name 
                : String(job.category)}
            </Badge>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md border-0">
              Apply Now
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}


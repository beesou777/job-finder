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
    applyUrl: string;
    createdAt: string;
  };
}

export function JobCard({ job }: JobCardProps) {
  const postedDate = new Date(job.createdAt);
  const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
  const isNew = daysAgo <= 3;

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 h-full flex flex-col border-2 border-gray-200 hover:border-blue-500 hover:-translate-y-1 bg-white relative overflow-hidden">
      {/* Decorative gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors font-bold text-gray-900">
              {job.title}
            </CardTitle>
            {job.company && (
              <CardDescription className="flex items-center gap-2 text-base mt-1">
                <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
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
          {job.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-orange-600" />
              </div>
              <span className="text-gray-600 font-medium">Deadline: {job.deadline}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
            <Clock className="w-3 h-3" />
            <span>Posted {daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`}</span>
          </div>
        </div>

        {job.category && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium">
              {typeof job.category === 'object' && job.category !== null && 'name' in job.category 
                ? (job.category as { name: string }).name 
                : String(job.category)}
            </Badge>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-200">
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all group border-0">
              Apply Now
              <ExternalLink className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}


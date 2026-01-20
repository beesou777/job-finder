import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Calendar, ArrowRight, Briefcase } from "lucide-react";
import { slugify } from "@/lib/utils";

interface RemoteJobCardProps {
  job: {
    _id: string;
    jobTitle: string;
    companyName: string;
    companyImage?: string;
    region?: string;
    candidateLocation?: string;
    tags?: string[];
    salary?: string;
    neededExperience?: string;
    createdAt?: string;
  };
}

export function RemoteJobCard({ job }: RemoteJobCardProps) {
  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const now = new Date();
    const jobDate = new Date(dateString);
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

  const postedDate = formatRelativeTime(job.createdAt);
  const location = job.region || job.candidateLocation || "Remote";
  const slug = `${slugify(job.jobTitle)}-${job._id}`;

  return (
    <Card className="h-full flex flex-col border border-gray-300 bg-white hover:shadow-md transition-shadow group">
      <div className="flex-1 flex flex-col pt-6 pb-6 px-6">
        <div className="flex items-start justify-between gap-3 mb-3 min-h-[4.5rem]">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 leading-snug text-gray-900 group-hover:text-[#0A66C2] transition-colors">
              {job.jobTitle}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {job.companyImage ? (
                <img
                  src={job.companyImage}
                  alt={job.companyName}
                  className="w-6 h-6 rounded object-contain"
                />
              ) : (
                <Building2 className="w-5 h-5 flex-shrink-0 text-gray-400" />
              )}
              <span className="truncate text-sm font-medium text-gray-700">{job.companyName}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal rounded-md flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
            <span className="truncate">{location}</span>
          </Badge>
          
          {job.salary && job.salary !== "N/A" && (
            <Badge className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 font-normal rounded-md flex items-center gap-1.5">
              <span>{job.salary}</span>
            </Badge>
          )}

          {job.neededExperience && job.neededExperience !== "N/A" && (
            <Badge className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 font-normal rounded-md flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{job.neededExperience}</span>
            </Badge>
          )}

          <Badge className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-100 font-normal rounded-md flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <span>{postedDate}</span>
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[11px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-200">
              {tag}
            </span>
          ))}
          {job.tags && job.tags.length > 3 && (
            <span className="text-[11px] px-2 py-0.5 text-gray-400">
              +{job.tags.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link
            href={`/remote-jobs/${slug}`}
            className="flex items-center justify-between text-[#0A66C2] hover:text-[#004182] font-semibold text-sm transition-colors"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

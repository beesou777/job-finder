"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Globe, 
  ExternalLink,
  ShieldCheck,
  Building
} from "lucide-react";
import { addUtmParams } from "@/lib/utils";

interface RemoteJobDetailProps {
  job: {
    _id: string;
    jobTitle: string;
    jobType?: string;
    applyNowLink: string;
    companyImage?: string;
    companyName: string;
    region?: string;
    candidateLocation?: string;
    isRegionLocked?: boolean;
    tags?: string[];
    salary?: string;
    neededExperience?: string;
    description?: string;
    createdAt?: string;
    companyId?: {
      name: string;
      description?: string;
      logo?: string;
      website?: string;
      industries?: string[];
    };
  };
}

export function RemoteJobDetail({ job }: RemoteJobDetailProps) {
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-sm overflow-hidden bg-white border-2 border-primary/10">
        <div className="bg-primary/5 px-6 py-8 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shadow-sm shrink-0">
                {job.companyImage ? (
                  <img
                    src={job.companyImage}
                    alt={job.companyName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                  {job.jobTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                  <div className="flex items-center text-gray-700 font-medium">
                    <Building2 className="w-4 h-4 mr-1.5 text-primary" />
                    <span>{job.companyName}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                    <span>{location}</span>
                  </div>
                  {job.jobType && (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-4 h-4 mr-1.5 text-primary" />
                      <span>{job.jobType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button size="lg" className="bg-[#0A66C2] hover:bg-[#004182] font-semibold h-12 px-8" asChild>
                <a href={addUtmParams(job.applyNowLink, "remote", job._id)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  Apply Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <div className="text-xs text-center text-gray-500 font-medium">
                 {postedDate}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {job.salary && job.salary !== "N/A" && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 px-4 py-1.5 text-sm font-medium">
                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                {job.salary}
              </Badge>
            )}
            {job.neededExperience && job.neededExperience !== "N/A" && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 px-4 py-1.5 text-sm font-medium">
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                {job.neededExperience}
              </Badge>
            )}
            {job.isRegionLocked && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-100 px-4 py-1.5 text-sm font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Region Locked
              </Badge>
            )}
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 px-4 py-1.5 text-sm font-medium">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Remote
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                Job Description
              </h2>
              <div 
                className="prose prose-blue max-w-none text-gray-700 leading-relaxed
                  prose-h3:text-lg prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:mb-4
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                  prose-li:mb-2"
                dangerouslySetInnerHTML={{ __html: job.description || "" }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
               <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                  Skills & Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* About Company */}
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                About {job.companyName}
              </h2>
              
              <div className="space-y-6">
                 {job.companyId?.description ? (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-6">
                    {job.companyId.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No company description available.</p>
                )}

                {job.companyId?.industries && job.companyId.industries.length > 0 && (
                   <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Industry</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.companyId.industries.map((ind, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  {job.companyId?.website && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={job.companyId.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full">
                        <span>Visit Website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Summary */}
          <Card className="border-0 bg-primary/5 shadow-sm border border-primary/10">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-600 mb-4 font-medium">Ready to take the next step in your career?</p>
              <Button className="w-full bg-[#0A66C2] hover:bg-[#004182]" asChild>
                <a href={addUtmParams(job.applyNowLink, "remote", job._id)} target="_blank" rel="noopener noreferrer">
                  Apply for this position
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

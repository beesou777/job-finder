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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeCommonEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

function formatJobDescription(description?: string) {
  const source = (description || "").trim();

  if (!source) {
    return "<p>No job description available. Open the original source to confirm the latest role details.</p>";
  }

  const decoded = decodeCommonEntities(decodeCommonEntities(source));
  const hasHtml = /<\/?(p|br|ul|ol|li|div|section|article|h[1-6]|strong|b|em|span|a)\b/i.test(decoded);

  if (hasHtml) {
    return decoded;
  }

  const lines = decoded
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return `<p>${escapeHtml(decoded)}</p>`;
  }

  const headingPattern = /^(about us|about the role|what is this role|responsibilities|requirements|qualifications|skills|experience|benefits|who you are|what you will do|nice to have|sales and cx enablement|ownership|summary)$/i;
  const html: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul>${listItems.join("")}</ul>`);
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    const isKnownHeading = headingPattern.test(line.replace(/[.:]$/, ""));
    const isShortHeading =
      index > 1 &&
      line.length <= 72 &&
      !/[.!?]$/.test(line) &&
      /^[A-Z0-9][A-Za-z0-9\s/&()+,-]+$/.test(line);

    if (bulletMatch) {
      listItems.push(`<li>${escapeHtml(bulletMatch[1])}</li>`);
      return;
    }

    flushList();

    if (isKnownHeading || isShortHeading) {
      html.push(`<h3>${escapeHtml(line)}</h3>`);
      return;
    }

    html.push(`<p>${escapeHtml(line)}</p>`);
  });

  flushList();

  return html.join("");
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
  const descriptionHtml = formatJobDescription(job.description);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/25">
        <div className="bg-[radial-gradient(circle_at_0%_0%,rgba(166,255,70,0.12),transparent_34%)] px-6 py-8 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl border border-white/10 flex items-center justify-center p-2 shadow-sm shrink-0">
                {job.companyImage ? (
                  <img
                    src={job.companyImage}
                    alt={job.companyName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-zinc-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-zinc-50 leading-tight mb-2">
                  {job.jobTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                  <div className="flex items-center text-zinc-300 font-medium">
                    <Building2 className="w-4 h-4 mr-1.5 text-primary" />
                    <span>{job.companyName}</span>
                  </div>
                  <div className="flex items-center text-zinc-400">
                    <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                    <span>{location}</span>
                  </div>
                  {job.jobType && (
                    <div className="flex items-center text-zinc-400">
                      <Briefcase className="w-4 h-4 mr-1.5 text-primary" />
                      <span>{job.jobType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button size="lg" className="h-12 rounded-full bg-primary px-8 font-black text-zinc-950 hover:bg-white" asChild>
                <a href={addUtmParams(job.applyNowLink, "remote", job._id)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  Apply Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              <div className="text-xs text-center text-zinc-500 font-medium">
                 {postedDate}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {job.salary && job.salary !== "N/A" && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium rounded-full">
                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                {job.salary}
              </Badge>
            )}
            {job.neededExperience && job.neededExperience !== "N/A" && (
              <Badge variant="outline" className="bg-white/5 text-zinc-300 border-white/10 px-4 py-1.5 text-sm font-medium rounded-full">
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                {job.neededExperience}
              </Badge>
            )}
            {job.isRegionLocked && (
              <Badge variant="outline" className="bg-white/5 text-zinc-300 border-white/10 px-4 py-1.5 text-sm font-medium rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Region Locked
              </Badge>
            )}
            <Badge variant="outline" className="bg-white/5 text-zinc-300 border-white/10 px-4 py-1.5 text-sm font-medium rounded-full">
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Remote
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/20">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-black text-zinc-50 mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                Job Description
              </h2>
              <div 
                className="prose prose-invert max-w-none text-zinc-300 leading-relaxed
                  prose-headings:font-black prose-headings:text-zinc-50
                  prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl
                  prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-lg
                  prose-p:mb-4 prose-p:text-zinc-300
                  prose-strong:text-zinc-50
                  prose-a:text-primary
                  prose-ul:mb-5 prose-ul:ml-5 prose-ul:list-disc
                  prose-ol:mb-5 prose-ol:ml-5
                  prose-li:mb-2 prose-li:marker:text-primary
                  [&_*]:max-w-full"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <Card className="border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/20 overflow-hidden">
               <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-black text-zinc-50 mb-6 flex items-center">
                  <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                  Skills & Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300 hover:bg-white/10">
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
          <Card className="border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/20 overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-lg font-black text-zinc-50 mb-6 flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                About {job.companyName}
              </h2>
              
              <div className="space-y-6">
                 {job.companyId?.description ? (
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-6">
                    {job.companyId.description}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No company description available.</p>
                )}

                {job.companyId?.industries && job.companyId.industries.length > 0 && (
                   <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Industry</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.companyId.industries.map((ind, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-white/5 text-zinc-300 rounded-full border border-white/10">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  {job.companyId?.website && (
                    <Button variant="outline" size="sm" className="w-full rounded-full border-white/10 bg-transparent text-zinc-200 hover:bg-white/10 hover:text-white" asChild>
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
          <Card className="border border-primary/20 bg-primary/10 shadow-2xl shadow-black/20">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-zinc-300 mb-4 font-medium">Ready to take the next step in your career?</p>
              <Button className="w-full rounded-full bg-primary text-zinc-950 hover:bg-white font-black" asChild>
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

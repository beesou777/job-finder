"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Globe,
  ExternalLink,
  ShieldCheck,
  Building,
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
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function formatJobDescription(description?: string) {
  const source = (description || "").trim();

  if (!source) {
    return "<p>No job description available. Open the original source to confirm the latest role details.</p>";
  }

  const plainText = decodeCommonEntities(decodeCommonEntities(source))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (!plainText) {
    return "<p>No job description available. Open the original source to confirm the latest role details.</p>";
  }

  const preview =
    plainText.length > 1400
      ? `${plainText.slice(0, 1400).trimEnd()}...`
      : plainText;

  return preview
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
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
      <Card className="overflow-hidden border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/25">
        <div className="bg-[radial-gradient(circle_at_0%_0%,rgba(184,244,96,0.12),transparent_34%)] px-6 py-8 md:px-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black p-2 shadow-sm md:h-20 md:w-20">
                {job.companyImage ? (
                  <img
                    src={job.companyImage}
                    alt={job.companyName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-zinc-600" />
                )}
              </div>
              <div>
                <h1 className="mb-2 text-2xl font-black leading-tight text-zinc-50 md:text-3xl">
                  {job.jobTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center font-medium text-zinc-300">
                    <Building2 className="mr-1.5 h-4 w-4 text-primary" />
                    <span>{job.companyName}</span>
                  </div>
                  <div className="flex items-center text-zinc-400">
                    <MapPin className="mr-1.5 h-4 w-4 text-primary" />
                    <span>{location}</span>
                  </div>
                  {job.jobType && (
                    <div className="flex items-center text-zinc-400">
                      <Briefcase className="mr-1.5 h-4 w-4 text-primary" />
                      <span>{job.jobType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="h-12 rounded-full bg-primary px-8 font-black text-zinc-950 hover:bg-white"
                asChild
              >
                <a
                  href={addUtmParams(job.applyNowLink, "remote", job._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Apply Now
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <div className="text-center text-xs font-medium text-zinc-500">
                {postedDate}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {job.salary && job.salary !== "N/A" && (
              <Badge
                variant="outline"
                className="rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
              >
                <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                {job.salary}
              </Badge>
            )}
            {job.neededExperience && job.neededExperience !== "N/A" && (
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300"
              >
                <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                {job.neededExperience}
              </Badge>
            )}
            {job.isRegionLocked && (
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Region Locked
              </Badge>
            )}
            <Badge
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300"
            >
              <Globe className="mr-1.5 h-3.5 w-3.5" />
              Remote
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card className="border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/20">
            <CardContent className="p-6 md:p-8">
              <h2 className="mb-6 flex items-center text-xl font-black text-zinc-50">
                <span className="mr-3 h-6 w-1.5 rounded-full bg-primary"></span>
                Description Preview
              </h2>
              <div
                className="prose prose-invert max-w-none leading-relaxed text-zinc-300
                  prose-headings:text-zinc-50 prose-headings:font-black
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
              <p className="mt-4 text-sm text-zinc-500">
                This preview is shortened. Open the original source for the full
                description and the latest application instructions.
              </p>
            </CardContent>
          </Card>

          {job.tags && job.tags.length > 0 && (
            <Card className="overflow-hidden border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/20">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-6 flex items-center text-xl font-black text-zinc-50">
                  <span className="mr-3 h-6 w-1.5 rounded-full bg-primary"></span>
                  Skills & Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300 hover:bg-white/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border border-white/10 bg-[#1b1b1d] shadow-2xl shadow-black/20">
            <CardContent className="p-6">
              <h2 className="mb-6 flex items-center text-lg font-black text-zinc-50">
                <Building className="mr-2 h-5 w-5 text-primary" />
                About {job.companyName}
              </h2>

              <div className="space-y-6">
                {job.companyId?.description ? (
                  <p className="line-clamp-6 text-sm leading-relaxed text-zinc-400">
                    {job.companyId.description}
                  </p>
                ) : (
                  <p className="text-sm italic text-zinc-500">
                    No company description available.
                  </p>
                )}

                {job.companyId?.industries && job.companyId.industries.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Industry
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.companyId.industries.map((ind, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-300"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  {job.companyId?.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-white/10 bg-transparent text-zinc-200 hover:bg-white/10 hover:text-white"
                      asChild
                    >
                      <a
                        href={job.companyId.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-between"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary/20 bg-primary/10 shadow-2xl shadow-black/20">
            <CardContent className="p-6 text-center">
              <p className="mb-4 text-sm font-medium text-zinc-300">
                Ready to take the next step in your career?
              </p>
              <Button
                className="w-full rounded-full bg-primary font-black text-zinc-950 hover:bg-white"
                asChild
              >
                <a
                  href={addUtmParams(job.applyNowLink, "remote", job._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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

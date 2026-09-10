"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { addUtmParams } from "@/lib/utils";

interface LinkedInJobDetailProps {
  jobId?: number;
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

function buildDescriptionPreview(description?: string) {
  const source = (description || "").trim();

  if (!source) {
    return [];
  }

  const plainText = decodeCommonEntities(source)
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
    return [];
  }

  const preview = plainText.length > 1400 ? `${plainText.slice(0, 1400).trimEnd()}...` : plainText;

  return preview
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function LinkedInJobDetail({ jobId }: LinkedInJobDetailProps) {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(jobId));

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    setLoading(true);
    fetch(`/api/linkedin-jobs/${jobId}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => active && setJob(payload?.data || null))
      .catch(() => active && setJob(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [jobId]);

  if (!jobId) {
    return (
      <Card className="border border-[#dce8f7] bg-white">
        <CardContent className="py-12 pt-6 text-center">
          <p className="text-[#617493]">Select a job to view details</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border border-[#dce8f7] bg-white">
        <CardContent className="py-12 pt-6 text-center text-[#617493]">
          Loading job details...
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="border border-[#dce8f7] bg-white">
        <CardContent className="py-12 pt-6 text-center text-red-600">Job not found.</CardContent>
      </Card>
    );
  }

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "N/A";
    const now = new Date();
    const jobDate = new Date(date);
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

  const descriptionPreview = buildDescriptionPreview(job.description);

  const facts = [
    job.place && { label: "Location", value: job.place, icon: MapPin },
    {
      label: "Work type",
      value: job.job_type || job.jobType || job.type || "Not specified",
      icon: Briefcase,
    },
    { label: "Source", value: "LinkedIn", icon: Tags },
    job.job_date && { label: "Listed", value: formatRelativeTime(job.job_date), icon: Calendar },
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof MapPin }>;

  return (
    <div className="space-y-6 text-[#102e67]">
      <header className="grid gap-6 border-b border-[#dce8f7] pb-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-primary">
              LinkedIn sourced
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Public lead
            </span>
          </div>
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-[#102e67] md:text-5xl">
            {job.title}
          </h1>
          {job.company && (
            <div className="mt-4 flex items-center gap-2 text-lg font-bold text-[#334f7d]">
              <Building2 className="h-5 w-5 text-primary" />
              {job.company_link ? (
                <a
                  href={job.company_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {job.company}
                </a>
              ) : (
                job.company
              )}
            </div>
          )}
        </div>
        <div className="border-l-2 border-primary pl-5">
          <p className="text-sm leading-6 text-[#617493]">
            Review the original LinkedIn listing before applying.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.job_link && (
              <Button
                className="rounded-full border border-primary bg-transparent font-black text-primary hover:bg-primary hover:text-white"
                size="sm"
                asChild
              >
                <a
                  href={addUtmParams(job.job_link, "linkedin", String(job.id))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View listing <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            {job.apply_link && (
              <Button
                className="rounded-full bg-primary font-black text-white hover:bg-accent"
                size="sm"
                asChild
              >
                <a
                  href={addUtmParams(job.apply_link, "linkedin", String(job.id))}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-x-5 gap-y-3 border-b border-[#dce8f7] pb-6 sm:grid-cols-4">
        {facts.map((fact) => {
          const Icon = fact.icon;
          return (
            <div
              key={fact.label}
              className="min-w-0 border-l border-[#dce8f7] pl-4 first:border-l-0 first:pl-0"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#617493]">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                {fact.label}
              </div>
              <div className="mt-2 truncate text-sm font-black text-[#102e67]" title={fact.value}>
                {fact.value}
              </div>
            </div>
          );
        })}
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-[#dce8f7] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff7ff] text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-[#102e67]">Job overview</h2>
              {descriptionPreview.length > 0 ? (
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#536b91]">
                  {descriptionPreview.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-4 italic text-[#617493]">No description available.</p>
              )}
              <p className="mt-5 rounded-xl bg-[#eff7ff] p-4 text-sm leading-6 text-[#536b91]">
                This is a preview of a public LinkedIn lead. Open the original listing for the
                complete description and latest details.
              </p>
            </div>
          </div>
        </section>
        <aside className="self-start rounded-xl border border-[#dce8f7] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#102e67]">Application verification</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-[#617493]">
            <li className="flex gap-3">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              Public LinkedIn job lead collected for discovery.
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" />
              KamKhoj does not process applications or request payment.
            </li>
          </ul>
          {job.insights && Object.keys(job.insights).length > 0 && (
            <div className="mt-6 border-t border-[#dce8f7] pt-5">
              <h3 className="font-black text-[#102e67]">Job insights</h3>
              <div className="mt-3 space-y-2 text-sm text-[#617493]">
                {Object.entries(job.insights).map(([key, value]) => (
                  <p key={key}>
                    <span className="font-bold text-[#334f7d]">{key}: </span>
                    {String(value)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

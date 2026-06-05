import { getLinkedInJobDetails } from "@/lib/data-fetching";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addUtmParams } from "@/lib/utils";

interface LinkedInJobDetailProps {
  jobId?: number;
}

export async function LinkedInJobDetail({ jobId }: LinkedInJobDetailProps) {
  if (!jobId) {
    return (
      <Card className="border border-white/10 bg-[#1b1b1d]">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-zinc-400">Select a job to view details</p>
        </CardContent>
      </Card>
    );
  }

  const job = await getLinkedInJobDetails(jobId);

  if (!job) {
    return (
      <Card className="border border-white/10 bg-[#1b1b1d]">
        <CardContent className="pt-6 text-center py-12 text-red-500">
          Job not found.
        </CardContent>
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

  return (
    <Card className="border border-white/10 bg-[#1b1b1d] text-zinc-100 shadow-2xl shadow-black/25">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-zinc-50 mb-2">{job.title}</h2>
            {job.company && (
              <div className="flex items-center text-lg text-zinc-400 mb-2">
                <Building2 className="h-5 w-5 mr-2" />
                {job.company_link ? (
                  <a
                    href={job.company_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {job.company}
                  </a>
                ) : (
                  <span>{job.company}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3 ml-4 flex-shrink-0">
            {job.job_link && (
              <Button
                className="rounded-full border border-primary bg-transparent text-primary hover:bg-primary hover:text-zinc-950 font-black transition-colors"
                size="sm"
                asChild
              >
                <a
                  href={addUtmParams(job.job_link, "linkedin", String(job.id))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  View on LinkedIn
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}
            {job.apply_link && (
              <Button
                className="rounded-full bg-primary hover:bg-white text-zinc-950 font-black shadow-sm"
                size="sm"
                asChild
              >
                <a
                  href={addUtmParams(job.apply_link, "linkedin", String(job.id))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  Apply
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-sm text-zinc-400">
          {job.place && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{job.place}</span>
            </div>
          )}
          {job.job_date && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatRelativeTime(job.job_date)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-black text-zinc-50 mb-3">Job Description</h3>
            {job.description ? (
              <div
                className="text-zinc-300 leading-relaxed space-y-2"
                style={{ lineHeight: '1.7' }}
                dangerouslySetInnerHTML={{
                  __html: job.description
                    .split(/\n{2,}/) // Split on 2+ newlines
                    .map(para => para.trim().replace(/\n/g, '<br />'))
                    .filter(para => para.length > 0)
                    .map(para => `<p style="margin-bottom: 0.5rem;">${para}</p>`)
                    .join(''),
                }}
              />
            ) : (
              <p className="text-zinc-500 italic">No description available.</p>
            )}
          </div>

          {job.insights && Object.keys(job.insights).length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="text-lg font-black text-zinc-50 mb-3">Job Insights</h3>
              <div className="space-y-2">
                {Object.entries(job.insights).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-zinc-300 w-32">{key}:</span>
                    <span className="text-zinc-500">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

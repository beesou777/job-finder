import { getLinkedInJobDetails } from "@/server/services/data-fetching";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar, ExternalLink } from "lucide-react";
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

  const preview =
    plainText.length > 1400
      ? `${plainText.slice(0, 1400).trimEnd()}...`
      : plainText;

  return preview
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function LinkedInJobDetail({ jobId }: LinkedInJobDetailProps) {
  if (!jobId) {
    return (
      <Card className="border border-white/10 bg-[#1b1b1d]">
        <CardContent className="py-12 pt-6 text-center">
          <p className="text-zinc-400">Select a job to view details</p>
        </CardContent>
      </Card>
    );
  }

  const job = await getLinkedInJobDetails(jobId);

  if (!job) {
    return (
      <Card className="border border-white/10 bg-[#1b1b1d]">
        <CardContent className="py-12 pt-6 text-center text-red-500">
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

  const descriptionPreview = buildDescriptionPreview(job.description);

  return (
    <Card className="border border-white/10 bg-[#1b1b1d] text-zinc-100 shadow-2xl shadow-black/25">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="mb-2 text-2xl font-black text-zinc-50">
              {job.title}
            </h2>
            {job.company && (
              <div className="mb-2 flex items-center text-lg text-zinc-400">
                <Building2 className="mr-2 h-5 w-5" />
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
          <div className="ml-4 flex flex-shrink-0 gap-3">
            {job.job_link && (
              <Button
                className="rounded-full border border-primary bg-transparent font-black text-primary transition-colors hover:bg-primary hover:text-zinc-950"
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
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
            {job.apply_link && (
              <Button
                className="rounded-full bg-primary font-black text-zinc-950 shadow-sm hover:bg-white"
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
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-400">
          {job.place && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{job.place}</span>
            </div>
          )}
          {job.job_date && (
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{formatRelativeTime(job.job_date)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="mb-4">
            <h3 className="mb-3 text-lg font-black text-zinc-50">
              Description Preview
            </h3>
            {descriptionPreview.length > 0 ? (
              <div
                className="space-y-3 text-zinc-300"
                style={{ lineHeight: "1.7" }}
              >
                {descriptionPreview.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="italic text-zinc-500">No description available.</p>
            )}
            <p className="mt-4 text-sm text-zinc-500">
              This preview is shortened. Open LinkedIn or the apply link for the
              full description and latest job details.
            </p>
          </div>

          {job.insights && Object.keys(job.insights).length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="mb-3 text-lg font-black text-zinc-50">
                Job Insights
              </h3>
              <div className="space-y-2">
                {Object.entries(job.insights).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="w-32 font-medium text-zinc-300">
                      {key}:
                    </span>
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
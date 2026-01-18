import { getLinkedInJobDetails } from "@/lib/data-fetching";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkedInJobDetailProps {
  jobId?: number;
}

export async function LinkedInJobDetail({ jobId }: LinkedInJobDetailProps) {
  if (!jobId) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6 text-center py-12">
          <p className="text-gray-600">Select a job to view details</p>
        </CardContent>
      </Card>
    );
  }

  const job = await getLinkedInJobDetails(jobId);

  if (!job) {
    return (
      <Card className="border-2 border-gray-200">
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
    <Card className="border-2 border-gray-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
            {job.company && (
              <div className="flex items-center text-lg text-gray-700 mb-2">
                <Building2 className="h-5 w-5 mr-2" />
                {job.company_link ? (
                  <a
                    href={job.company_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A66C2] hover:underline"
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
                className="border-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white bg-white font-semibold transition-colors"
                size="sm"
                asChild
              >
                <a
                  href={job.job_link}
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
                className="bg-[#004182] hover:bg-[#003366] text-white font-semibold shadow-sm"
                size="sm"
                asChild
              >
                <a
                  href={job.apply_link}
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

        <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
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

        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            {job.description ? (
              <div
                className="text-gray-700 leading-relaxed space-y-2"
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
              <p className="text-gray-500 italic">No description available.</p>
            )}
          </div>

          {job.insights && Object.keys(job.insights).length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Insights</h3>
              <div className="space-y-2">
                {Object.entries(job.insights).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-gray-700 w-32">{key}:</span>
                    <span className="text-gray-600">{String(value)}</span>
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

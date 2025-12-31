import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { generateJobMetadata, generateJobPostingSchema, generateBreadcrumbSchema } from "@/lib/seo";
import Script from "next/script";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2, Calendar, DollarSign, ExternalLink, ArrowLeft } from "lucide-react";
import { addUtmParams } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const job = await jobRepository.findOne({ where: { id: params.id } });

    if (!job) {
      return {
        title: "Job Not Found | JobKhoj",
      };
    }

    return generateJobMetadata({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      deadline: job.deadline,
      id: job.id,
    });
  } catch (error) {
    return {
      title: "Job Details | JobKhoj",
    };
  }
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  let job: Job | null = null;

  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    job = await jobRepository.findOne({ 
      where: { id: params.id },
      relations: ['category'],
    });
  } catch (error) {
    console.error("Error fetching job:", error);
  }

  if (!job) {
    notFound();
  }

  // Check if job is expired
  const now = new Date();
  const isExpired = job.expiresAt && new Date(job.expiresAt) < now;

  // Generate structured data
  const jobPostingSchema = generateJobPostingSchema({
    title: job.title,
    description: job.description,
    company: job.company,
    location: job.location,
    salaryText: job.salaryText,
    deadline: job.deadline,
    createdAt: job.createdAt,
    expiresAt: job.expiresAt,
    applyUrl: job.applyUrl,
    type: job.type,
    id: job.id,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://kamkhoj.eventeir.ai" },
    { name: "Jobs", url: "https://kamkhoj.eventeir.ai/jobs" },
    { name: job.title, url: `https://kamkhoj.eventeir.ai/jobs/${job.id}` },
  ]);

  // Add UTM parameters to apply URL
  const applyUrlWithUtm = addUtmParams(job.applyUrl, job.source, job.id);

  return (
    <>
      <Script
        id="job-posting-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/jobs" className="hover:text-blue-600 transition-colors">
                  Jobs
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 truncate max-w-xs">{job.title}</li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="mb-6">
                  {isExpired && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ This job posting may have expired. Please verify the deadline before applying.
                      </p>
                    </div>
                  )}

                  <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
                    {job.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span>Deadline: {job.deadline}</span>
                      </div>
                    )}
                    {job.salaryText && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <span>{job.salaryText}</span>
                      </div>
                    )}
                  </div>

                  {job.category && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {job.category.name}
                      </span>
                    </div>
                  )}

                  <a
                    href={applyUrlWithUtm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {job.description && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description</h2>
                  <div
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Link href="/jobs">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


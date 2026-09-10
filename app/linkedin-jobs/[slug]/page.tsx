import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLinkedInJobDetails } from "@/server/services/data-fetching";
import { LinkedInJobDetail } from "@/components/linkedin/LinkedInJobDetail";
import {
  generateLinkedInJobMetadata,
  generateBreadcrumbSchema,
  generateLinkedInJobPostingSchema,
} from "@/lib/seo";
import Script from "next/script";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slugParts = params.slug.split("-");
  const id = parseInt(slugParts[slugParts.length - 1]);
  if (isNaN(id)) {
    return { title: "Job Not Found | kamkhoj" };
  }

  const job = await getLinkedInJobDetails(id);
  if (!job) {
    return { title: "Job Not Found | kamkhoj" };
  }

  return {
    ...generateLinkedInJobMetadata({
      title: job.title,
      company: job.company,
      place: job.place,
      description: job.description,
      id: job.id,
      slug: params.slug,
    }),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function LinkedInJobPage({ params }: { params: { slug: string } }) {
  const slugParts = params.slug.split("-");
  const id = parseInt(slugParts[slugParts.length - 1]);
  if (isNaN(id)) {
    notFound();
  }

  const job = await getLinkedInJobDetails(id);
  if (!job) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.kamkhoj.com/" },
    { name: "LinkedIn Jobs", url: "https://www.kamkhoj.com/linkedin-jobs" },
    {
      name: job.title,
      url: `https://www.kamkhoj.com/linkedin-jobs/${params.slug}`,
    },
  ]);

  const jobPostingSchema = generateLinkedInJobPostingSchema({
    title: job.title,
    description: job.description,
    company: job.company,
    place: job.place,
    job_date: job.job_date,
    apply_link: job.apply_link || job.job_link || "",
    id: job.id,
  });

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="job-posting-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      <div className="public-detail-surface min-h-screen bg-[#f9fafb] pb-12 text-[#102e67]">
        {/* Navigation / Breadcrumbs */}
        <div className="mb-6 border-b border-[#dce8f7] bg-white/90 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <nav className="mb-2 flex items-center space-x-2 text-sm font-bold text-[#617493]">
              <Link href="/" className="hover:text-primary flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <span>/</span>
              <Link href="/linkedin-jobs" className="hover:text-primary">
                LinkedIn Jobs
              </Link>
              <span>/</span>
              <span className="max-w-[200px] truncate font-medium text-[#102e67] md:max-w-md">
                {job.title}
              </span>
            </nav>

            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-full border border-primary bg-transparent font-black text-primary transition-colors hover:bg-primary hover:text-white"
              >
                <Link href="/linkedin-jobs" className="flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to LinkedIn Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div>
            <LinkedInJobDetail jobId={id} />
          </div>
        </div>
      </div>
    </>
  );
}

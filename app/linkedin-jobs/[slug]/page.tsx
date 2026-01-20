import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLinkedInJobDetails } from "@/lib/data-fetching";
import { LinkedInJobDetail } from "@/components/linkedin/LinkedInJobDetail";
import { generateLinkedInJobMetadata, generateBreadcrumbSchema, generateLinkedInJobPostingSchema } from "@/lib/seo";
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

  return generateLinkedInJobMetadata({
    title: job.title,
    company: job.company,
    place: job.place,
    description: job.description,
    id: job.id,
    slug: params.slug,
  });
}

export default async function LinkedInJobPage({
  params,
}: {
  params: { slug: string };
}) {
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
      
      <div className="min-h-screen bg-gray-50 pb-12">
        {/* Navigation / Breadcrumbs */}
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link href="/" className="hover:text-[#0A66C2] flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <span>/</span>
              <Link href="/linkedin-jobs" className="hover:text-[#0A66C2]">
                LinkedIn Jobs
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-md">
                {job.title}
              </span>
            </nav>
            
            <div className="mt-4">
              <Button variant="ghost" size="sm" asChild className="text-[#0A66C2] hover:text-[#004182] hover:bg-transparent hover:underline p-0 -ml-2">
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

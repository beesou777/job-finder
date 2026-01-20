import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getRemoteJobDetails } from "@/lib/data-fetching";
import { RemoteJobDetail } from "@/components/remote/RemoteJobDetail";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { generateLinkedInJobMetadata, generateLinkedInJobPostingSchema } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slugParts = params.slug.split("-");
  const id = slugParts[slugParts.length - 1];
  
  if (!id) {
    return { title: "Job Not Found | kamkhoj" };
  }

  const job = await getRemoteJobDetails(id);

  if (!job) {
    return { title: "Job Not Found | kamkhoj" };
  }

  // Reuse LinkedIn SEO helpers as they are generic enough or adaptable
  // For now, I'll pass relevant data to it
  return generateLinkedInJobMetadata({
    title: job.jobTitle,
    company: job.companyName,
    place: job.region || job.candidateLocation,
    description: job.description,
    id: 0, // Not used when slug is provided
    slug: params.slug,
  });
}

export default async function RemoteJobPage({
  params,
}: {
  params: { slug: string };
}) {
  const slugParts = params.slug.split("-");
  const id = slugParts[slugParts.length - 1];
  
  if (!id) {
    notFound();
  }

  const job = await getRemoteJobDetails(id);

  if (!job) {
    notFound();
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.kamkhoj.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Remote Jobs",
        "item": "https://www.kamkhoj.com/remote-jobs"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": job.jobTitle,
        "item": `https://www.kamkhoj.com/remote-jobs/${params.slug}`
      }
    ]
  };

  // Job Posting Schema
  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.jobTitle,
    "description": job.description || job.jobTitle,
    "datePosted": job.createdAt,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companyName,
      "logo": job.companyImage
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.region || job.candidateLocation || "Remote",
        "addressCountry": "Global"
      }
    },
    "url": job.applyNowLink
  };

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
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center text-sm text-gray-400 mb-2">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/remote-jobs" className="hover:text-primary transition-colors">Remote Jobs</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 truncate max-w-[200px]">{job.jobTitle}</span>
            </nav>
            
            <div className="mt-4">
              <Button variant="ghost" size="sm" asChild className="text-[#0A66C2] hover:text-[#004182] hover:bg-transparent hover:underline p-0 -ml-2">
                <Link href="/remote-jobs" className="flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Remote Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
             <RemoteJobDetail job={job} />
        </div>
      </div>
    </>
  );
}

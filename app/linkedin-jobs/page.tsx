import { Suspense } from "react";
import { Metadata } from "next";
import { LinkedInJobsClient } from "@/components/linkedin/LinkedInJobsClient";
import { LinkedInJobsSkeleton } from "@/components/linkedin/LinkedInJobsList";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LinkedIn Jobs | External Job Discovery",
  description:
    "Search LinkedIn-sourced opportunities by company, location, and posting date, then verify the latest details on the original source before applying.",
  alternates: { canonical: absoluteUrl("/linkedin-jobs") },
  robots: { index: false, follow: true },
};

export default function LinkedInJobsPage() {
  return (
    <Suspense fallback={<LinkedInJobsSkeleton />}>
      <LinkedInJobsClient />
    </Suspense>
  );
}

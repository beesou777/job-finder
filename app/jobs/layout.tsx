import { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Jobs in Nepal | Browse Latest Job Openings",
  description:
    "Browse thousands of jobs in Nepal. Filter by category, location, job type. Find your next opportunity in Kathmandu, Pokhara, and cities across Nepal.",
  openGraph: {
    title: "Jobs in Nepal | KamKhoj",
    siteName: SITE_NAME,
    description: "Browse thousands of job opportunities in Nepal",
    url: absoluteUrl("/jobs"),
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  alternates: {
    canonical: absoluteUrl("/jobs"),
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

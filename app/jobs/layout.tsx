import { Metadata } from "next";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Jobs in Nepal | Browse Latest Job Openings | kamkhoj",
  description:
    "Browse thousands of jobs in Nepal. Filter by category, location, job type. Find your next opportunity in Kathmandu, Pokhara, and cities across Nepal.",
  keywords: [
    "jobs in nepal",
    "nepal jobs",
    "jobs kathmandu",
    "job portal nepal",
    "nepal job search",
    "jobs pokhara",
    "nepal employment",
  ],
  openGraph: {
    title: "Jobs in Nepal | kamkhoj",
    description: "Browse thousands of job opportunities in Nepal",
    url: absoluteUrl("/jobs"),
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  alternates: {
    canonical: absoluteUrl("/jobs"),
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

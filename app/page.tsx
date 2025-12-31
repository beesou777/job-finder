import { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Jobs in Nepal | Find Latest Job Opportunities & Internships",
  description: "Search 10,000+ jobs in Nepal from top portals - MeroJob, JobsNepal, KumariJob. Find jobs in Kathmandu, Pokhara, Butwal. Free job search. Updated daily.",
  keywords: [
    "jobs in nepal",
    "nepal jobs",
    "jobs kathmandu",
    "job portal nepal",
    "nepal job search",
    "internships nepal",
    "jobs pokhara",
    "nepal employment",
    "job opportunities nepal",
    "remote jobs nepal",
    "part time jobs nepal",
    "merocareer",
    "jobsnepal",
    "kumarijob",
    "internsathi",
    "jobaxle",
    "nepal job aggregator"
  ],
  openGraph: {
    title: "Jobs in Nepal | Latest Job Opportunities & Internships",
    description: "Search thousands of jobs from top Nepali job portals. Find jobs in Kathmandu, Pokhara, and cities across Nepal. Free job search.",
    url: "https://kamkhoj.eventeir.ai",
    siteName: "JobKhoj",
    images: [
      {
        url: "https://kamkhoj.eventeir.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobKhoj - Nepal's Job Finder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobs in Nepal | Latest Job Opportunities",
    description: "Search thousands of jobs from top Nepali job portals",
    images: ["https://kamkhoj.eventeir.ai/og-image.png"],
  },
  alternates: {
    canonical: "https://kamkhoj.eventeir.ai",
  },
};

export default function Home() {
  return <HomeContent />;
}

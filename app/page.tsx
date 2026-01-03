import { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Best Job Aggregator Sites in Nepal | Job Aggregator Sites in Nepal | JobKhoj",
  description: "Best job aggregator sites in Nepal - Search 10,000+ jobs from MeroJob, JobsNepal, KumariJob, Kantipur Job all in one place. Top job aggregator sites in Nepal. Free job search. Updated daily.",
  keywords: [
    "best job aggregator sites in nepal",
    "job aggregator sites in nepal",
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
    "nepal job aggregator",
    "job aggregator nepal",
    "best job sites nepal",
    "top job aggregator nepal"
  ],
  openGraph: {
    title: "Best Job Aggregator Sites in Nepal | Job Aggregator Sites in Nepal",
    description: "Best job aggregator sites in Nepal - Search thousands of jobs from top Nepali job portals all in one place. Find jobs in Kathmandu, Pokhara, and cities across Nepal. Free job search.",
    url: "https://kamkhoj.eventeir.ai",
    siteName: "JobKhoj - Nepal's Best Job Aggregator",
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
    title: "Best Job Aggregator Sites in Nepal | JobKhoj",
    description: "Best job aggregator sites in Nepal - Search thousands of jobs from top Nepali job portals all in one place",
    images: ["https://kamkhoj.eventeir.ai/og-image.png"],
  },
  alternates: {
    canonical: "https://kamkhoj.eventeir.ai",
  },
};

export default function Home() {
  return <HomeContent />;
}

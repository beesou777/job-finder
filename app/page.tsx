import { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "JobKhoj - Find Jobs in Nepal | Latest Job Opportunities & Internships",
  description: "Nepal's #1 job aggregator. Find the latest jobs and internships in Nepal. Search across top Nepali job portals - MeroCareer, JobsNepal, KumariJob, InternSathi, JobAxle. Your career journey starts here.",
  keywords: [
    "jobs in nepal",
    "nepal jobs",
    "jobs kathmandu",
    "internships nepal",
    "job portal nepal",
    "nepal job search",
    "career nepal",
    "nepal employment",
    "job opportunities nepal",
    "merocareer",
    "jobsnepal",
    "kumarijob",
    "internsathi",
    "jobaxle",
    "nepal job aggregator"
  ],
  openGraph: {
    title: "JobKhoj - Find Jobs in Nepal | Latest Job Opportunities & Internships",
    description: "Nepal's #1 job aggregator. Find the latest jobs and internships across Nepal.",
  },
};

export default function Home() {
  return <HomeContent />;
}

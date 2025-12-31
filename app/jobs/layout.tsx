import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs in Nepal | Browse Latest Job Openings | JobKhoj",
  description: "Browse thousands of jobs in Nepal. Filter by category, location, job type. Find your next opportunity in Kathmandu, Pokhara, and cities across Nepal.",
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
    title: "Jobs in Nepal | JobKhoj",
    description: "Browse thousands of job opportunities in Nepal",
    url: "https://kamkhoj.eventeir.ai/jobs",
  },
  alternates: {
    canonical: "https://kamkhoj.eventeir.ai/jobs",
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


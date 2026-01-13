import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkedIn Jobs - Find Your Next Opportunity | kamkhoj",
  description:
    "Discover thousands of LinkedIn job opportunities from top companies in Nepal. Search and filter by company, location, and job type. Find your dream job today.",
  keywords: [
    "LinkedIn jobs Nepal",
    "job search Nepal",
    "career opportunities Nepal",
    "job listings Nepal",
    "employment Nepal",
    "hiring Nepal",
    "LinkedIn jobs",
  ],
  openGraph: {
    title: "LinkedIn Jobs - Find Your Next Opportunity | kamkhoj",
    description:
      "Discover thousands of LinkedIn job opportunities from top companies in Nepal.",
    type: "website",
  },
};

export default function LinkedInJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


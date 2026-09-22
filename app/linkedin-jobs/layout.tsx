import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkedIn Jobs - Find Your Next Opportunity",
  description:
    "Browse public LinkedIn job leads and verify the current role and application details on the original source.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "LinkedIn Jobs - Find Your Next Opportunity | KamKhoj",
    description: "Browse public LinkedIn job leads and verify details on the original source.",
    type: "website",
  },
};

export default function LinkedInJobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

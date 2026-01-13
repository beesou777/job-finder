import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internships in Nepal | Latest Internship Opportunities",
  description:
    "Find internships in Nepal. Browse internship opportunities in Kathmandu, Pokhara, and across Nepal. IT internships, marketing internships, and more.",
  keywords: [
    "internships nepal",
    "nepal internships",
    "internships kathmandu",
    "internship opportunities nepal",
    "it internships nepal",
    "marketing internships nepal",
  ],
  openGraph: {
    title: "Internships in Nepal | kamkhoj",
    description: "Find internship opportunities in Nepal",
    url: "https://www.kamkhoj.com//internships",
  },
  alternates: {
    canonical: "https://www.kamkhoj.com//internships",
  },
};

export default function InternshipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

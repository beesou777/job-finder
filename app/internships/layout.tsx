import { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Internships in Nepal | Latest Internship Opportunities",
  description:
    "Find internships in Nepal. Browse internship opportunities in Kathmandu, Pokhara, and across Nepal. IT internships, marketing internships, and more.",
  openGraph: {
    title: "Internships in Nepal | KamKhoj",
    siteName: SITE_NAME,
    description: "Find internship opportunities in Nepal",
    url: absoluteUrl("/internships"),
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  alternates: {
    canonical: absoluteUrl("/internships"),
  },
};

export default function InternshipsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

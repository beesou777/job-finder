import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/admin") },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

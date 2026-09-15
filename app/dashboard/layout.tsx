import { DashboardShell } from "@/components/DashboardShell";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/dashboard") },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

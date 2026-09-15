import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/register") },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/login") },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

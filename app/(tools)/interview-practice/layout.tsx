import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI Interview Practice for Nepal Jobs",
  description: "Practice realistic interview questions and prepare for your next job in Nepal.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/interview-practice") },
};

export default function InterviewPracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}

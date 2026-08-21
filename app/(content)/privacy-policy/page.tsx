import { Metadata } from "next";
import type React from "react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | KamKhoj",
  description:
    "Read how KamKhoj handles privacy, analytics, advertising, job listing data, and user contact information.",
  alternates: { canonical: absoluteUrl("/privacy-policy") },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated="June 5, 2026">
      <p>
        KamKhoj is a job search and career resource website for Nepal. This policy explains how the
        site handles information when you browse job listings, read career resources, contact the
        maintainer, or interact with analytics and advertising services.
      </p>
      <h2>Information We Collect</h2>
      <p>
        KamKhoj may collect standard technical information such as browser type, device type, pages
        visited, referring URLs, and approximate usage data through analytics tools. If you contact
        KamKhoj, the information you provide may be used to respond to your request.
      </p>
      <h2>Job Listings</h2>
      <p>
        Job listings shown on KamKhoj may include publicly available details such as job title,
        company name, location, category, deadline, salary text, and source link. Applications are
        completed through the original source, not through KamKhoj.
      </p>
      <h2>Advertising and Analytics</h2>
      <p>
        KamKhoj may use third-party advertising and analytics services, including Google AdSense,
        Google Analytics, and Microsoft Clarity. These services may use cookies or similar
        technologies according to their own policies.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy, correction, or removal requests, use the contact details on the Contact page.
      </p>
    </PolicyPage>
  );
}

function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bg-zinc-950 text-white">
      <section className="container mx-auto max-w-4xl px-4 py-14 md:py-16">
        <div className="rounded-xl border border-white/10 bg-[#18181a] p-6 md:p-10">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Trust and transparency
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white">{title}</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">Last updated: {updated}</p>
          <div className="mt-8 max-w-none space-y-5 text-zinc-300 [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_p]:leading-7 [&_a]:text-primary">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

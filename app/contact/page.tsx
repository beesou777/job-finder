import { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact KamKhoj | Corrections, Sources and Partnerships",
  description:
    "Contact KamKhoj for job listing corrections, source attribution questions, removal requests, feedback, and partnerships.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
          Contact
        </p>
        <h1 className="text-4xl font-black text-white mb-4">Contact KamKhoj</h1>
        <p className="text-lg text-zinc-400 mb-8">
          Use this page for corrections, source questions, removal requests, employer
          feedback, and partnership inquiries.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#18181a] border border-white/10 rounded-xl p-6">
            <Mail className="w-6 h-6 text-primary mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Maintainer</h2>
            <p className="text-zinc-300 mb-4">
              Contact Bishwa Shah through LinkedIn for KamKhoj requests.
            </p>
            <a href="https://www.linkedin.com/in/beesou-shah/" className="text-primary font-semibold hover:underline">
              LinkedIn profile
            </a>
          </div>
          <div className="bg-[#18181a] border border-white/10 rounded-xl p-6">
            <ShieldCheck className="w-6 h-6 text-primary mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Listing Corrections</h2>
            <p className="text-zinc-300">
              Include the job title, company, source URL, issue, and requested change.
              KamKhoj will review source-related requests as soon as practical.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/editorial-policy" className="text-primary font-semibold hover:underline">
            Read the editorial policy
          </Link>
        </div>
      </section>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Editorial Policy | KamKhoj",
  description:
    "KamKhoj editorial policy for job listing aggregation, source attribution, corrections, and career content review.",
  alternates: { canonical: absoluteUrl("/editorial-policy") },
};

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100">
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-primary">Trust and sourcing</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-50 mb-8">Editorial Policy</h1>
        <div className="rounded-2xl border border-white/10 bg-[#1b1b1d] p-6 md:p-10 space-y-6 text-zinc-300 leading-8 shadow-2xl shadow-black/25">
          <p>
            KamKhoj exists to help Nepal job seekers discover publicly available
            vacancies and internships faster. Job listings are aggregated for discovery
            and link to original sources for application, verification, and final terms.
          </p>
          <h2 className="text-2xl font-black text-zinc-50">Source Attribution</h2>
          <p>
            Job cards show source information when available and application links route
            to the original source. Employers and portals retain ownership of their
            postings.
          </p>
          <h2 className="text-2xl font-black text-zinc-50">Corrections</h2>
          <p>
            If a listing is outdated, inaccurate, or should be removed, contact KamKhoj
            with the job title, company, source URL, and correction request.
          </p>
          <h2 className="text-2xl font-black text-zinc-50">Career Articles</h2>
          <p>
            Career guidance is written for Nepal job seekers and should be updated when
            hiring norms, market conditions, salary expectations, or application
            practices change.
          </p>
          <h2 className="text-2xl font-black text-zinc-50">User Responsibility</h2>
          <p>
            Candidates should verify salary, deadline, eligibility, required documents,
            and application process on the original job source before applying.
          </p>
          <Link href="/contact" className="text-primary font-black hover:underline">
            Contact KamKhoj
          </Link>
        </div>
      </section>
    </div>
  );
}

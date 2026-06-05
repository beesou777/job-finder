import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, ShieldCheck, Info, Search, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About KamKhoj | Nepal Job Search Engine",
  description:
    "Learn how KamKhoj aggregates publicly available Nepal job listings, credits original sources, and helps job seekers discover jobs faster.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <section className="bg-zinc-950 border-b border-white/10">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
              About KamKhoj
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              About KamKhoj
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
              KamKhoj is a Nepal job search engine that helps job seekers discover
              vacancies and internships from multiple Nepali job portals in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl space-y-10">
          <Card className="border-white/10 bg-[#18181a] text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Info className="w-6 h-6 text-primary" />
                What KamKhoj Does
              </h2>
              <div className="space-y-4 text-zinc-300 leading-relaxed">
                <p>
                  KamKhoj collects publicly available job listing information from
                  job portals and career pages, then organizes it for search by title,
                  company, category, location, job type, and skill. Each job links
                  back to the original source for application and final verification.
                </p>
                <p>
                  KamKhoj is not a recruitment agency and does not claim ownership of
                  third-party job postings. The goal is discovery: making it faster
                  for people in Nepal to find relevant opportunities without visiting
                  many portals separately.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Search, title: "Search-first", text: "Built around job discovery across portals, cities, categories, and skills." },
              { icon: ShieldCheck, title: "Source-aware", text: "Applications and final details stay with the original job source." },
              { icon: CheckCircle2, title: "Free to use", text: "Candidates can search without account requirements or paywalls." },
            ].map((item) => (
              <Card key={item.title} className="border-white/10 bg-[#18181a] text-white">
                <CardContent className="p-6">
                  <item.icon className="w-6 h-6 text-primary mb-4" />
                  <h3 className="font-black text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-white/10 bg-[#18181a] text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <UserRound className="w-6 h-6 text-primary" />
                Editorial and Data Standards
              </h2>
              <ul className="space-y-3 text-zinc-300">
                <li>Job listings are shown with original source attribution where available.</li>
                <li>KamKhoj prioritizes active listings and removes or de-emphasizes expired jobs where expiry data is available.</li>
                <li>Career articles are written for Nepal job seekers and should be reviewed when market details change.</li>
                <li>Users should verify salary, deadline, eligibility, and application instructions on the original source before applying.</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/editorial-policy" className="text-primary font-semibold hover:underline">
                  Read editorial policy
                </Link>
                <Link href="/contact" className="text-primary font-semibold hover:underline">
                  Contact KamKhoj
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#18181a] text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact
              </h2>
              <p className="text-zinc-300 leading-relaxed">
                For corrections, source-removal requests, feedback, or partnership
                questions, contact the maintainer through LinkedIn:
                {" "}
                <a href="https://www.linkedin.com/in/beesou-shah/" className="text-primary font-semibold hover:underline">
                  Bishwa Shah
                </a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

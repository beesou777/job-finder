import { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "How KamKhoj Works | Sources, Updates and Corrections",
  description:
    "Learn how KamKhoj organizes public job listings, links to original sources, handles corrections, and helps Nepal job seekers search faster.",
  alternates: { canonical: absoluteUrl("/how-kamkhoj-works") },
};

export default function HowKamKhojWorksPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="container mx-auto max-w-4xl px-4 py-14 md:py-16">
        <div className="rounded-xl border border-white/10 bg-[#18181a] p-6 md:p-10">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Trust and sourcing
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white">How KamKhoj Works</h1>
          <div className="mt-8 space-y-6 text-zinc-300 [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_p]:leading-7">
            <p>
              KamKhoj is a job discovery website for Nepal. It helps candidates search public
              vacancies from multiple sources in one place, compare options faster, and continue to
              the original source for the final application.
            </p>

            <h2>What KamKhoj Collects</h2>
            <p>
              KamKhoj organizes public listing details such as job title, company name, location,
              category, deadline, job type, and source link when those details are available on
              public pages.
            </p>

            <h2>What KamKhoj Does Not Do</h2>
            <p>
              KamKhoj is not a recruitment agency and does not replace the original employer or job
              portal. It does not complete applications for users and does not claim ownership of
              third-party job postings.
            </p>

            <h2>How Applications Work</h2>
            <p>
              Every application should be completed on the original source. Users should verify
              salary, eligibility, deadline, required documents, and instructions before applying or
              sharing personal information.
            </p>

            <h2>How Listings Are Updated</h2>
            <p>
              KamKhoj checks public sources regularly and tries to keep active listings visible
              while removing or de-emphasizing expired jobs when expiry information is available.
              Because source pages can change at any time, the original posting is always the final
              authority.
            </p>

            <h2>Who Maintains KamKhoj</h2>
            <p>
              KamKhoj is independently maintained by Bishwa Shah. The maintainer reviews the site,
              scraper output, content, and correction requests. Automated checks help identify
              deadline changes, missing data, and listings that no longer appear in a source; they
              do not replace human judgment or the original source.
            </p>

            <h2>Source Verification and Review Cadence</h2>
            <p>
              Public sources are checked during scheduled scraper runs, currently targeted at least
              twice each day when the source is reachable. Each listing shows its source and, where
              available, its last verification time. A source can change between checks, so the
              original posting is always the final authority.
            </p>

            <h2>Corrections and Removal Requests</h2>
            <p>
              If a listing is inaccurate, outdated, or should be removed, the site owner can review
              correction requests. Include the job title, company, source URL, and the requested
              change so the issue can be verified quickly.
            </p>
            <p>
              Candidates can report an expired or incorrect listing through the
              <Link href="/contact" className="text-primary hover:underline">
                {" "}
                contact page
              </Link>
              . Employers and publishers can request a correction, attribution change, or removal by
              providing the source URL and explaining the requested action. Requests are reviewed as
              soon as practical.
            </p>

            <h2>Why KamKhoj Exists</h2>
            <p>
              The goal is simple: reduce the time job seekers spend opening many portals just to
              compare public opportunities. KamKhoj focuses on faster discovery, clearer routing,
              and transparent source attribution.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-5 py-3 font-black text-zinc-950 transition-colors hover:bg-white"
            >
              Contact KamKhoj
            </Link>
            <Link
              href="/editorial-policy"
              className="rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition-colors hover:border-primary/60 hover:text-primary"
            >
              Read Editorial Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

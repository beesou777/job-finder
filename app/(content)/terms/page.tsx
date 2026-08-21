import { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use | KamKhoj",
  description: "Terms of use for KamKhoj, a Nepal job search and career resource website.",
  alternates: { canonical: absoluteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <section className="container mx-auto max-w-4xl px-4 py-14 md:py-16">
        <article className="rounded-xl border border-white/10 bg-[#18181a] p-6 md:p-10">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Site terms
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white">Terms of Use</h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">Last updated: June 5, 2026</p>
          <div className="mt-8 max-w-none space-y-5 text-zinc-300 [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_p]:leading-7 [&_a]:text-primary">
            <p>
              By using KamKhoj, you agree to use the website for lawful job search, career research,
              and hiring-resource discovery purposes.
            </p>
            <h2>Job Listing Accuracy</h2>
            <p>
              KamKhoj organizes publicly available job information for discovery. Listing details
              may change on the original source. Always verify salary, deadline, eligibility, and
              application requirements before applying.
            </p>
            <h2>Third-Party Sources</h2>
            <p>
              Job applications, employer pages, and external resources may open third-party
              websites. KamKhoj is not responsible for the content, policies, or application
              processes of those websites.
            </p>
            <h2>Acceptable Use</h2>
            <p>
              Do not misuse the site, attempt to disrupt availability, scrape in a way that harms
              service reliability, or submit false correction requests.
            </p>
            <h2>Changes</h2>
            <p>
              These terms may be updated as the website changes. Continued use of KamKhoj means you
              accept the current terms.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

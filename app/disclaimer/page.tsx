import { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer | KamKhoj",
  description:
    "Disclaimer for KamKhoj job listings, external sources, career content, and advertising.",
  alternates: { canonical: absoluteUrl("/disclaimer") },
};

export default function DisclaimerPage() {
  return (
    <main className="bg-zinc-950 text-white">
      <section className="container mx-auto max-w-4xl px-4 py-14 md:py-16">
        <article className="rounded-xl border border-white/10 bg-[#18181a] p-6 md:p-10">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Important notice
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Disclaimer
          </h1>
          <p className="mt-3 text-sm font-semibold text-zinc-500">
            Last updated: June 5, 2026
          </p>
          <div className="mt-8 max-w-none space-y-5 text-zinc-300 [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_p]:leading-7 [&_a]:text-primary">
            <p>
              KamKhoj is an independent job discovery and career resource
              website. It is not a recruitment agency and does not guarantee job
              placement, interview selection, employer response, or listing
              accuracy.
            </p>
            <h2>Verify Before Applying</h2>
            <p>
              Job information can change after it appears on KamKhoj. Candidates
              should verify every important detail on the original source before
              applying or sharing personal information.
            </p>
            <h2>Career Content</h2>
            <p>
              Blog articles and career guides are general informational content.
              They are not legal, financial, immigration, or professional
              employment advice.
            </p>
            <h2>Advertising</h2>
            <p>
              Advertising may appear on KamKhoj. Ads are provided by third-party
              networks and do not represent endorsement of advertised products,
              employers, or services.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}

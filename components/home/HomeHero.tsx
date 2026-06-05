import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export function HomeHero() {
  return (
    <section className="bg-zinc-950 px-2 pb-8 md:px-5">
      <div className="hero-grid relative mx-auto min-h-[680px] max-w-[1880px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/30">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,.035)_44%,transparent_72%)]" />

        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-6xl flex-col justify-center px-6 py-20 md:px-10 lg:px-0">
          <div className="max-w-5xl">
            <div className="mb-5 flex items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-zinc-400 md:text-sm">
              <span className="h-2.5 w-2.5 bg-primary" />
              Nepal jobs, internships, and remote openings
            </div>
            <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.02em] text-zinc-100 md:text-7xl lg:text-8xl">
              Your <span className="text-primary">Nepal job search</span> starts here.
            </h1>
            <p className="mt-8 max-w-3xl text-lg font-semibold leading-8 text-zinc-300 md:text-2xl">
              Search fresh vacancies from Nepali job sources, compare the
              details that matter, and apply through the original posting.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/jobs"
                className="inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 text-base font-black text-zinc-950 transition-colors hover:bg-primary"
              >
                <Search className="h-5 w-5" />
                Browse Jobs
              </Link>
              <Link
                href="/post-job"
                className="inline-flex min-h-14 items-center gap-3 rounded-full border border-white/20 bg-transparent px-7 text-base font-black text-white transition-colors hover:border-primary hover:bg-primary hover:text-zinc-950"
              >
                Hiring Resources
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

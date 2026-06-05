import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[78vh] overflow-hidden bg-[#070708] px-4 py-16 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 dark-page-pattern opacity-70" />
      <div className="pointer-events-none absolute right-[-10rem] top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_0.8fr]">
        <section>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-primary">
            Page not found
          </p>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight text-zinc-50 md:text-7xl">
            This job lead moved or the link is broken.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            KamKhoj keeps listings tied to their original sources. If this page
            is unavailable, start from the latest jobs, remote roles, or
            internships instead.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full bg-primary px-7 font-black text-zinc-950 hover:bg-white">
              <Link href="/jobs" className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Browse Jobs
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full border-white/10 bg-transparent px-7 font-black text-zinc-200 hover:bg-white/10 hover:text-white">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Back Home
              </Link>
            </Button>
          </div>
        </section>

        <aside className="rounded-3xl border border-white/10 bg-[#1b1b1d] p-6 shadow-2xl shadow-black/30">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-zinc-950">
              <Search className="h-7 w-7" />
            </div>
            <span className="font-mono text-5xl font-black text-white/10">404</span>
          </div>
          <div className="space-y-3">
            {[
              ["/remote-jobs", "Explore remote jobs"],
              ["/internships", "Find internships"],
              ["/blog", "Read career guides"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-zinc-200 transition-colors hover:border-primary/60 hover:text-primary"
              >
                <span>{label}</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-zinc-500">
            If you think this page should exist, send the URL from the contact
            page and we will review it.
          </p>
        </aside>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
type Job = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  applyUrl: string;
  source: string;
  salaryText?: string;
};
export default function Overview() {
  const { status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    Promise.all([
      fetch(`/api/me/jobs?page=${page}&pageSize=10`, {
        cache: "no-store",
      }).then((r) => r.json()),
      fetch("/api/me/saved-jobs", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([a, b]) => {
        setJobs(a.jobs || []);
        setTotal(a.total || 0);
        setHasNext(Boolean(a.hasNextPage));
        setSaved((b.jobs || []).map((x: any) => (typeof x === "string" ? x : x.id)));
      })
      .finally(() => setLoading(false));
  }, [status, page]);
  if (status !== "authenticated") return null;
  async function toggle(job: Job) {
    const active = saved.includes(job.id);
    await fetch("/api/me/saved-jobs", {
      method: active ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: job.id, job }),
    });
    setSaved(active ? saved.filter((id) => id !== job.id) : [...saved, job.id]);
  }
  return (
    <main className="mx-auto max-w-6xl p-5 md:p-10">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Your daily search</p>
        <h1 className="mt-3 text-4xl font-black text-white">Find your next good move.</h1>
        <p className="mt-2 text-zinc-500">Keyword matches first. Filters refine those matches.</p>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Total matches" value={loading ? "—" : String(total)} />
        <Stat label="Saved jobs" value={String(saved.length)} />
        <Stat label="Current page" value={loading ? "—" : String(jobs.length)} />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Recommended for you</h2>
        <Link href="/dashboard/preferences" className="text-sm font-bold text-primary">
          Tune preferences →
        </Link>
      </div>
      {!loading && !jobs.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
          No jobs match those keywords and filters.
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#171715] p-5"
              >
                <a href={job.applyUrl} target="_blank" className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {job.source}
                  </p>
                  <h3 className="mt-2 truncate font-bold text-white hover:text-primary">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {job.company || "Company undisclosed"} · {job.location || "Location not listed"}
                  </p>
                </a>
                <button
                  onClick={() => toggle(job)}
                  className={`rounded-xl border p-3 ${
                    saved.includes(job.id)
                      ? "border-primary bg-primary text-zinc-950"
                      : "border-white/10 text-zinc-400"
                  }`}
                >
                  <Bookmark
                    className="h-4 w-4"
                    fill={saved.includes(job.id) ? "currentColor" : "none"}
                  />
                </button>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-zinc-500">Page {page}</span>
            <button
              disabled={!hasNext}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </main>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171715] p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
type Job = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  applyUrl: string;
  source: string;
};
export default function SavedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    fetch("/api/me/saved-jobs", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setJobs((d.jobs || []).filter((x: Job) => typeof x !== "string")));
  }, []);
  async function remove(id: string) {
    await fetch("/api/me/saved-jobs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setJobs((current) => current.filter((job) => job.id !== id));
  }
  return (
    <main className="mx-auto max-w-5xl p-5 md:p-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-primary">Your shortlist</p>
          <h1 className="mt-2 text-4xl font-black text-white">Saved jobs</h1>
        </div>
      </div>
      {!jobs.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
          No saved jobs yet. Use the bookmark button on any recommendation to save one.
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="block rounded-2xl border border-white/10 bg-[#171715] p-5 hover:border-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <a href={job.applyUrl} target="_blank" className="flex min-w-0 gap-4">
                  <Bookmark className="mt-1 shrink-0 text-primary" fill="currentColor" />
                  <div className="min-w-0">
                    <h2 className="font-bold text-white">{job.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      {job.company || "Company undisclosed"} ·{" "}
                      {job.location || "Location not listed"}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-wider text-zinc-600">
                      {job.source}
                    </p>
                  </div>
                </a>
                <button
                  onClick={() => remove(job.id)}
                  className="rounded-xl border border-white/10 p-3 text-zinc-500 hover:border-red-400 hover:text-red-400"
                  aria-label="Remove saved job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

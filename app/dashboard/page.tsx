"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, ChevronLeft, ChevronRight, Sparkles, Briefcase, MapPin } from "lucide-react";
import { CvUploadCard } from "@/components/CvUploadCard";

type Job = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  applyUrl: string;
  source: string;
  salaryText?: string;
  type?: string;
  jobType?: string | null;
};

export default function Overview() {
  const { status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<"all" | "cv" | "preferences">("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cvData, setCvData] = useState<{
    url: string | null;
    filename: string | null;
    role: string | null;
    skills: string[];
  } | null>(null);

  const fetchJobs = useCallback(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    Promise.all([
      fetch(`/api/me/jobs?page=${page}&pageSize=10&mode=${activeMode}`, {
        cache: "no-store",
      }).then((r) => r.json()),
      fetch("/api/me/saved-jobs", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([a, b]) => {
        setJobs(a.jobs || []);
        setTotal(a.total || 0);
        setHasNext(Boolean(a.hasNextPage));
        if (a.cv) {
          setCvData(a.cv);
        } else {
          setCvData(null);
        }
        setSaved((b.jobs || []).map((x: any) => (typeof x === "string" ? x : x.id)));
      })
      .catch((err) => console.error("Error loading jobs:", err))
      .finally(() => setLoading(false));
  }, [status, page, activeMode, refreshTrigger]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

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

  function handleCvChanged() {
    setPage(1);
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <main className="mx-auto max-w-6xl p-5 md:p-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">Your Workspace</p>
        <h1 className="mt-3 text-4xl font-black text-white">Find your next good move.</h1>
        <p className="mt-2 text-zinc-400">
          Upload your CV to automatically match active job vacancies in Nepal and beyond.
        </p>
      </div>

      {/* CV Upload and Extraction Component */}
      <CvUploadCard
        onCvChanged={handleCvChanged}
        activeMode={activeMode}
        onModeChange={(mode) => {
          setActiveMode(mode);
          setPage(1);
        }}
      />

      {/* Quick Statistics Bar */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat
          label={
            activeMode === "cv"
              ? "CV Matched Jobs"
              : activeMode === "preferences"
                ? "Preference Matches"
                : "Total Matches"
          }
          value={loading ? "—" : String(total)}
          sub={cvData?.role ? `Target: ${cvData.role}` : undefined}
        />
        <Stat label="Saved jobs" value={String(saved.length)} />
        <Stat
          label="Active Filter"
          value={
            activeMode === "cv"
              ? "CV Role & Skills"
              : activeMode === "preferences"
                ? "User Preferences"
                : "All Signals"
          }
        />
      </div>

      {/* Heading & Controls */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">
            {activeMode === "cv"
              ? "Jobs Matching Your CV"
              : activeMode === "preferences"
                ? "Jobs Matching Your Preferences"
                : "Recommended Jobs"}
          </h2>
          {activeMode === "cv" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> CV Powered
            </span>
          )}
        </div>
        <Link
          href="/dashboard/preferences"
          className="text-sm font-bold text-primary hover:underline"
        >
          Tune preferences →
        </Link>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-white/5 bg-[#171715]/60"
            />
          ))}
        </div>
      ) : !jobs.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-zinc-400">
          <Briefcase className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 font-semibold text-zinc-300">No jobs match the current criteria.</p>
          <p className="mt-1 text-sm text-zinc-500">
            {activeMode === "cv"
              ? "Try switching to 'All Matches' or updating your CV to broaden matching roles."
              : "Try updating your CV or tuning your search preferences."}
          </p>
          {activeMode !== "all" && (
            <button
              onClick={() => {
                setActiveMode("all");
                setPage(1);
              }}
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
            >
              Show All Matches
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#171715] p-5 transition hover:border-primary/40 hover:bg-[#1a1a17]"
              >
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {job.source}
                    </span>
                    {job.jobType && (
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        {job.jobType}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 truncate font-bold text-white transition group-hover:text-primary">
                    {job.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                    <span className="font-medium text-zinc-300">
                      {job.company || "Company undisclosed"}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      {job.location || "Location not listed"}
                    </span>
                    {job.salaryText && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400">{job.salaryText}</span>
                      </>
                    )}
                  </div>
                </a>
                <button
                  onClick={() => toggle(job)}
                  aria-label="Save job"
                  className={`rounded-xl border p-3 transition ${
                    saved.includes(job.id)
                      ? "border-primary bg-primary text-zinc-950 shadow-sm"
                      : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
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
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm font-medium text-zinc-500">Page {page}</span>
            <button
              disabled={!hasNext}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-30"
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

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#171715] p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-primary">{sub}</p>}
    </div>
  );
}

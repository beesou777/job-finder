"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, authFetch } from "@/lib/auth-context";
import {
  Bookmark,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  FileText,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { ReplaceCvModal } from "@/components/ReplaceCvModal";

interface Category {
  id?: string;
  name: string;
  slug?: string;
}

interface ScoreBreakdown {
  titleScore?: number;
  intentScore?: number;
  seniorityScore?: number;
  skillScore?: number;
  locationScore?: number;
  jobTypeScore?: number;
  categoryScore?: number;
  freshnessScore?: number;
  cappedDueToIncompatibility?: boolean;
}

interface DescriptionMatch {
  hasDescription: boolean;
  matchedSkills: string[];
  skillCoverageRatio: number;
  seniorityMatched: boolean;
  seniorityLabel?: string | null;
  roleMatchLevel?: string | null;
}

interface MatchedJob {
  id: string;
  title: string;
  applyUrl: string;
  company: string | null;
  location: string | null;
  salaryText?: string | null;
  deadline?: string | null;
  expiresAt?: string | null;
  jobType?: string | null;
  categoryId?: string | null;
  type?: string;
  source: string;
  isActive: boolean;
  firstSeenAt?: string;
  lastSeenAt?: string;
  postedAt?: string;
  category?: Category | null;
  description?: string | null;
  requirements?: string | null;

  // Match specific fields
  matchScore: number;
  matchRatio: number;
  is80PercentMatch: boolean;
  matchReasons: string[];
  titleMatch?: string;
  scoreBreakdown?: ScoreBreakdown;
  descriptionMatch?: DescriptionMatch;
}

interface CvData {
  url?: string | null;
  filename?: string | null;
  role?: string | null;
  skills?: string[];
  experienceLevel?: string | null;
  summary?: string | null;
}

export default function MatchesPage() {
  const router = useRouter();
  const { status } = useSession();

  // State
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [cv, setCv] = useState<CvData | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filters matching the API
  const [minScore, setMinScore] = useState<number>(80);
  const [mode, setMode] = useState<"all" | "cv" | "preferences">("all");
  const [source, setSource] = useState<"platform" | "all">("platform");
  const [enableAiRerank, setEnableAiRerank] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal inspection
  const [selectedJob, setSelectedJob] = useState<MatchedJob | null>(null);
  const [showReplaceCvModal, setShowReplaceCvModal] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/matches");
    }
  }, [status, router]);

  // Fetch saved jobs list
  const fetchSavedJobs = useCallback(() => {
    authFetch("/api/me/saved-jobs", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { jobs: [] }))
      .then((data) => {
        const ids = (data.jobs || []).map((x: any) => (typeof x === "string" ? x : x.id));
        setSavedJobIds(ids);
      })
      .catch(() => {});
  }, []);

  // Fetch matches from API
  const fetchMatches = useCallback(() => {
    if (status !== "authenticated") return;
    setLoading(true);

    const minRatio = (minScore / 100).toFixed(2);
    const queryParams = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      mode,
      source,
      enableAiRerank: String(enableAiRerank),
      minScore: String(minScore),
      minRatio,
    });

    authFetch(`/me/jobs/matches?${queryParams.toString()}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch matches");
        return res.json();
      })
      .then((data) => {
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        setHasNextPage(Boolean(data.hasNextPage));
        if (data.cv) setCv(data.cv);
        if (data.matchedKeywords) setMatchedKeywords(data.matchedKeywords);
      })
      .catch((err) => {
        console.error("Error loading matches:", err);
        setJobs([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [status, page, pageSize, mode, source, enableAiRerank, minScore]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSavedJobs();
      fetchMatches();
    }
  }, [status, fetchMatches, fetchSavedJobs]);

  // Toggle Save Job
  async function toggleSave(job: MatchedJob) {
    const isSaved = savedJobIds.includes(job.id);
    setSavingId(job.id);
    try {
      const res = await authFetch("/api/me/saved-jobs", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, job }),
      });
      if (res.ok) {
        setSavedJobIds((current) =>
          isSaved ? current.filter((id) => id !== job.id) : [...current, job.id],
        );
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSavingId(null);
    }
  }

  // Filter jobs locally by search query if user types in search box
  const filteredJobs = searchQuery.trim()
    ? jobs.filter((j) => {
        const q = searchQuery.toLowerCase();
        return (
          j.title.toLowerCase().includes(q) ||
          (j.company && j.company.toLowerCase().includes(q)) ||
          (j.location && j.location.toLowerCase().includes(q)) ||
          (j.descriptionMatch?.matchedSkills || []).some((s) => s.toLowerCase().includes(q))
        );
      })
    : jobs;

  const getScoreColor = (score: number) => {
    if (score >= 90) {
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        bar: "bg-emerald-500",
      };
    }
    if (score >= 80) {
      return {
        bg: "bg-primary/10",
        border: "border-primary/30",
        text: "text-primary",
        bar: "bg-primary",
      };
    }
    return {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      bar: "bg-amber-500",
    };
  };

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-zinc-400">Loading job matches...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Matched Opportunities</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Jobs ranked and scored based on your CV profile, skills, and career signals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setPage(1);
              fetchMatches();
            }}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/dashboard/preferences"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Tune Signals
          </Link>
        </div>
      </div>

      {/* CV Profile & Signals Banner */}
      {cv && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#141412] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Target Profile
                </span>
                {cv.role && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {cv.role}
                  </span>
                )}
                {cv.experienceLevel && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                    Level: {cv.experienceLevel}
                  </span>
                )}
                {cv.filename && (
                  <span className="text-xs text-zinc-500">
                    from <span className="font-mono text-zinc-400">{cv.filename}</span>
                  </span>
                )}
              </div>

              {cv.summary && <p className="line-clamp-2 text-xs text-zinc-400">{cv.summary}</p>}

              {cv.skills && cv.skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-zinc-500">Detected Skills:</span>
                  {cv.skills.slice(0, 10).map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {cv.skills.length > 10 && (
                    <span className="text-[11px] text-zinc-500">+{cv.skills.length - 10} more</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReplaceCvModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-white"
              >
                Replace CV
              </button>
              {cv.url && (
                <a
                  href={cv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  View Uploaded CV
                  <ExternalLink className="h-3 w-3 text-zinc-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload CV Prompt when no CV is attached */}
      {!cv && !loading && (
        <div className="mb-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Upload Your CV for AI Matchmaking</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Upload your resume (PDF, DOCX, TXT) to get personalized 80%+ job match scores based on
              your real experience and skills.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReplaceCvModal(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-zinc-950 shadow transition hover:bg-white"
          >
            Upload CV
          </button>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#171715] p-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Score Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-zinc-400">Min Score:</span>
          {[
            { label: "80%+ Matches", value: 80 },
            { label: "70%+", value: 70 },
            { label: "90%+", value: 90 },
            { label: "All (0%+)", value: 0 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setMinScore(item.value);
                setPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                minScore === item.value
                  ? "bg-primary text-zinc-950 shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Center/Right: Mode & AI Rerank Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode selector */}
          <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5 text-xs">
            <button
              onClick={() => {
                setMode("all");
                setPage(1);
              }}
              className={`rounded-md px-2.5 py-1 font-semibold transition ${
                mode === "all" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => {
                setMode("cv");
                setPage(1);
              }}
              className={`rounded-md px-2.5 py-1 font-semibold transition ${
                mode === "cv" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              CV Only
            </button>
            <button
              onClick={() => {
                setMode("preferences");
                setPage(1);
              }}
              className={`rounded-md px-2.5 py-1 font-semibold transition ${
                mode === "preferences"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Preferences
            </button>
          </div>

          {/* AI Rerank toggle */}
          <button
            onClick={() => {
              setEnableAiRerank(!enableAiRerank);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
              enableAiRerank
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            AI Rerank: {enableAiRerank ? "ON" : "OFF"}
          </button>

          {/* Search box within current view */}
          <div className="relative min-w-[160px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search in matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#d6e5f7] bg-white py-2 pl-8 pr-3 text-xs text-[#102e67] placeholder:text-[#91a1ba] focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-zinc-400">
          Showing <span className="font-bold text-white">{filteredJobs.length}</span> of{" "}
          <span className="font-bold text-white">{total}</span> total matching positions
        </p>
        {minScore > 0 && (
          <span className="text-xs text-zinc-500">
            Filtered by min score: <span className="font-mono text-primary">{minScore}%+</span>
          </span>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-white/5 bg-[#171715]/60"
            />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#171715]/40 p-12 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-zinc-600" />
          <h3 className="mt-3 text-lg font-bold text-white">No job matches found</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {minScore > 0
              ? `No jobs found with score >= ${minScore}%. Try relaxing the minimum score.`
              : "No jobs matched your current criteria. Try adjusting mode or updating your CV profile."}
          </p>
          {minScore > 0 && (
            <button
              onClick={() => {
                setMinScore(0);
                setPage(1);
              }}
              className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20"
            >
              Show All Available Matches (0%+)
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* DESKTOP / LAPTOP VIEW: TABLE FORMAT (hidden lg:block)                     */}
          {/* ========================================================================= */}
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#171715] shadow-xl lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="py-3.5 pl-5 pr-3">Match Score</th>
                    <th className="py-3.5 px-3">Role & Company</th>
                    <th className="py-3.5 px-3">Location & Type</th>
                    <th className="py-3.5 px-3">Salary</th>
                    <th className="py-3.5 px-3">Match Reasons</th>
                    <th className="py-3.5 px-3">Deadline</th>
                    <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredJobs.map((job) => {
                    const colors = getScoreColor(job.matchScore);
                    const isSaved = savedJobIds.includes(job.id);

                    return (
                      <tr key={job.id} className="group transition hover:bg-white/[0.02]">
                        {/* Match Score Column */}
                        <td className="py-4 pl-5 pr-3 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black ${colors.bg} ${colors.border} ${colors.text} w-fit`}
                            >
                              {job.matchScore}%
                            </div>
                            {job.is80PercentMatch && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                80%+ Match
                              </span>
                            )}
                            {job.titleMatch && (
                              <span className="text-[10px] text-zinc-500">
                                Role: {job.titleMatch}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Role & Company Column */}
                        <td className="py-4 px-3 align-top max-w-[260px]">
                          <div className="space-y-1">
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-white hover:text-primary transition line-clamp-2"
                            >
                              {job.title}
                            </a>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                              <Building2 className="h-3 w-3 shrink-0 text-zinc-500" />
                              <span className="truncate">{job.company || "Undisclosed"}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                                {job.source}
                              </span>
                              {job.category?.name && (
                                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                                  {job.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location & Type Column */}
                        <td className="py-4 px-3 align-top text-xs text-zinc-300 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                              <span>{job.location || "Location not listed"}</span>
                            </div>
                            {job.jobType && (
                              <span className="inline-block rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 capitalize">
                                {job.jobType}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Salary Column */}
                        <td className="py-4 px-3 align-top text-xs whitespace-nowrap">
                          <span
                            className={
                              job.salaryText && job.salaryText !== "Not Disclosed"
                                ? "font-semibold text-emerald-400"
                                : "text-zinc-500"
                            }
                          >
                            {job.salaryText || "Not disclosed"}
                          </span>
                        </td>

                        {/* Match Reasons Column */}
                        <td className="py-4 px-3 align-top max-w-[280px]">
                          <div className="space-y-1.5">
                            {job.matchReasons && job.matchReasons.length > 0 ? (
                              <div className="space-y-1">
                                {job.matchReasons.slice(0, 2).map((reason, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-1 text-xs text-zinc-300"
                                  >
                                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                    <span className="line-clamp-1">{reason}</span>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            {/* Matched skills tags */}
                            {job.descriptionMatch?.matchedSkills &&
                              job.descriptionMatch.matchedSkills.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                  {job.descriptionMatch.matchedSkills.slice(0, 4).map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.2 text-[10px] font-medium text-primary"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                  {job.descriptionMatch.matchedSkills.length > 4 && (
                                    <span className="text-[10px] text-zinc-500">
                                      +{job.descriptionMatch.matchedSkills.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </td>

                        {/* Deadline Column */}
                        <td className="py-4 px-3 align-top text-xs text-zinc-400 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-zinc-500" />
                            <span>{job.deadline || "Ongoing"}</span>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 pl-3 pr-5 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedJob(job)}
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                              title="View Match Breakdown"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => toggleSave(job)}
                              disabled={savingId === job.id}
                              className={`rounded-lg border p-2 transition ${
                                isSaved
                                  ? "border-primary bg-primary text-zinc-950 shadow-sm"
                                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                              }`}
                              title={isSaved ? "Remove from saved" : "Save job"}
                            >
                              <Bookmark
                                className="h-3.5 w-3.5"
                                fill={isSaved ? "currentColor" : "none"}
                              />
                            </button>
                            <a
                              href={job.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-white"
                            >
                              Apply
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MOBILE / SMALLER SCREEN VIEW: CARD FORMAT (block lg:hidden)               */}
          {/* ========================================================================= */}
          <div className="block space-y-3.5 lg:hidden">
            {filteredJobs.map((job) => {
              const colors = getScoreColor(job.matchScore);
              const isSaved = savedJobIds.includes(job.id);

              return (
                <article
                  key={job.id}
                  className="rounded-2xl border border-white/10 bg-[#171715] p-4 shadow-md transition hover:border-primary/30"
                >
                  {/* Top Bar: Match Score Badge & Save Button */}
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${colors.bg} ${colors.border} ${colors.text}`}
                      >
                        {job.matchScore}% Match
                      </div>
                      <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {job.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white"
                        aria-label="View Details"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toggleSave(job)}
                        disabled={savingId === job.id}
                        className={`rounded-lg border p-2 transition ${
                          isSaved
                            ? "border-primary bg-primary text-zinc-950 shadow-sm"
                            : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                        }`}
                        aria-label="Save Job"
                      >
                        <Bookmark
                          className="h-3.5 w-3.5"
                          fill={isSaved ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title and Company */}
                  <div className="mt-3">
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-white hover:text-primary transition line-clamp-2"
                    >
                      {job.title}
                    </a>
                    <p className="mt-1 text-xs font-medium text-zinc-400">
                      {job.company || "Company Undisclosed"}
                      {job.category?.name && ` · ${job.category.name}`}
                    </p>
                  </div>

                  {/* Meta Chips */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      {job.location || "Nepal"}
                    </span>
                    {job.salaryText && (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-400">
                        {job.salaryText}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 capitalize">
                        {job.jobType}
                      </span>
                    )}
                  </div>

                  {/* Match Reasons */}
                  {job.matchReasons && job.matchReasons.length > 0 && (
                    <div className="mt-3 space-y-1 rounded-xl bg-black/30 p-2.5">
                      {job.matchReasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-zinc-300">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matched Skills */}
                  {job.descriptionMatch?.matchedSkills &&
                    job.descriptionMatch.matchedSkills.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-bold text-zinc-500">Skills:</span>
                        {job.descriptionMatch.matchedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Bottom Footer: Deadline & Apply Button */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {job.deadline || "No deadline listed"}
                    </span>

                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-white"
                    >
                      Apply Now
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <button
              disabled={page === 1 || loading}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-xs font-semibold text-zinc-400">
              Page <span className="text-white">{page}</span>
              {total > 0 && (
                <span className="text-zinc-500"> of {Math.ceil(total / pageSize) || 1}</span>
              )}
            </span>

            <button
              disabled={!hasNextPage || loading}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MATCH BREAKDOWN MODAL                                                     */}
      {/* ========================================================================= */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#141412] p-6 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${
                      getScoreColor(selectedJob.matchScore).bg
                    } ${getScoreColor(selectedJob.matchScore).border} ${
                      getScoreColor(selectedJob.matchScore).text
                    }`}
                  >
                    {selectedJob.matchScore}% Match
                  </span>
                  <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {selectedJob.source}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold">{selectedJob.title}</h2>
                <p className="text-xs text-zinc-400">
                  {selectedJob.company || "Undisclosed Company"} · {selectedJob.location || "Nepal"}
                </p>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-5 text-sm">
              {/* Score Breakdown Section */}
              {selectedJob.scoreBreakdown && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Score Breakdown
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {selectedJob.scoreBreakdown.titleScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Title Match
                        </span>
                        <p className="mt-0.5 text-lg font-black text-white">
                          {selectedJob.scoreBreakdown.titleScore} pts
                        </p>
                      </div>
                    )}
                    {selectedJob.scoreBreakdown.intentScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Role Intent
                        </span>
                        <p className="mt-0.5 text-lg font-black text-white">
                          {selectedJob.scoreBreakdown.intentScore} pts
                        </p>
                      </div>
                    )}
                    {selectedJob.scoreBreakdown.seniorityScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Seniority
                        </span>
                        <p className="mt-0.5 text-lg font-black text-white">
                          {selectedJob.scoreBreakdown.seniorityScore} pts
                        </p>
                      </div>
                    )}
                    {selectedJob.scoreBreakdown.skillScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Skill Overlap
                        </span>
                        <p className="mt-0.5 text-lg font-black text-white">
                          {selectedJob.scoreBreakdown.skillScore} pts
                        </p>
                      </div>
                    )}
                    {selectedJob.scoreBreakdown.locationScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Location
                        </span>
                        <p className="mt-0.5 text-base font-bold text-white">
                          {selectedJob.scoreBreakdown.locationScore} pts
                        </p>
                      </div>
                    )}
                    {selectedJob.scoreBreakdown.jobTypeScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Job Type
                        </span>
                        <p className="mt-0.5 text-base font-bold text-white">
                          {selectedJob.scoreBreakdown.jobTypeScore} pts
                        </p>
                      </div>
                    )}
                    {selectedJob.scoreBreakdown.categoryScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Category
                        </span>
                        <p className="mt-0.5 text-base font-bold text-white">
                          {selectedJob.scoreBreakdown.categoryScore} pts
                        </p>
                      </div>
                    )}
                    {selectedJob.scoreBreakdown.freshnessScore !== undefined && (
                      <div className="rounded-xl border border-white/5 bg-black/40 p-2.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                          Freshness
                        </span>
                        <p className="mt-0.5 text-base font-bold text-white">
                          {selectedJob.scoreBreakdown.freshnessScore} pts
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Match Reasons */}
              {selectedJob.matchReasons && selectedJob.matchReasons.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Match Analysis
                  </h3>
                  <div className="mt-2 space-y-1.5 rounded-xl border border-white/5 bg-black/40 p-3">
                    {selectedJob.matchReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Skills & Coverage */}
              {selectedJob.descriptionMatch && (
                <div className="rounded-xl border border-white/5 bg-black/40 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-400">Skill Coverage Ratio</span>
                    <span className="font-bold text-primary">
                      {Math.round((selectedJob.descriptionMatch.skillCoverageRatio || 0) * 100)}%
                    </span>
                  </div>
                  {selectedJob.descriptionMatch.matchedSkills &&
                    selectedJob.descriptionMatch.matchedSkills.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {selectedJob.descriptionMatch.matchedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {/* Description preview if present */}
              {selectedJob.description && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Job Description
                  </h3>
                  <p className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-3 text-xs leading-relaxed text-zinc-300">
                    {selectedJob.description}
                  </p>
                </div>
              )}

              {/* Requirements preview if present */}
              {selectedJob.requirements && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Requirements
                  </h3>
                  <p className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-3 text-xs leading-relaxed text-zinc-300">
                    {selectedJob.requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <button
                onClick={() => toggleSave(selectedJob)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                  savedJobIds.includes(selectedJob.id)
                    ? "border-primary bg-primary text-zinc-950"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:text-white"
                }`}
              >
                <Bookmark
                  className="h-3.5 w-3.5"
                  fill={savedJobIds.includes(selectedJob.id) ? "currentColor" : "none"}
                />
                {savedJobIds.includes(selectedJob.id) ? "Saved" : "Save Job"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Close
                </button>
                <a
                  href={selectedJob.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-white"
                >
                  Go to Job Application
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replace / Upload CV Modal */}
      <ReplaceCvModal
        isOpen={showReplaceCvModal}
        onClose={() => setShowReplaceCvModal(false)}
        onSuccess={(newCv) => {
          if (newCv) {
            setCv(newCv);
          } else {
            setCv(null);
          }
          setPage(1);
          fetchMatches();
        }}
        currentCvFilename={cv?.filename}
        currentCvUrl={cv?.url}
        currentRole={cv?.role}
      />
    </main>
  );
}

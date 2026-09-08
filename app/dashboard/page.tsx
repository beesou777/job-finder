"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, authFetch } from "@/lib/auth-context";
import {
  Sparkles,
  Bookmark,
  TrendingUp,
  Briefcase,
  Clock,
  ArrowUpRight,
  ExternalLink,
  FileText,
  CheckCircle2,
  MapPin,
  Building2,
  ChevronRight,
  SlidersHorizontal,
  BadgeCheck,
  RefreshCw,
  Calculator,
  MessageSquare,
  UploadCloud,
  AlertCircle,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { CvUploadCard } from "@/components/CvUploadCard";
import { ReplaceCvModal } from "@/components/ReplaceCvModal";

interface UrgentJob {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  salaryText?: string | null;
  deadline?: string | null;
  matchScore: number;
  applyUrl: string;
  source: string;
}

interface OverviewData {
  profile?: {
    name?: string;
    role?: string;
    experienceLevel?: string;
    profileScore?: number;
    cvFilename?: string;
    cvUrl?: string;
    summary?: string;
    skills?: string[];
  };
  metrics?: {
    highMatchCount?: number;
    savedCount?: number;
    marketDemand?: {
      level: string;
      activeJobsCount?: number;
      role?: string;
    };
    salaryBenchmark?: {
      range: string;
      period: string;
    };
  };
  urgentMatches?: UrgentJob[];
  skillsInsight?: {
    userTopSkills?: string[];
    inDemandMissingSkills?: string[];
  };
}

export default function Overview() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [showCvUploader, setShowCvUploader] = useState(false);
  const [showReplaceCvModal, setShowReplaceCvModal] = useState(false);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  const loadDashboardOverview = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);

    try {
      const [overviewRes, savedRes] = await Promise.all([
        authFetch("/api/me/dashboard/overview", { cache: "no-store" }),
        authFetch("/api/me/saved-jobs", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : { jobs: [] }))
          .catch(() => ({ jobs: [] })),
      ]);

      const rawSaved = (savedRes.jobs || []).map((x: any) => (typeof x === "string" ? x : x.id));
      setSavedIds(rawSaved);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        if (data.metrics && rawSaved.length !== undefined) {
          data.metrics.savedCount = rawSaved.length;
        }
        setOverviewData(data);
      } else {
        // Fallback if endpoint is unavailable
        const matchesRes = await authFetch(
          "/api/me/jobs/matches?page=1&pageSize=5&mode=all&source=platform&minScore=80&minRatio=0.8",
          { cache: "no-store" },
        ).then((r) => (r.ok ? r.json() : { jobs: [], total: 0 }));

        const cv = matchesRes.cv || {};
        const urgent: UrgentJob[] = (matchesRes.jobs || []).slice(0, 3).map((j: any) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          salaryText: j.salaryText,
          deadline: j.deadline,
          matchScore: j.matchScore || 85,
          applyUrl: j.applyUrl,
          source: j.source,
        }));

        setOverviewData({
          profile: {
            name: session?.user?.name || session?.user?.email?.split("@")[0] || "Job Seeker",
            role: cv.role || "Full Stack Developer",
            experienceLevel: cv.experienceLevel || "Mid",
            profileScore: cv.role ? 88 : 45,
            cvFilename: cv.filename || undefined,
            cvUrl: cv.url || undefined,
          },
          metrics: {
            highMatchCount: matchesRes.total || 0,
            savedCount: rawSaved.length,
            marketDemand: {
              level: "High",
              activeJobsCount: matchesRes.total ? matchesRes.total * 2 : 36,
              role: cv.role || "Full Stack Developer",
            },
            salaryBenchmark: {
              range: "NPR 90K - 140K",
              period: "monthly",
            },
          },
          urgentMatches: urgent,
          skillsInsight: {
            userTopSkills: cv.skills || [
              "React.js",
              "Node.js",
              "TypeScript",
              "Next.js",
              "PostgreSQL",
              "MongoDB",
            ],
            inDemandMissingSkills: ["Docker", "Redis", "AWS", "GraphQL"],
          },
        });
      }
    } catch (err) {
      console.error("Error loading dashboard overview:", err);
    } finally {
      setLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    loadDashboardOverview();
  }, [loadDashboardOverview]);

  async function toggleSave(job: UrgentJob) {
    const isSaved = savedIds.includes(job.id);
    setSavingId(job.id);
    try {
      const res = await authFetch("/api/me/saved-jobs", {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, job }),
      });
      if (res.ok) {
        setSavedIds((current) =>
          isSaved ? current.filter((id) => id !== job.id) : [...current, job.id],
        );
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    } finally {
      setSavingId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="mx-auto max-w-7xl p-5 md:p-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-zinc-400">Loading your career command center...</p>
        </div>
      </main>
    );
  }

  const profile = overviewData?.profile;
  const metrics = overviewData?.metrics;
  const urgentMatches = overviewData?.urgentMatches || [];
  const skillsInsight = overviewData?.skillsInsight;

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8 space-y-8">
      {/* 1. HERO HEADER: Greeting & Profile Readiness */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#171715] via-[#141412] to-[#0f0f0e] p-6 md:p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Career Pulse
              </span>
              {profile?.experienceLevel && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                  {profile.experienceLevel} Level
                </span>
              )}
            </div>

            <h1 className="text-3xl font-black text-white md:text-4xl">
              Welcome back, {profile?.name || "Bishwa"}
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Your profile is matched with active vacancies in Nepal and remote opportunities. Here
              is your market pulse and urgent jobs closing soon.
            </p>

            {profile?.role && (
              <div className="flex items-center gap-2 pt-1 text-xs text-zinc-300">
                <span className="text-zinc-500">Target Role:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  {profile.role}
                </span>
              </div>
            )}
          </div>

          {/* Profile Readiness Meter & CV actions */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 sm:min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Profile Readiness
              </span>
              <span className="text-sm font-black text-primary">
                {profile?.profileScore || 85}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${profile?.profileScore || 85}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span className="truncate max-w-[130px]">
                {profile?.cvFilename ? `CV: ${profile.cvFilename}` : "No CV uploaded"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplaceCvModal(true)}
                  className="font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Replace CV
                </button>
                <span className="text-zinc-600">·</span>
                <button
                  type="button"
                  onClick={() => setShowReplaceCvModal(true)}
                  className="font-medium text-zinc-400 hover:text-white"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible CV Uploader if user wants to view it */}
        {showCvUploader && (
          <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in">
            <CvUploadCard
              activeMode="all"
              onModeChange={() => {}}
              onCvChanged={() => {
                loadDashboardOverview();
                setShowCvUploader(false);
              }}
            />
          </div>
        )}
      </div>

      {/* 2. THREE KEY METRIC KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: High Matches (80%+) */}
        <Link
          href="/dashboard/matches"
          className="group rounded-2xl border border-white/10 bg-[#171715] p-5 transition hover:border-primary/40 hover:bg-[#1b1b18]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              80%+ High Matches
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{metrics?.highMatchCount ?? "—"}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary">
            <span>Explore match table</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Card 2: Saved Shortlist */}
        <Link
          href="/dashboard/saved"
          className="group rounded-2xl border border-white/10 bg-[#171715] p-5 transition hover:border-white/30 hover:bg-[#1b1b18]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Saved Shortlist
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-300 group-hover:scale-110 transition">
              <Bookmark className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{savedIds.length}</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-white transition">
            <span>View saved jobs</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Card 3: Market Demand Indicator */}
        <div className="rounded-2xl border border-white/10 bg-[#171715] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Market Demand
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-400">
            {metrics?.marketDemand?.level || "High"}
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            {metrics?.marketDemand?.activeJobsCount || 36}+ active tech vacancies in Nepal
          </p>
        </div>
      </div>

      {/* 3. MAIN SECTION: 2 COLUMNS (Urgent Matches vs Career Launchpad & Skills) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* LEFT 2 COLUMNS: Expiring Soon High Matches */}
        <div className="space-y-6 lg:col-span-2">
          {/* Urgent Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400" />
                  Urgent Matches Expiring Soon
                </h2>
                <p className="text-xs text-zinc-400">
                  Top-rated opportunities aligned with your CV that close in the next few days.
                </p>
              </div>
              <Link
                href="/dashboard/matches"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                View all matches
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {urgentMatches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
                <Briefcase className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
                No urgent deadlines this week. Check your{" "}
                <Link href="/dashboard/matches" className="text-primary hover:underline">
                  Job Matches
                </Link>{" "}
                for all open positions.
              </div>
            ) : (
              <div className="space-y-3">
                {urgentMatches.map((job) => {
                  const isSaved = savedIds.includes(job.id);
                  return (
                    <div
                      key={job.id}
                      className="group rounded-2xl border border-white/10 bg-[#171715] p-4 transition hover:border-primary/30 hover:bg-[#1a1a17]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                              {job.matchScore}% Match
                            </span>
                            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              {job.source}
                            </span>
                            {job.deadline && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                                <Clock className="h-3 w-3" />
                                {job.deadline}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-white group-hover:text-primary transition line-clamp-1">
                            {job.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                              {job.company || "Company Undisclosed"}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                              {job.location || "Nepal"}
                            </span>
                            {job.salaryText && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-emerald-400">
                                  {job.salaryText}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                          <button
                            onClick={() => toggleSave(job)}
                            disabled={savingId === job.id}
                            className={`rounded-xl border p-2.5 transition ${
                              isSaved
                                ? "border-primary bg-primary text-zinc-950"
                                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                            }`}
                            title={isSaved ? "Remove from saved" : "Save job"}
                          >
                            <Bookmark
                              className="h-4 w-4"
                              fill={isSaved ? "currentColor" : "none"}
                            />
                          </button>
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-white"
                          >
                            Apply
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Skills Radar & Market Gap Insights */}
          <div className="rounded-2xl border border-white/10 bg-[#171715] p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Skill Match & Market Gap Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Your High Demand Skills */}
              <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-2.5">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Your Strong Skills (High Demand)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(skillsInsight?.userTopSkills || []).slice(0, 8).map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* In-Demand Missing Skills */}
              <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-2.5">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  Recommended Skills to Learn
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(skillsInsight?.inDemandMissingSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300"
                    >
                      +{skill}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 pt-1">
                  Frequently requested by Nepal & remote tech employers for your role.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: Quick Launchpad & Utilities */}
        <div className="space-y-6">
          {/* Quick Tools Launchpad */}
          <div className="rounded-2xl border border-white/10 bg-[#171715] p-5 space-y-4">
            <h2 className="text-base font-bold text-white">Career Utilities</h2>

            <div className="space-y-3">
              {/* Tool 1: Mock Interview Practice */}
              <Link
                href="/dashboard/interview-practice"
                className="group flex items-start gap-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-primary/40 hover:bg-white/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-primary transition">
                    AI Interview Practice
                  </h3>
                  <p className="text-xs text-zinc-400 leading-snug">
                    Simulate real technical & behavioral questions for{" "}
                    {profile?.role || "Full Stack"}.
                  </p>
                </div>
              </Link>

              {/* Tool 2: Nepal Salary Calculator */}
              <Link
                href="/tools/salary-calculator-nepal"
                className="group flex items-start gap-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-primary/40 hover:bg-white/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Calculator className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                    Nepal Salary Tax Calculator
                  </h3>
                  <p className="text-xs text-zinc-400 leading-snug">
                    Estimate net monthly take-home pay, SSF deductions, and tax brackets.
                  </p>
                </div>
              </Link>

              {/* Tool 3: Search & Matching Preferences */}
              <Link
                href="/dashboard/preferences"
                className="group flex items-start gap-3.5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-primary/40 hover:bg-white/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-zinc-300">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-white transition">
                    Matching Preferences
                  </h3>
                  <p className="text-xs text-zinc-400 leading-snug">
                    Set target salary, remote vs on-site, and preferred cities.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* CV Details Card */}
          <div className="rounded-2xl border border-white/10 bg-[#171715] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Active CV Profile
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-black/40 p-3">
              <FileText className="h-6 w-6 text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {profile?.cvFilename || "Resume.pdf"}
                </p>
                <p className="text-[10px] text-zinc-500">
                  Extracted {profile?.role || "Full Stack Developer"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              {profile?.cvUrl ? (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  View CV PDF
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-zinc-500">No URL</span>
              )}
              <button
                type="button"
                onClick={() => setShowReplaceCvModal(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 font-bold text-xs text-zinc-950 hover:bg-white transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Replace CV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replace & Manage CV Modal */}
      <ReplaceCvModal
        isOpen={showReplaceCvModal}
        onClose={() => setShowReplaceCvModal(false)}
        onSuccess={() => {
          loadDashboardOverview();
        }}
        currentCvFilename={profile?.cvFilename}
        currentCvUrl={profile?.cvUrl}
        currentRole={profile?.role}
      />
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  ClipboardList,
  ExternalLink,
  HelpCircle,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useSession } from "@/lib/auth-context";
import {
  deleteApplication,
  listApplications,
  TrackedApplication,
  updateApplication,
} from "@/lib/applications";

const stages: { value: TrackedApplication["stage"]; label: string; color: string }[] = [
  { value: "prepared", label: "Prepared", color: "bg-blue-100 text-blue-800 border-blue-200" },
  {
    value: "user_action_required",
    label: "Action Needed",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    value: "applied_user_reported",
    label: "Submitted",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    value: "acknowledged",
    label: "Acknowledged",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    value: "interview",
    label: "Interview",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    value: "offer",
    label: "Offer Received",
    color: "bg-green-100 text-green-900 border-green-300",
  },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "withdrawn", label: "Withdrawn", color: "bg-zinc-100 text-zinc-800 border-zinc-200" },
];

export function ApplicationTracker() {
  const { status } = useSession();
  const [items, setItems] = useState<TrackedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<TrackedApplication["stage"] | "all">("all");

  function reload() {
    setLoading(true);
    setError("");
    void listApplications()
      .then(setItems)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Could not load applications."),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (status === "authenticated") reload();
    else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  async function update(item: TrackedApplication, stage: TrackedApplication["stage"]) {
    setBusy(item.id);
    setError("");
    try {
      const value = await updateApplication(item, stage, note);
      setItems((current) => current.map((entry) => (entry.id === value.id ? value : entry)));
      setEditing(null);
      setNote("");
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not update application.");
    } finally {
      setBusy("");
    }
  }

  async function remove(item: TrackedApplication) {
    if (!window.confirm(`Remove ${item.jobTitle} from your application tracker?`)) return;
    setBusy(item.id);
    setError("");
    try {
      await deleteApplication(item);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not remove application.");
    } finally {
      setBusy("");
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-4xl p-8 text-center">
        <p className="text-zinc-600">
          <Link
            className="font-semibold text-primary underline"
            href="/login?callbackUrl=%2Fdashboard%2Fapplications"
          >
            Sign in
          </Link>{" "}
          to access your application tracker.
        </p>
      </main>
    );
  }

  const visible = filter === "all" ? items : items.filter((item) => item.stage === filter);

  // Metrics
  const activeCount = items.filter(
    (i) =>
      i.stage === "applied_user_reported" || i.stage === "acknowledged" || i.stage === "prepared",
  ).length;
  const interviewCount = items.filter((i) => i.stage === "interview").length;
  const offerCount = items.filter((i) => i.stage === "offer").length;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Application Command Center
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#102e67] sm:text-4xl">
            Application Tracker
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Keep every job application organized in one central place. Manage employer follow-ups,
            interview schedules, and offers.
          </p>
        </div>

        <Link
          href="/dashboard/matches"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          Find Jobs in Matches
        </Link>
      </header>

      {/* Guide / Explainer Banner */}
      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-blue-50/20 p-5 text-xs text-zinc-600 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[#102e67]">
          <HelpCircle className="h-4 w-4 text-primary" />
          How do applications enter this tracker?
        </div>
        <p className="mt-1 leading-relaxed">
          1. Go to <strong>Job Matches</strong> and select a vacancy. 2. Tailor your résumé in{" "}
          <strong>Application Documents</strong>. 3. Click the employer&apos;s official portal link
          to submit your application. 4. Click &ldquo;Add to tracker&rdquo; from the document editor
          to track your progress and interview calls here.
        </p>
      </section>

      {/* Pipeline Summary Metrics Bar */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-zinc-600">Total Tracked</span>
          <div className="mt-2 text-2xl font-extrabold text-[#102e67]">{items.length}</div>
          <p className="mt-0.5 text-[11px] text-zinc-600">Across all stages</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-blue-700">Active Pipeline</span>
          <div className="mt-2 text-2xl font-extrabold text-blue-700">{activeCount}</div>
          <p className="mt-0.5 text-[11px] text-zinc-600">Submitted & in review</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-emerald-700">Interviews</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{interviewCount}</div>
          <p className="mt-0.5 text-[11px] text-zinc-600">Invitations received</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-amber-700">Offers</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-700">{offerCount}</div>
          <p className="mt-0.5 text-[11px] text-zinc-600">Job offers secured</p>
        </div>
      </section>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={reload}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-bold text-red-900"
          >
            Reload
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2" aria-label="Filter applications by stage">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            filter === "all"
              ? "bg-[#102e67] text-white shadow-xs"
              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          All Applications ({items.length})
        </button>
        {stages.map((stage) => {
          const count = items.filter((i) => i.stage === stage.value).length;
          const active = filter === stage.value;
          return (
            <button
              type="button"
              key={stage.value}
              onClick={() => setFilter(stage.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-[#102e67] text-white shadow-xs"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {stage.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center gap-3 py-8 text-sm text-zinc-600">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading tracked applications…
        </div>
      ) : !visible.length ? (
        <section className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            {items.length ? "No applications match this filter" : "No applications tracked yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-600">
            {items.length
              ? 'Try selecting "All Applications" above to see your full pipeline.'
              : "Start by choosing a vacancy from Job Matches, tailor your application documents, and add it to this tracker."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/matches"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              Explore Job Matches
            </Link>
            <Link
              href="/dashboard/documents"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Application Documents
            </Link>
          </div>
        </section>
      ) : (
        <ul className="space-y-4">
          {visible.map((item) => {
            const stageConfig = stages.find((s) => s.value === item.stage);
            const isBusy = busy === item.id;

            return (
              <li
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                      {item.company || "Employer Not Disclosed"}
                    </span>
                    <h2 className="text-lg font-bold text-zinc-900 sm:text-xl">{item.jobTitle}</h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <span>
                        Status reported by you · Updated{" "}
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                        stageConfig?.color || "bg-zinc-100 text-zinc-800 border-zinc-200"
                      }`}
                    >
                      {stageConfig?.label || item.stage}
                    </span>

                    {item.destinationUrl && (
                      <a
                        href={item.destinationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-primary"
                      >
                        Official Page <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Status selector & Notes Section */}
                <div className="mt-5 grid gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-[minmax(0,1fr)_240px]">
                  <div>
                    {item.note ? (
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-xs leading-relaxed text-zinc-700">
                        <span className="font-semibold text-zinc-900">Private note: </span>
                        {item.note}
                      </div>
                    ) : (
                      <p className="text-xs italic text-zinc-600">
                        No private notes added for this application yet.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Update Stage:
                      <select
                        value={item.stage}
                        disabled={isBusy}
                        onChange={(event) => {
                          const next = event.target.value as TrackedApplication["stage"];
                          setEditing(item.id);
                          setNote(item.note || "");
                          void update(item, next);
                        }}
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      >
                        {stages.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setEditing(editing === item.id ? null : item.id);
                          setNote(item.note || "");
                        }}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        {editing === item.id ? "Close Notes" : "Edit Notes"}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void remove(item)}
                        className="rounded-xl border border-red-200 bg-white px-2.5 py-1.5 text-center text-xs font-semibold text-red-600 hover:bg-red-50"
                        title="Remove from tracker"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes Editor Accordion */}
                {editing === item.id && (
                  <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <label className="block text-xs font-semibold text-zinc-800">
                      Private Application Note:
                      <textarea
                        rows={3}
                        maxLength={4000}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="e.g., Interview round 1 scheduled for next Tuesday at 2 PM. Emphasize experience with NestJS and PostgreSQL."
                      />
                    </label>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setEditing(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void update(item, item.stage)}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isBusy ? "Saving…" : "Save Note"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

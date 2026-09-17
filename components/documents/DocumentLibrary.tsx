"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useSession } from "@/lib/auth-context";
import {
  createDocumentPack,
  DocumentContext,
  DocumentRequestError,
  listDocumentPacks,
  loadDocumentContext,
  PackSummary,
} from "@/lib/application-documents";

const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50";

export function DocumentLibrary({ jobRef }: { jobRef?: string }) {
  const { status, data } = useSession();
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
            href="/login?callbackUrl=%2Fdashboard%2Fdocuments"
          >
            Sign in
          </Link>{" "}
          to prepare application documents.
        </p>
      </main>
    );
  }
  return (
    <Library key={JSON.stringify([data?.user.id, data?.user.email, jobRef])} jobRef={jobRef} />
  );
}

function Library({ jobRef }: { jobRef?: string }) {
  const router = useRouter();
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [context, setContext] = useState<DocumentContext | null>(null);
  const [error, setError] = useState("");
  const [contextError, setContextError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const pendingRequest = useRef<{ id: string; jobRef: string; profileVersion: number } | null>(
    null,
  );
  const mutation = useRef<AbortController | null>(null);

  useEffect(() => () => mutation.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setContextError("");
    setContext(null);

    const tasks: Promise<unknown>[] = [
      listDocumentPacks(controller.signal)
        .then((value) => {
          if (!controller.signal.aborted) setPacks(value);
        })
        .catch((cause: unknown) => {
          if (!controller.signal.aborted)
            setError(cause instanceof Error ? cause.message : "Could not load documents.");
        }),
    ];

    if (jobRef) {
      tasks.push(
        loadDocumentContext(jobRef, controller.signal)
          .then((value) => {
            if (!controller.signal.aborted) setContext(value);
          })
          .catch((cause: unknown) => {
            if (!controller.signal.aborted)
              setContextError(
                cause instanceof Error ? cause.message : "Could not load this vacancy.",
              );
          }),
      );
    }

    Promise.allSettled(tasks).then(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [jobRef, reload]);

  async function create() {
    if (!context?.profile?.confirmed || mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller;
    setBusy(true);
    setContextError("");

    try {
      pendingRequest.current ||= {
        id: crypto.randomUUID(),
        jobRef: context.job.ref,
        profileVersion: context.profile.version,
      };
      const pending = pendingRequest.current;
      const pack = await createDocumentPack(
        pending.jobRef,
        pending.profileVersion,
        pending.id,
        controller.signal,
      );
      if (!controller.signal.aborted) router.push(`/dashboard/documents/${pack.id}`);
    } catch (cause) {
      if (!controller.signal.aborted) {
        if (
          cause instanceof DocumentRequestError &&
          !cause.unknownOutcome &&
          cause.status >= 400 &&
          cause.status < 500
        ) {
          pendingRequest.current = null;
        }
        setContextError(
          cause instanceof DocumentRequestError && cause.unknownOutcome
            ? "We could not confirm whether the draft was created. Retry Create document pack to recover the same request, or check the document list before starting another."
            : cause instanceof Error
              ? cause.message
              : "Could not create a draft.",
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        mutation.current = null;
      }
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800">
            <FileText className="h-3.5 w-3.5" />
            Application Intelligence
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#102e67] sm:text-4xl">
            Application Documents
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Create job-tailored résumés and cover letters customized for specific vacancies in
            Nepal, grounded purely in your verified career profile.
          </p>
        </div>

        <Link
          href="/dashboard/matches"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          Choose Job from Matches
        </Link>
      </header>

      {/* Explainer / Guided 3-Step Banner */}
      <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 p-6 shadow-xs sm:p-7">
        <div className="flex items-center gap-2 text-sm font-bold text-[#102e67]">
          <HelpCircle className="h-4 w-4 text-primary" />
          How do Application Documents work?
        </div>
        <p className="mt-1 text-xs text-zinc-600">
          Employers in Nepal scan hundreds of generic CVs. KamKhoj reorders your real experience to
          highlight the exact skills each employer seeks.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs">
                1
              </span>
              Career Profile
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              Confirm your skills and experience facts in{" "}
              <Link href="/dashboard/profile" className="font-semibold text-primary underline">
                Career Profile
              </Link>
              . No fake claims are ever generated.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs">
                2
              </span>
              Job Requirements
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              Select a job from{" "}
              <Link href="/dashboard/matches" className="font-semibold text-primary underline">
                Job Matches
              </Link>
              . We inspect destination requirements and align matching keywords.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs">
                3
              </span>
              Review & Export
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              Review and edit your tailored résumé and cover letter, then download an ATS-compliant
              printable PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Prepare Draft Form (When jobRef is provided) */}
      {jobRef && (
        <section
          className="space-y-5 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm ring-2 ring-blue-600/10"
          aria-labelledby="new-document-heading"
        >
          <div className="flex items-center justify-between">
            <h2 id="new-document-heading" className="text-xl font-bold text-[#102e67]">
              Prepare Tailored Documents for Vacancy
            </h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              Active Selection
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-4 text-sm text-zinc-600">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading vacancy requirements and your career profile…
            </div>
          ) : context ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <h3 className="text-lg font-bold text-zinc-900">{context.job.title}</h3>
                <p className="text-sm text-zinc-600">
                  {[context.job.company, context.job.location].filter(Boolean).join(" · ")}
                </p>
              </div>

              {/* Destination inspection capability */}
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs">
                <div className="flex items-center justify-between font-semibold text-zinc-900">
                  <span>
                    Application Mode:{" "}
                    <strong className="uppercase text-primary">
                      {context.capability.mode.replace(/_/g, " ")}
                    </strong>
                  </span>
                  {context.capability.destinationUrl && (
                    <a
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      href={context.capability.destinationUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Official destination link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="mt-1 text-zinc-600">
                  {context.capability.notes ||
                    "Destination inspected. You will review documents here before applying on the official portal."}
                </p>
                {context.capability.requiredFields.length > 0 && (
                  <p className="mt-2 text-zinc-700">
                    <strong>Inspected Requirements:</strong>{" "}
                    {context.capability.requiredFields
                      .filter((f) => f.required)
                      .map((f) => f.label)
                      .join(", ")}
                  </p>
                )}
              </div>

              {/* Profile state */}
              {context.profile?.confirmed ? (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-semibold text-emerald-900">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    Profile Confirmed: {context.profile.fullName} (Version {context.profile.version}
                    )
                  </div>
                  <p className="text-zinc-600">
                    {context.profile.aiSettings.tailorResume
                      ? "Priority will be given to relevant skills matching this job description."
                      : "Standard chronological ordering will be preserved."}{" "}
                    {context.profile.aiSettings.coverLetter
                      ? "A job-specific cover letter draft is included."
                      : "Cover letter is disabled in your profile preferences."}
                  </p>
                  <p className="text-zinc-500">
                    Drafting preserves your confirmed wording. No surprise credits charged.
                    Generating documents does not automatically submit an application.
                  </p>
                  <button
                    type="button"
                    onClick={() => void create()}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Drafting Tailored Pack…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Create Tailored Document Pack
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <p className="font-semibold">Your Career Profile needs confirmation.</p>
                  <p className="mt-1">
                    To maintain strict accuracy and avoid AI hallucinations, please confirm your
                    career facts first.
                  </p>
                  <Link
                    className="mt-3 inline-flex items-center gap-1 font-bold text-amber-950 underline"
                    href="/dashboard/profile"
                  >
                    Review & Confirm Career Profile <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          ) : null}

          {contextError && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {contextError}
            </p>
          )}

          {!loading && (
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() => setReload((value) => value + 1)}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reload Vacancy & Profile
            </button>
          )}
        </section>
      )}

      {/* Saved Document Packs Section */}
      <section aria-labelledby="saved-documents-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="saved-documents-heading" className="text-2xl font-bold text-[#102e67]">
            Your Saved Document Packs
          </h2>
          <span className="text-xs font-medium text-zinc-500">
            {packs.length} {packs.length === 1 ? "pack" : "packs"}
          </span>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <p>{error}</p>
            <button
              type="button"
              className={`${button} mt-3`}
              disabled={busy}
              onClick={() => setReload((value) => value + 1)}
            >
              Retry loading
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-6 text-sm text-zinc-600">
            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading documents…
          </div>
        ) : !error && !packs.length ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-zinc-900">No document packs created yet</h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-600">
              When you find a vacancy that matches your background, click &ldquo;Prepare
              documents&rdquo; on that job. KamKhoj will generate a tailored ATS résumé and
              customized cover letter ready for you to review and print.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/matches"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" />
                Find a Job in Matches
              </Link>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Review Career Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {packs.map((pack) => {
              const isReviewed = !!pack.reviewedAt;
              const isStale = !pack.profileCurrent;

              return (
                <div
                  key={pack.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                          {pack.company || "Employer Not Disclosed"}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900 line-clamp-1">
                          {pack.title}
                        </h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isStale
                            ? "bg-blue-100 text-blue-800"
                            : isReviewed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isStale ? (
                          "Profile Updated"
                        ) : isReviewed ? (
                          <>
                            <FileCheck className="h-3 w-3" /> Ready to Apply
                          </>
                        ) : (
                          "Draft — In Review"
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600">
                      Document v{pack.version} · Grounded in Profile v{pack.profileVersion}
                    </div>

                    <p className="text-xs text-zinc-600">
                      {isStale
                        ? "Your profile has changed since this draft was made. Open editor to review updates."
                        : isReviewed
                          ? "You have reviewed this tailored pack. Open to export printable PDF or send."
                          : "Draft created. Open the editor to customize bullets and review facts."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <Link
                      href={`/dashboard/documents/${pack.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      Open Document Editor <ArrowRight className="h-3 w-3" />
                    </Link>

                    <Link
                      href="/dashboard/applications"
                      className="text-xs text-zinc-600 hover:text-zinc-700"
                    >
                      View in Tracker
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

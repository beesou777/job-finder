'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/auth-context';
import { createApplication } from '@/lib/applications';
import {
  deleteDocumentPack,
  DocumentContent,
  DocumentHistory,
  documentHistory,
  DocumentPack,
  DocumentRequestError,
  DocumentRevision,
  downloadBlob,
  exportDocument,
  loadDocumentPack,
  loadDocumentRevision,
  reviewDocumentPack,
  saveDocumentPack,
} from '@/lib/application-documents';
import { DocumentChanges } from './DocumentChanges';
import { CvJobFeedback } from './CvJobFeedback';
import { ResumeTemplates } from './ResumeTemplates';
import { CvLayoutWorkspace } from './CvLayoutWorkspace';

const button =
  'inline-flex items-center justify-center rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export function DocumentEditor({ id }: { id: string }) {
  const { status, data } = useSession();
  if (status === 'loading') return <p role="status" className="p-8">Loading your workspace…</p>;
  if (status !== 'authenticated') {
    return (
      <p className="p-8">
        <Link className="underline" href={`/login?callbackUrl=${encodeURIComponent(`/dashboard/documents/${id}`)}`}>
          Sign in
        </Link>{' '}
        to open your documents.
      </p>
    );
  }
  return <Editor key={JSON.stringify([data?.user.id, data?.user.email, id])} id={id} />;
}

function Editor({ id }: { id: string }) {
  const router = useRouter();
  const [pack, setPack] = useState<DocumentPack | null>(null);
  const [content, setContent] = useState<DocumentContent>({ resume: '', coverLetter: '' });
  const [step, setStep] = useState(0);
  const [tailored, setTailored] = useState(false);
  const [kind, setKind] = useState<keyof DocumentContent>('resume');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tracking, setTracking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [history, setHistory] = useState<DocumentHistory | null>(null);
  const [previous, setPrevious] = useState<DocumentRevision | null>(null);
  const action = useRef<AbortController | null>(null);

  const dirty =
    !!pack &&
    (content.resume !== pack.content.resume || content.coverLetter !== pack.content.coverLetter);

  useEffect(() => () => action.current?.abort(), []);

  function receive(value: DocumentPack) {
    setPack(value);
    setContent(value.content);
    setConfirmed(false);
    setHistory(null);
    setPrevious(null);
  }

  async function trackApplication() {
    if (!pack || tracking || dirty || !pack.reviewValid) return;
    setTracking(true);
    setError('');
    try {
      await createApplication({
        jobRef: pack.job.ref,
        jobTitle: pack.job.title,
        company: pack.job.company || null,
        destinationUrl: pack.job.applyUrl,
        documentPackId: pack.id,
        documentVersion: pack.version,
      });
      setNotice(
        'This application is now in your tracker. Open the official page, submit there, then update the tracker when you are done.'
      );
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Could not add this application to your tracker.');
    } finally {
      setTracking(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    loadDocumentPack(id, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) {
          receive(value);
          setBlocked(false);
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not load this document.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, reloadKey]);

  useEffect(() => {
    if (!dirty) return;
    const exit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        !(event.target instanceof Element)
      )
        return;
      const anchor = event.target.closest('a');
      if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank') return;
      if (!window.confirm('Leave this page and discard unsaved document edits?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', exit);
    document.addEventListener('click', navigate, true);
    return () => {
      window.removeEventListener('beforeunload', exit);
      document.removeEventListener('click', navigate, true);
    };
  }, [dirty]);

  async function perform(work: (signal: AbortSignal) => Promise<void>, mutation = false) {
    if (action.current) return;
    const controller = new AbortController();
    action.current = controller;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work(controller.signal);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Could not complete this action.');
        if (cause instanceof DocumentRequestError && (cause.status === 409 || (mutation && cause.unknownOutcome))) {
          setBlocked(true);
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false);
        action.current = null;
      }
    }
  }

  function reload() {
    if (busy || (dirty && !window.confirm('Discard unsaved changes and reload the latest saved document?'))) return;
    setNotice('');
    setReloadKey((value) => value + 1);
  }

  function localCopy() {
    downloadBlob(
      new Blob([content[kind]], { type: 'text/plain;charset=utf-8' }),
      `kamkhoj-unsaved-${kind === 'resume' ? 'resume' : 'cover-letter'}.txt`
    );
    setNotice('Your current text has been downloaded. This does not save it to your account.');
  }

  function download(format: 'txt' | 'html') {
    if (!pack || dirty || blocked) return;
    void perform(async (signal) => {
      const file = await exportDocument(pack.id, pack.version, kind, format, signal);
      if (!signal.aborted) {
        downloadBlob(file, `kamkhoj-${kind === 'resume' ? 'resume' : 'cover-letter'}-v${pack.version}.${format}`);
        setNotice(
          format === 'html'
            ? 'Downloaded a printable document. Open the HTML file, then choose Print → Save as PDF.'
            : 'Downloaded the saved document.'
        );
      }
    });
  }

  function save() {
    if (!pack || !dirty || blocked) return;
    void perform(async (signal) => {
      const value = await saveDocumentPack(pack.id, pack.version, content, signal);
      if (!signal.aborted) {
        receive(value);
        setNotice(`Document version ${value.version} saved. Review this version before using it.`);
      }
    }, true);
  }

  function review() {
    if (!pack || dirty || blocked || !confirmed || !pack.profileCurrent || !pack.jobCurrent) return;
    void perform(async (signal) => {
      const value = await reviewDocumentPack(pack.id, pack.version, signal);
      if (!signal.aborted) {
        receive(value);
        setNotice('Review recorded for this version. No application has been submitted.');
      }
    }, true);
  }

  function remove() {
    if (!pack || !window.confirm('Permanently delete this document pack and all its saved revisions? Your career profile is kept.'))
      return;
    void perform(async (signal) => {
      await deleteDocumentPack(pack.id, signal);
      if (!signal.aborted) {
        setPack(null);
        router.replace('/dashboard/documents');
      }
    }, true);
  }

  if (loading) return <p role="status" className="p-8">Loading your document pack…</p>;
  if (!pack) {
    return (
      <main className="space-y-4 p-8">
        <p role="alert">{error || 'This document is unavailable.'}</p>
        <button type="button" className={button} onClick={reload}>Retry</button>
        <Link className={`${button} ml-3`} href="/dashboard/documents">All documents</Link>
      </main>
    );
  }

  const reviewed = pack.reviewValid && !dirty;
  const changed = !pack.profileCurrent || !pack.jobCurrent || !pack.capabilityCurrent;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-foreground sm:px-8">
      {step === 1 && <CvJobFeedback job={pack.job} resume={content.resume} />}

      <Link className="text-sm font-semibold underline" href="/dashboard/documents">← All documents</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Review your application documents</h1>
          <p className="mt-2 text-lg">{pack.job.title}{pack.job.company ? ` · ${pack.job.company}` : ''}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Profile version {pack.profileVersion} · Document version {pack.version} ·{' '}
            {dirty ? 'Unsaved edits' : reviewed ? 'Reviewed' : 'Draft'}
          </p>
        </div>
        <button className={button} type="button" disabled={busy} onClick={reload}>
          Reload saved version
        </button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-destructive p-4">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-border bg-card p-4">{notice}</p>}
      {blocked && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p>Keep a copy of your unsaved text, then reload the latest version before continuing.</p>
          <button type="button" className={`${button} mt-3`} onClick={localCopy}>Download current text</button>
        </div>
      )}
      {changed && (
        <div className="space-y-2 rounded-lg border border-border bg-secondary p-4">
          <p>
            {!pack.profileCurrent ? 'Your career profile changed after this draft was created.' : pack.jobStatus}{' '}
            This saved pack is retained for reference; it cannot receive a current review.
          </p>
          <Link className="font-semibold underline" href={`/dashboard/documents?jobRef=${encodeURIComponent(pack.job.ref)}`}>
            Create a fresh pack
          </Link>
        </div>
      )}

      <nav aria-label="Document progress" className="flex flex-wrap gap-3 text-sm">
        {['Choose approach', 'Suggestions', 'CV Workspace', 'Layout', 'Review', 'Download'].map((label, index) =>
          !tailored && index === 1 ? null : (
            <span
              key={label}
              aria-current={step === index ? 'step' : undefined}
              className={step === index ? 'font-bold text-primary' : 'text-muted-foreground'}
            >
              {label}
            </span>
          )
        )}
      </nav>

      {step === 0 && (
        <section className="rounded-xl border bg-card p-6">
          <h2 className="text-2xl font-bold">How would you like to prepare your CV?</h2>
          <p className="mt-2 text-muted-foreground">
            Use this saved draft or customize with Gemini AI in the next step.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              className={button + ' flex-col items-start gap-2 p-6 text-left'}
              onClick={() => {
                setTailored(false);
                setStep(2);
              }}
            >
              <span className="text-lg font-bold">Use my CV</span>
              <span className="font-normal text-muted-foreground">Keep your wording, edit if needed, then choose a layout.</span>
            </button>
            <button
              type="button"
              className={button + ' flex-col items-start gap-2 p-6 text-left'}
              onClick={() => {
                setTailored(true);
                setStep(1);
              }}
            >
              <span className="text-lg font-bold">Tailor for this job</span>
              <span className="font-normal text-muted-foreground">Review suggestions, then optimize 100% to this job with AI.</span>
            </button>
          </div>
        </section>
      )}

      {/* Step 3 & Step 5: ResumeTemplates */}
      <div hidden={step !== 3 && step !== 5}>
        <ResumeTemplates
          resume={content.resume}
          coverLetter={content.coverLetter}
          disabled={!reviewed || busy || blocked}
          selectionOnly={step === 3}
        />
      </div>

      {/* Step 2: Interactive CV Layout Workspace */}
      <div className="space-y-6">
        <div hidden={step !== 2} className="min-w-0">
          <CvLayoutWorkspace
            pack={pack}
            content={content}
            setContent={(newContent) => {
              setContent(newContent);
              setConfirmed(false);
              setNotice('');
            }}
            dirty={dirty}
            busy={busy}
            blocked={blocked}
            previousContent={previous?.content}
            onSave={save}
            onLocalCopy={localCopy}
          />

          {previous && (
            <section className="mt-4 space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
              <h3 className="font-semibold">Saved version {previous.version}</h3>
              <p className="text-xs text-muted-foreground">
                This is historical content. Changing tabs in editor shows its other document.
              </p>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6">
                {previous.content[kind] || 'No content in this version.'}
              </pre>
              <button
                type="button"
                className={button}
                disabled={busy || blocked}
                onClick={() => {
                  if (dirty && !window.confirm('Replace your unsaved edits with both documents from this historical version?')) return;
                  setContent({ ...previous.content });
                  setConfirmed(false);
                  setNotice(`Version ${previous.version} copied into the editor. Save changes to create a new revision; history is preserved.`);
                }}
              >
                Restore both documents into editor
              </button>
              <button type="button" className={`${button} ml-2`} onClick={() => setPrevious(null)}>
                Close historical view
              </button>
            </section>
          )}
        </div>

        {/* Step 4: Review Checklist & Verification */}
        <aside hidden={step !== 4} className="space-y-5">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Review this version</h2>
            <p className="text-sm leading-6">
              Check your name, contact details, dates, qualifications and employer. Review covers both documents in this pack.
            </p>
            {dirty && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                <strong>Unsaved edits:</strong> Click &ldquo;Save changes&rdquo; before confirming review.
              </div>
            )}
            {changed && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
                <strong>Profile updated:</strong> Your career profile facts changed after this draft was generated.
              </div>
            )}
            {reviewed && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                <span className="font-bold text-emerald-700">✓</span>
                <span>This version is already reviewed and confirmed accurate.</span>
              </div>
            )}
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                checked={confirmed || reviewed}
                disabled={busy || dirty || blocked || changed || reviewed}
                onChange={(event) => setConfirmed(event.target.checked)}
              />
              <span className={reviewed ? 'font-medium text-emerald-900 dark:text-emerald-200' : ''}>
                I have reviewed the documents and confirm that their claims are accurate.
              </span>
            </label>
            <button
              type="button"
              disabled={busy || dirty || blocked || changed || reviewed || !confirmed}
              onClick={review}
              className={`${button} w-full ${reviewed ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold dark:bg-emerald-950/50 dark:text-emerald-200' : ''}`}
            >
              {reviewed ? '✓ Review recorded' : 'Mark as reviewed'}
            </button>
            <p className="text-xs leading-5 text-muted-foreground">
              Reviewing does not submit an application or authorize spending.
            </p>
            {reviewed && (
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold text-foreground">Ready for the official application</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Open the employer&apos;s official portal, submit your application there, and track it here.
                </p>
                <button
                  type="button"
                  disabled={tracking}
                  onClick={() => void trackApplication()}
                  className={`${button} mt-3 w-full bg-accent text-accent-foreground`}
                >
                  {tracking ? 'Adding to tracker…' : 'Add to application tracker'}
                </button>
                <Link
                  href="/dashboard/applications"
                  className="mt-3 block text-center text-sm font-semibold text-accent underline"
                >
                  View application tracker
                </Link>
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">How this was prepared</h2>
            <p className="text-sm">
              {pack.evidence.matchedSkills.length
                ? `Skill mentions: ${pack.evidence.matchedSkills.join(', ')}`
                : 'No exact skill overlap found.'}
            </p>
            <ul className="list-disc space-y-2 pl-4 text-sm leading-6 text-muted-foreground">
              {pack.evidence.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            {pack.origin === 'user-edit' && (
              <p className="text-sm">
                This version contains your edits and tailored content.
              </p>
            )}
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Saved revisions</h2>
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() =>
                void perform(async (signal) => {
                  const value = await documentHistory(pack.id, signal);
                  if (!signal.aborted) setHistory(value);
                })
              }
            >
              Show history
            </button>
            {history && (
              <ol className="max-h-80 space-y-2 overflow-auto text-sm">
                {history.map((revision) => (
                  <li key={revision.version}>
                    <button
                      type="button"
                      disabled={busy}
                      className="text-left underline underline-offset-4"
                      onClick={() =>
                        void perform(async (signal) => {
                          const value = await loadDocumentRevision(pack.id, revision.version, signal);
                          if (!signal.aborted) setPrevious(value);
                        })
                      }
                    >
                      Version {revision.version} · {revision.origin === 'template-v1' ? 'Initial draft' : 'Edited'} ·{' '}
                      {new Date(revision.createdAt).toLocaleDateString()}
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <button type="button" className={`${button} text-destructive`} disabled={busy} onClick={remove}>
              Delete pack
            </button>
          </section>
        </aside>
      </div>

      {step > 0 && (
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
          <button
            type="button"
            className={button}
            disabled={busy || tracking}
            onClick={() => setStep(step === 2 && !tailored ? 0 : step - 1)}
          >
            Back
          </button>
          {step === 2 && dirty && <p className="text-sm text-amber-600 dark:text-amber-400">Save changes before continuing.</p>}
          {step === 4 && !reviewed && (
            <p className="text-sm text-muted-foreground">Confirm accuracy and mark this saved version as reviewed to continue.</p>
          )}
          {step < 5 && (
            <button
              type="button"
              className={button}
              disabled={busy || tracking || blocked || (step === 2 && dirty) || (step === 4 && !reviewed)}
              onClick={() => setStep(step + 1)}
            >
              Next: {['', 'edit your CV', 'choose a layout', 'review', 'download'][step]}
            </button>
          )}
          {step === 5 && (
            <Link className={button} href="/dashboard/applications">
              Open application tracker
            </Link>
          )}
        </footer>
      )}
    </main>
  );
}

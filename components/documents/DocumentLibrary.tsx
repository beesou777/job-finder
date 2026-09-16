'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/auth-context';
import { createDocumentPack, DocumentContext, DocumentRequestError, listDocumentPacks, loadDocumentContext, PackSummary } from '@/lib/application-documents';

const button = 'inline-flex items-center justify-center rounded-lg border border-input px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';
export function DocumentLibrary({ jobRef }: { jobRef?: string }) {
  const { status, data } = useSession();
  if (status === 'loading') return <p className="p-8" role="status">Loading your workspace…</p>;
  if (status !== 'authenticated') return <p className="p-8"><Link className="underline" href="/login?callbackUrl=%2Fdashboard%2Fdocuments">Sign in</Link> to prepare application documents.</p>;
  return <Library key={JSON.stringify([data?.user.id, data?.user.email, jobRef])} jobRef={jobRef} />;
}
function Library({ jobRef }: { jobRef?: string }) {
  const router = useRouter();
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [context, setContext] = useState<DocumentContext | null>(null);
  const [error, setError] = useState('');
  const [contextError, setContextError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const pendingRequest = useRef<{ id: string; jobRef: string; profileVersion: number } | null>(null);
  const mutation = useRef<AbortController | null>(null);
  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setContextError(''); setContext(null);
    const tasks: Promise<unknown>[] = [listDocumentPacks(controller.signal).then((value) => { if (!controller.signal.aborted) setPacks(value); }).catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not load documents.'); })];
    if (jobRef) tasks.push(loadDocumentContext(jobRef, controller.signal).then((value) => { if (!controller.signal.aborted) setContext(value); }).catch((cause: unknown) => { if (!controller.signal.aborted) setContextError(cause instanceof Error ? cause.message : 'Could not load this vacancy.'); }));
    Promise.allSettled(tasks).then(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [jobRef, reload]);
  async function create() {
    if (!context?.profile?.confirmed || mutation.current) return;
    const controller = new AbortController(); mutation.current = controller;
    setBusy(true); setContextError('');
    // Keep the same key after a timeout so a retry opens the already-created pack.
    try {
      pendingRequest.current ||= { id: crypto.randomUUID(), jobRef: context.job.ref, profileVersion: context.profile.version };
      const pending = pendingRequest.current;
      const pack = await createDocumentPack(pending.jobRef, pending.profileVersion, pending.id, controller.signal);
      if (!controller.signal.aborted) router.push(`/dashboard/documents/${pack.id}`);
    } catch (cause) {
      if (!controller.signal.aborted) {
        if (cause instanceof DocumentRequestError && !cause.unknownOutcome && cause.status >= 400 && cause.status < 500) pendingRequest.current = null;
        setContextError(cause instanceof DocumentRequestError && cause.unknownOutcome ? 'We could not confirm whether the draft was created. Retry Create document pack to recover the same request, or check the document list before starting another.' : cause instanceof Error ? cause.message : 'Could not create a draft.');
      }
    }
    finally { if (!controller.signal.aborted) { setBusy(false); mutation.current = null; } }
  }
  return <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-foreground sm:px-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Application documents</h1><p className="mt-2 max-w-2xl text-muted-foreground">Turn your confirmed career profile into a résumé and cover letter for a specific job. Review and edit before downloading.</p></div><Link href="/dashboard/matches" className={button}>Choose a job</Link></header>
    {jobRef && <section className="space-y-4 rounded-xl border border-border bg-card p-6" aria-labelledby="new-document-heading">
      <h2 id="new-document-heading" className="text-xl font-bold">Prepare a new draft</h2>
      {loading ? <p role="status">Loading the job and your profile…</p> : context && <>
        <div><h3 className="text-lg font-semibold">{context.job.title}</h3><p className="text-muted-foreground">{[context.job.company, context.job.location].filter(Boolean).join(' · ')}</p></div>
        <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm"><p className="font-semibold">Application path: {context.capability.mode === 'assisted_review' ? 'assisted review' : context.capability.mode === 'manual_handoff' ? 'manual handoff' : context.capability.mode}</p><p className="mt-1 text-muted-foreground">{context.capability.notes || 'The destination still needs a user-controlled handoff.'}</p><p className="mt-2">Required fields: {context.capability.requiredFields.filter((field) => field.required).map((field) => field.label).join(', ') || 'not inspected'}</p>{context.capability.destinationUrl && <a className="mt-2 inline-block underline" href={context.capability.destinationUrl} target="_blank" rel="noreferrer">Open official application page</a>}<p className="mt-2 text-muted-foreground">{context.capability.service.message}</p></div>
        {context.profile?.confirmed ? <>
          <p>Using {context.profile.fullName}&apos;s confirmed profile, version {context.profile.version}.</p>
          <p className="text-sm text-muted-foreground">{context.profile.aiSettings.tailorResume ? 'Relevant skills and projects will be prioritized.' : 'Your original profile order will be preserved.'} {context.profile.aiSettings.coverLetter ? 'A cover-letter draft is included.' : 'Cover-letter generation is off in your profile settings.'}</p>
          <p className="text-sm text-muted-foreground">Drafting preserves your profile wording. No credits are charged. Saving or reviewing documents does not submit an application.</p>
          <button type="button" onClick={() => void create()} disabled={busy} className={`${button} bg-accent text-accent-foreground`}>{busy ? 'Preparing draft…' : 'Create document pack'}</button>
        </> : <p>First <Link className="font-semibold underline" href="/dashboard/profile">review and confirm your career profile</Link>, then return here to prepare this application.</p>}
      </>}
      {contextError && <p role="alert" className="text-sm text-destructive">{contextError}</p>}
      {!loading && <button type="button" className={button} disabled={busy} onClick={() => setReload((value) => value + 1)}>Reload profile and job</button>}
    </section>}
    <section aria-labelledby="saved-documents-heading"><h2 id="saved-documents-heading" className="mb-4 text-xl font-bold">Your document packs</h2>
      {error && <div className="mb-4 space-y-3"><p role="alert">{error}</p><button type="button" className={button} disabled={busy} onClick={() => setReload((value) => value + 1)}>Retry loading</button></div>}
      {loading ? <p role="status">Loading documents…</p> : !error && !packs.length ? <div className="rounded-xl border border-dashed border-border p-8"><p>No document packs yet.</p><p className="mt-2 text-sm text-muted-foreground">Open a job in Matches and choose “Prepare documents”.</p></div> : <ul className="divide-y divide-border rounded-xl border border-border bg-card">{packs.map((pack) => <li key={pack.id}><Link href={`/dashboard/documents/${pack.id}`} className="block space-y-1 p-5 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"><h3 className="font-semibold">{pack.title}</h3><p className="text-sm text-muted-foreground">{pack.company || 'Employer not listed'} · Document version {pack.version} · Profile version {pack.profileVersion}</p><p className="text-sm">{!pack.profileCurrent ? 'Profile changed — create a new draft' : pack.reviewedAt ? 'Review recorded — open to check current status' : 'Draft — awaiting review'}</p></Link></li>)}</ul>}
    </section>
  </main>;
}

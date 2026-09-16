'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/auth-context';
import { deleteDocumentPack, DocumentContent, DocumentHistory, documentHistory, DocumentPack, DocumentRequestError, DocumentRevision, downloadBlob, exportDocument, loadDocumentPack, loadDocumentRevision, reviewDocumentPack, saveDocumentPack } from '@/lib/application-documents';
import { DocumentChanges } from './DocumentChanges';

const button = 'inline-flex items-center justify-center rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
export function DocumentEditor({ id }: { id: string }) {
  const { status, data } = useSession();
  if (status === 'loading') return <p role="status" className="p-8">Loading your workspace…</p>;
  if (status !== 'authenticated') return <p className="p-8"><Link className="underline" href={`/login?callbackUrl=${encodeURIComponent(`/dashboard/documents/${id}`)}`}>Sign in</Link> to open your documents.</p>;
  return <Editor key={JSON.stringify([data?.user.id, data?.user.email, id])} id={id} />;
}
function Editor({ id }: { id: string }) {
  const router = useRouter();
  const [pack, setPack] = useState<DocumentPack | null>(null);
  const [content, setContent] = useState<DocumentContent>({ resume: '', coverLetter: '' });
  const [kind, setKind] = useState<keyof DocumentContent>('resume');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [history, setHistory] = useState<DocumentHistory | null>(null);
  const [previous, setPrevious] = useState<DocumentRevision | null>(null);
  const action = useRef<AbortController | null>(null);
  const dirty = !!pack && (content.resume !== pack.content.resume || content.coverLetter !== pack.content.coverLetter);
  useEffect(() => () => action.current?.abort(), []);
  function receive(value: DocumentPack) { setPack(value); setContent(value.content); setConfirmed(false); setHistory(null); setPrevious(null); }
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    loadDocumentPack(id, controller.signal).then((value) => {
      if (!controller.signal.aborted) { receive(value); setBlocked(false); }
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not load this document.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, reloadKey]);
  useEffect(() => {
    if (!dirty) return;
    const exit = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || !(event.target instanceof Element)) return;
      const anchor = event.target.closest('a');
      if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank') return;
      if (!window.confirm('Leave this page and discard unsaved document edits?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', exit); document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', exit); document.removeEventListener('click', navigate, true); };
  }, [dirty]);

  async function perform(work: (signal: AbortSignal) => Promise<void>, mutation = false) {
    if (action.current) return;
    const controller = new AbortController(); action.current = controller;
    setBusy(true); setError(''); setNotice('');
    try { await work(controller.signal); }
    catch (cause) {
      if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : 'Could not complete this action.');
        if (cause instanceof DocumentRequestError && (cause.status === 409 || (mutation && cause.unknownOutcome))) setBlocked(true);
      }
    } finally { if (!controller.signal.aborted) { setBusy(false); action.current = null; } }
  }
  function reload() {
    if (busy || (dirty && !window.confirm('Discard unsaved changes and reload the latest saved document?'))) return;
    setNotice(''); setReloadKey((value) => value + 1);
  }
  function localCopy() {
    downloadBlob(new Blob([content[kind]], { type: 'text/plain;charset=utf-8' }), `kamkhoj-unsaved-${kind === 'resume' ? 'resume' : 'cover-letter'}.txt`);
    setNotice('Your current text has been downloaded. This does not save it to your account.');
  }
  function download(format: 'txt' | 'html') {
    if (!pack || dirty || blocked) return;
    void perform(async (signal) => {
      const file = await exportDocument(pack.id, pack.version, kind, format, signal);
      if (!signal.aborted) { downloadBlob(file, `kamkhoj-${kind === 'resume' ? 'resume' : 'cover-letter'}-v${pack.version}.${format}`); setNotice(format === 'html' ? 'Downloaded a printable document. Open the HTML file, then choose Print → Save as PDF.' : 'Downloaded the saved document.'); }
    });
  }
  function save() {
    if (!pack || !dirty || blocked) return;
    void perform(async (signal) => {
      const value = await saveDocumentPack(pack.id, pack.version, content, signal);
      if (!signal.aborted) { receive(value); setNotice(`Document version ${value.version} saved. Review this version before using it.`); }
    }, true);
  }
  function review() {
    if (!pack || dirty || blocked || !confirmed || !pack.profileCurrent || !pack.jobCurrent) return;
    void perform(async (signal) => {
      const value = await reviewDocumentPack(pack.id, pack.version, signal);
      if (!signal.aborted) { receive(value); setNotice('Review recorded for this version. No application has been submitted.'); }
    }, true);
  }
  function remove() {
    if (!pack || !window.confirm('Permanently delete this document pack and all its saved revisions? Your career profile is kept.')) return;
    void perform(async (signal) => {
      await deleteDocumentPack(pack.id, signal);
      if (!signal.aborted) { setPack(null); router.replace('/dashboard/documents'); }
    }, true);
  }
  if (loading) return <p role="status" className="p-8">Loading your document pack…</p>;
  if (!pack) return <main className="space-y-4 p-8"><p role="alert">{error || 'This document is unavailable.'}</p><button type="button" className={button} onClick={reload}>Retry</button><Link className={`${button} ml-3`} href="/dashboard/documents">All documents</Link></main>;
  const reviewed = pack.reviewValid && !dirty;
  const changed = !pack.profileCurrent || !pack.jobCurrent;
  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-foreground sm:px-8">
    <Link className="text-sm font-semibold underline" href="/dashboard/documents">← All documents</Link>
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Review your application documents</h1><p className="mt-2 text-lg">{pack.job.title}{pack.job.company ? ` · ${pack.job.company}` : ''}</p><p className="mt-2 text-sm text-muted-foreground">Profile version {pack.profileVersion} · Document version {pack.version} · {dirty ? 'Unsaved edits' : reviewed ? 'Reviewed' : 'Draft'}</p></div><button className={button} type="button" disabled={busy} onClick={reload}>Reload saved version</button></header>
    {error && <p role="alert" className="rounded-lg border border-destructive p-4">{error}</p>}
    {notice && <p role="status" className="rounded-lg border border-border bg-card p-4">{notice}</p>}
    {blocked && <div className="rounded-lg border border-border bg-card p-4"><p>Keep a copy of your unsaved text, then reload the latest version before continuing.</p><button type="button" className={`${button} mt-3`} onClick={localCopy}>Download current text</button></div>}
    {changed && <div className="space-y-2 rounded-lg border border-border bg-secondary p-4"><p>{!pack.profileCurrent ? 'Your career profile changed after this draft was created.' : pack.jobStatus} This saved pack is retained for reference; it cannot receive a current review.</p><Link className="font-semibold underline" href={`/dashboard/documents?jobRef=${encodeURIComponent(pack.job.ref)}`}>Create a fresh pack</Link></div>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
      <section className="min-w-0 space-y-5 rounded-xl border border-border bg-card p-5 sm:p-7" aria-labelledby="document-edit-heading">
        <h2 id="document-edit-heading" className="text-xl font-bold">Edit and preview</h2>
        <div role="group" aria-label="Choose a document" className="flex gap-2">{(['resume', 'coverLetter'] as const).map((value) => <button type="button" key={value} aria-pressed={kind === value} onClick={() => setKind(value)} className={`${button} ${kind === value ? 'bg-accent text-accent-foreground' : ''}`}>{value === 'resume' ? 'Résumé' : 'Cover letter'}</button>)}</div>
        <label className="block text-sm font-semibold">{kind === 'resume' ? 'Résumé text' : 'Cover-letter text'}
          <textarea rows={20} value={content[kind]} disabled={busy || blocked} maxLength={kind === 'resume' ? 600000 : 30000} onChange={(event) => { setContent({ ...content, [kind]: event.target.value }); setConfirmed(false); setNotice(''); }} className="mt-2 w-full rounded-lg border border-input bg-background p-4 text-base font-normal leading-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60" />
        </label>
        <p className="text-xs text-muted-foreground">Edits stay in this pack. To change facts used in future applications, update your career profile.</p>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy || blocked || !dirty || !content.resume.trim()} className={`${button} bg-accent text-accent-foreground`} onClick={save}>{busy ? 'Working…' : 'Save changes'}</button><button type="button" className={button} disabled={!content[kind]} onClick={localCopy}>Download current text</button></div>
        <details className="border-t border-border pt-4"><summary className="cursor-pointer font-semibold">Read document preview</summary><article lang={pack.evidence.language} className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-border bg-white p-6 text-base leading-7 text-slate-900">{content[kind] || 'No cover letter in this pack. You can write one above.'}</article></details>
        <details className="border-t border-border pt-4"><summary className="cursor-pointer font-semibold">Compare changes</summary><div className="mt-4"><DocumentChanges before={(previous?.content || pack.content)[kind]} after={content[kind]} baseline={`saved version ${previous?.version || pack.version}`} /></div></details>
        {previous && <section className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4"><h3 className="font-semibold">Saved version {previous.version}</h3><p className="text-xs text-muted-foreground">This is the historical {kind === 'resume' ? 'résumé' : 'cover letter'}. Changing tabs shows its other document. Use Compare changes above to inspect differences.</p><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6">{previous.content[kind] || 'No cover letter in this version.'}</pre><button type="button" className={button} disabled={busy || blocked} onClick={() => {
          if (dirty && !window.confirm('Replace your unsaved edits with both documents from this historical version?')) return;
          setContent({ ...previous.content }); setConfirmed(false); setNotice(`Version ${previous.version} copied into the editor. Save changes to create a new revision; history is preserved.`);
        }}>Restore both documents into editor</button><button type="button" className={`${button} ml-2`} onClick={() => setPrevious(null)}>Close historical view</button></section>}
        <section aria-labelledby="download-heading" className="space-y-3 border-t border-border pt-5"><h3 id="download-heading" className="font-bold">Download saved document</h3><p className="text-sm text-muted-foreground">{dirty ? 'Save your edits first to download the updated version.' : reviewed ? 'Your review is recorded for this saved version.' : 'This is an unreviewed draft. Read and correct it before sharing.'}</p><div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={busy || dirty || blocked || !content[kind]} onClick={() => download('txt')}>Text (.txt)</button><button type="button" className={button} disabled={busy || dirty || blocked || !content[kind]} onClick={() => download('html')}>Printable document (.html)</button></div><p className="text-xs text-muted-foreground">For a PDF, open the downloaded HTML document and choose Print → Save as PDF. Check page breaks and disable browser headers/footers before saving.</p></section>
      </section>
      <aside className="space-y-5 xl:sticky xl:top-6">
        <section className="space-y-4 rounded-xl border border-border bg-card p-5"><h2 className="text-lg font-bold">Review this version</h2><p className="text-sm leading-6">Check your name, contact details, dates, qualifications and employer. Review covers both documents in this pack.</p><label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1 h-4 w-4" checked={confirmed} disabled={busy || dirty || blocked || changed || reviewed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I have reviewed the documents and confirm that their claims are accurate.</span></label><button type="button" disabled={busy || dirty || blocked || changed || reviewed || !confirmed} onClick={review} className={`${button} w-full`}>{reviewed ? 'Review recorded' : 'Mark as reviewed'}</button><p className="text-xs leading-5 text-muted-foreground">Reviewing does not submit an application or authorize spending.</p></section>
        <section className="space-y-3 rounded-xl border border-border bg-card p-5"><h2 className="text-lg font-bold">How this was prepared</h2><p className="text-sm">{pack.evidence.matchedSkills.length ? `Skill mentions: ${pack.evidence.matchedSkills.join(', ')}` : 'No exact skill overlap found.'}</p><ul className="list-disc space-y-2 pl-4 text-sm leading-6 text-muted-foreground">{pack.evidence.notes.map((note) => <li key={note}>{note}</li>)}</ul>{pack.origin === 'user-edit' && <p className="text-sm">This version contains your edits. The source notes describe the original generated draft; new claims are not automatically verified.</p>}{pack.evidence.questions.length > 0 && <details><summary className="cursor-pointer text-sm font-semibold">Questions to review</summary><ul className="mt-3 list-disc space-y-2 pl-4 text-sm">{pack.evidence.questions.map((question) => <li key={question}>{question}</li>)}</ul></details>}</section>
        <section className="space-y-3 rounded-xl border border-border bg-card p-5"><h2 className="text-lg font-bold">Saved revisions</h2><button type="button" className={button} disabled={busy} onClick={() => void perform(async (signal) => { const value = await documentHistory(pack.id, signal); if (!signal.aborted) setHistory(value); })}>Show history</button>{history && <ol className="max-h-80 space-y-2 overflow-auto text-sm">{history.map((revision) => <li key={revision.version}><button type="button" disabled={busy} className="text-left underline underline-offset-4" onClick={() => void perform(async (signal) => { const value = await loadDocumentRevision(pack.id, revision.version, signal); if (!signal.aborted) setPrevious(value); })}>Version {revision.version} · {revision.origin === 'template-v1' ? 'Initial draft' : 'Edited'} · {new Date(revision.createdAt).toLocaleDateString()}</button></li>)}</ol>}<button type="button" className={`${button} text-destructive`} disabled={busy} onClick={remove}>Delete pack</button></section>
      </aside>
    </div>
  </main>;
}

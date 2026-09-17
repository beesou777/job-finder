'use client';

import { useState } from 'react';
import { renderResumeLayout, resumeLayouts, ResumeLayout } from '@/lib/resume-layouts';

export function ResumeTemplates({ resume, coverLetter, disabled, selectionOnly = false }: { resume: string; coverLetter: string; disabled: boolean; selectionOnly?: boolean }) {
  const [selected, setSelected] = useState<ResumeLayout>('executive');
  const [message, setMessage] = useState('');
  const [document, setDocument] = useState<'cv' | 'letter'>('cv');
  const html = renderResumeLayout(document === 'cv' ? resume : coverLetter, selected, document === 'letter');
  function download() {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const link = window.document.createElement('a');
    link.href = url; link.download = `kamkhoj-${document}-${selected}.html`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Downloaded the layout shown below. Open it and use Print → Save as PDF. Enable background graphics for the sidebar designs.');
  }
  return <section className="space-y-5 rounded-2xl border border-blue-100 bg-white p-5 sm:p-6" aria-labelledby="resume-template-title">
    <div><h2 id="resume-template-title" className="text-xl font-bold text-blue-950">Choose your CV layout</h2><p className="mt-2 text-sm leading-6 text-slate-600">Pick a design, preview your own content, then download the formatted document.</p></div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{resumeLayouts.map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelected(item.id)} className={`overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected === item.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
      <div aria-hidden="true" className="relative h-44 overflow-hidden border-b border-slate-200 bg-slate-100">
        <iframe title={item.name + ' thumbnail'} tabIndex={-1} sandbox="" srcDoc={renderResumeLayout(resume, item.id)} className="pointer-events-none absolute left-0 top-0 h-[1123px] w-[794px] origin-top-left scale-[0.15] border-0" />
      </div>
      <span className="block px-3 pt-3 text-sm font-bold text-slate-900">{item.name}{selected === item.id ? ' ✓' : ''}</span><span className="block px-3 pb-3 pt-1 text-xs leading-5 text-slate-600">{item.description}</span>
    </button>)}</div>
    <p className="text-xs leading-5 text-slate-500">Executive and Editorial use a single reading column. Sidebar layouts provide a more visual presentation. No layout guarantees an ATS score. Your facts and section content stay the same.</p>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2" role="group" aria-label="Document preview"><button type="button" aria-pressed={document === 'cv'} onClick={() => setDocument('cv')} className="rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary">CV preview</button><button type="button" aria-pressed={document === 'letter'} disabled={!coverLetter.trim()} onClick={() => setDocument('letter')} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary">Cover letter preview</button></div><button type="button" hidden={selectionOnly} disabled={disabled || !(document === 'cv' ? resume : coverLetter).trim()} onClick={download} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50">Download {document === 'cv' ? 'CV' : 'cover letter'} layout</button></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-3 sm:p-5"><iframe title="Full document preview — same layout as download" sandbox="" srcDoc={html} className="mx-auto h-[850px] w-[794px] border-0 bg-white shadow-sm" /></div>
    {!selectionOnly && disabled && <p className="text-sm text-slate-600">Save your edits and complete “Review this version” to enable downloads. You can preview every layout now.</p>}
    <p className="text-xs text-slate-500">Download is a printable HTML document. Open it and choose Print → Save as PDF; check page breaks before applying.</p>
    {message && <p role="status" className="text-sm text-blue-900">{message}</p>}
  </section>;
}

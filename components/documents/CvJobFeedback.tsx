'use client';

import { useMemo } from 'react';
import type { DocumentJob } from '@/lib/application-documents';

function words(text: string): Set<string> {
  return new Set(text.toLowerCase().match(/[\p{L}\p{N}+#.]+/gu) || []);
}

export function CvJobFeedback({ job, resume }: { job: DocumentJob; resume: string }) {
  const feedback = useMemo(() => {
    const text = `${job.requirements}\n${job.description}`.replace(/<[^>]*>/g, ' ');
    const requirements = text.split(/\n|(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 20 && /required|requirement|must|experience|proficien|knowledge|qualification|degree|skill/i.test(line))
      .filter((line, index, all) => all.indexOf(line) === index).slice(0, 12);
    const cvWords = words(resume);
    const stop = new Set(['with', 'that', 'this', 'have', 'will', 'must', 'required', 'requirements', 'experience', 'years', 'year', 'skills', 'knowledge', 'and', 'the', 'for']);
    return requirements.map((requirement) => {
      const keywords = [...words(requirement)].filter((word) => word.length > 2 && !stop.has(word));
      const found = keywords.filter((word) => cvWords.has(word));
      return { requirement, found, needsReview: found.length < Math.max(1, Math.ceil(keywords.length / 2)) };
    });
  }, [job.description, job.requirements, resume]);
  return <section className="space-y-4 rounded-xl border border-blue-100 bg-white p-5" aria-labelledby="cv-feedback-title">
    <h2 id="cv-feedback-title" className="text-xl font-bold text-blue-950">What could your CV explain better?</h2>
    <p className="text-sm leading-6 text-slate-600">Compare the employer’s requirements with your current draft. These word matches are review prompts, not an ATS score or a judgment of your qualifications. Add evidence only for work you actually did.</p>
    {!job.description.trim() && !job.requirements.trim() ? <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">This job has no detailed requirements yet. Open the original vacancy and check the description before tailoring your CV.</p> : !feedback.length ? <p className="text-sm text-slate-600">No clear requirement sentences were detected. Read the vacancy and compare qualifications, duties and required skills manually.</p> : <ul className="divide-y divide-blue-100">{feedback.map((item) => <li className="py-4" key={item.requirement}><p className="text-sm font-semibold text-blue-950">{item.requirement}</p><p className="mt-2 text-sm text-slate-600">{item.needsReview ? 'Needs your review: make relevant evidence clearer, or leave this as a genuine skill gap.' : 'Related wording appears in your CV. Check that your examples demonstrate the requirement.'}</p>{item.found.length > 0 && <p className="mt-2 text-xs text-slate-500">Shared wording: {item.found.slice(0, 8).join(', ')}</p>}</li>)}</ul>}
  </section>;
}

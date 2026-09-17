'use client';

import { useState } from 'react';
import { AiTailorResponse, DocumentJob, tailorDocumentWithAi } from '@/lib/application-documents';

interface CvAiTailorModalProps {
  packId: string;
  job: DocumentJob;
  currentResume: string;
  currentCoverLetter: string;
  initialTarget?: 'resume' | 'coverLetter' | 'both';
  isOpen: boolean;
  onClose: () => void;
  onApply: (tailored: { resume?: string; coverLetter?: string }) => void;
}

export function CvAiTailorModal({
  packId,
  job,
  currentResume,
  currentCoverLetter,
  initialTarget = 'resume',
  isOpen,
  onClose,
  onApply,
}: CvAiTailorModalProps) {
  const [target, setTarget] = useState<'resume' | 'coverLetter' | 'both'>(initialTarget);
  const [instructions, setInstructions] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiTailorResponse | null>(null);
  const [previewTab, setPreviewTab] = useState<'tailored' | 'original'>('tailored');

  if (!isOpen) return null;

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await tailorDocumentWithAi(packId, {
        target,
        instructions: instructions.trim() || undefined,
        apiKey: customKey.trim() || undefined,
        currentResume,
        currentCoverLetter,
      });
      setResult(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate tailored document.');
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result) return;
    onApply({
      resume: result.tailoredResume,
      coverLetter: result.tailoredCoverLetter,
    });
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-tailor-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 id="ai-tailor-title" className="text-lg font-bold text-foreground">
                AI 100% JD-to-CV Tailor
              </h2>
              <p className="text-xs text-muted-foreground">
                Powered by Google Gemini · Optimizes keywords and achievements for ATS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Job Info Pill */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">Target Role</span>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-bold text-blue-950 dark:text-blue-100">{job.title}</h3>
              {job.company && <span className="text-sm font-medium text-blue-800 dark:text-blue-300">at {job.company}</span>}
            </div>
            {job.requirements && (
              <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                <strong className="font-semibold text-slate-700 dark:text-slate-300">Key requirements:</strong> {job.requirements}
              </p>
            )}
          </div>

          {!result && (
            <>
              {/* Target Selector */}
              <div>
                <label className="block text-sm font-semibold mb-2">What would you like to tailor?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'resume', label: 'CV / Résumé', desc: 'Optimize skills & experience' },
                    { id: 'coverLetter', label: 'Cover Letter', desc: 'Personalized compelling letter' },
                    { id: 'both', label: 'Both Documents', desc: 'Complete application pack' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={loading}
                      onClick={() => setTarget(item.id as any)}
                      className={`rounded-xl border-2 p-3 text-left transition ${
                        target === item.id
                          ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40'
                          : 'border-border hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Guidance */}
              <div>
                <label htmlFor="instructions" className="block text-sm font-semibold mb-1">
                  Custom AI Instructions <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                </label>
                <textarea
                  id="instructions"
                  rows={2}
                  disabled={loading}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Focus on full-stack architecture, highlight my Docker and AWS experience, mention leadership..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Gemini Key Override Accordion */}
              <div className="rounded-xl border border-border bg-secondary/10 p-3">
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Gemini API Key: {customKey ? 'Custom key entered' : 'Using server default'}</span>
                  <span>{showKeyInput ? '▲ Hide' : '▼ Custom key'}</span>
                </button>
                {showKeyInput && (
                  <div className="mt-3">
                    <input
                      type="password"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="Paste personal Gemini API Key (leaves blank for system key)"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Leave empty to use the system&apos;s configured Gemini key.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 text-center dark:border-blue-900/50 dark:bg-blue-950/20">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3" />
              <h4 className="text-base font-bold text-blue-900 dark:text-blue-200">
                Gemini AI is analyzing the Job Description...
              </h4>
              <p className="mt-1 text-xs text-muted-foreground animate-pulse">
                Extracting core requirements, mapping achievements, and formatting for 100% ATS alignment.
              </p>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Generated Result Preview */}
          {result && (
            <div className="space-y-4">
              {/* Score and highlights header */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30 p-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    JD Match Estimation
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                      {result.matchScore}%
                    </span>
                    <span className="text-xs text-emerald-900 dark:text-emerald-200">
                      High ATS Alignment
                    </span>
                  </div>
                </div>
                <p className="max-w-md text-xs text-emerald-800 dark:text-emerald-200">
                  {result.summaryOfChanges}
                </p>
              </div>

              {/* Highlights pills */}
              {result.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Key Enhancements</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900 dark:bg-blue-900/40 dark:text-blue-200"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content preview */}
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewTab('tailored')}
                      className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                        previewTab === 'tailored'
                          ? 'bg-blue-600 text-white'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      AI Tailored Content
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('original')}
                      className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                        previewTab === 'original'
                          ? 'bg-blue-600 text-white'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Original Content
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">Preview before applying</span>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-background p-4 text-xs font-mono leading-5 whitespace-pre-wrap">
                  {previewTab === 'tailored' ? (
                    result.tailoredResume || result.tailoredCoverLetter || 'No tailored content generated.'
                  ) : (
                    target === 'coverLetter' ? currentCoverLetter : currentResume
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-6 py-4">
          <button
            type="button"
            disabled={loading}
            onClick={result ? () => setResult(null) : onClose}
            className="rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
          >
            {result ? '← Re-generate' : 'Cancel'}
          </button>

          {!result ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {loading ? 'Analyzing & Tailoring...' : 'Generate 100% Match'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Apply to {target === 'both' ? 'CV & Letter' : target === 'resume' ? 'CV' : 'Cover Letter'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

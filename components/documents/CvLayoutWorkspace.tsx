"use client";

import { useState, useMemo, useRef } from "react";
import {
  DocumentContent,
  DocumentJob,
  DocumentPack,
  downloadBlob,
} from "@/lib/application-documents";
import { renderResumeLayout, resumeLayouts, ResumeLayout } from "@/lib/resume-layouts";
import { CvAiTailorModal } from "./CvAiTailorModal";
import { DocumentChanges } from "./DocumentChanges";

interface CvLayoutWorkspaceProps {
  pack: DocumentPack;
  content: DocumentContent;
  setContent: (content: DocumentContent) => void;
  dirty: boolean;
  busy: boolean;
  blocked: boolean;
  previousContent?: DocumentContent | null;
  onSave: () => void;
  onLocalCopy: () => void;
  onConfirmReview?: () => void;
}

export function CvLayoutWorkspace({
  pack,
  content,
  setContent,
  dirty,
  busy,
  blocked,
  previousContent,
  onSave,
  onLocalCopy,
}: CvLayoutWorkspaceProps) {
  const [selectedLayout, setSelectedLayout] = useState<ResumeLayout>("stockholm");
  const [activeTab, setActiveTab] = useState<"resume" | "coverLetter">("resume");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTarget, setAiTarget] = useState<"resume" | "coverLetter" | "both">("resume");
  const [scale, setScale] = useState<number>(0.85);
  const [downloadMsg, setDownloadMsg] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Live rendered HTML
  const previewHtml = useMemo(() => {
    if (activeTab === "resume") {
      return renderResumeLayout(content.resume, selectedLayout, false);
    } else {
      return renderResumeLayout(
        content.coverLetter || "No cover letter written yet.",
        "executive",
        true,
      );
    }
  }, [content.resume, content.coverLetter, selectedLayout, activeTab]);

  function handleOpenAi(target: "resume" | "coverLetter" | "both") {
    setAiTarget(target);
    setShowAiModal(true);
  }

  function handleApplyAi(tailored: { resume?: string; coverLetter?: string }) {
    const updated = { ...content };
    if (tailored.resume) updated.resume = cleanTypoAnomalies(tailored.resume);
    if (tailored.coverLetter) updated.coverLetter = tailored.coverLetter;
    setContent(updated);
  }

  function cleanTypoAnomalies(text: string): string {
    return text
      .replace(/\b8UMMARY\b/gi, "Summary")
      .replace(/\b8KILL\s*8\b/gi, "Skills")
      .replace(/\b8KILLS\b/gi, "Skills")
      .replace(/\bPROJECT8\b/gi, "Projects")
      .replace(/\bLANGUAGE8\b/gi, "Languages");
  }

  function handleAutoClean() {
    const cleaned = cleanTypoAnomalies(content[activeTab]);
    if (cleaned !== content[activeTab]) {
      setContent({ ...content, [activeTab]: cleaned });
      setDownloadMsg("Cleaned up text anomalies and headings.");
      setTimeout(() => setDownloadMsg(""), 4000);
    } else {
      setDownloadMsg("Text is already clean.");
      setTimeout(() => setDownloadMsg(""), 3000);
    }
  }

  function insertTextAtCursor(insertion: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent({ ...content, [activeTab]: content[activeTab] + "\n\n" + insertion });
      return;
    }
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = content[activeTab];
    const updated = current.substring(0, start) + insertion + current.substring(end);
    setContent({ ...content, [activeTab]: updated });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  }

  function handleInsertLink() {
    if (!linkUrl.trim()) return;
    const label = linkLabel.trim() || linkUrl.trim().replace(/^https?:\/\//i, "");
    const markdownLink = `[${label}](${linkUrl.trim()})`;
    insertTextAtCursor(markdownLink);
    setLinkLabel("");
    setLinkUrl("");
    setShowLinkModal(false);
  }

  function handleInsertProject() {
    const sample = `\nProject Name | [Live Demo](https://example.com) | [GitHub](https://github.com/your-username/project)
Next.js, TypeScript, PostgreSQL, Tailwind CSS
- Architected and implemented core full-stack features with high performance and ATS-friendly design.
- Built responsive UI components and optimized database query latencies by 35%.\n`;
    insertTextAtCursor(sample);
  }

  function handleInsertExperience() {
    const sample = `\nSenior Full-stack Developer | Tech Solutions Inc. | Kathmandu, Nepal
2023-01 – Present
- Spearheaded development of scalable web applications serving 10,000+ daily active users.
- Collaborated across engineering and product teams to ship weekly production releases with zero downtime.\n`;
    insertTextAtCursor(sample);
  }

  function handleDownloadTemplate() {
    const isCv = activeTab === "resume";
    const htmlToDownload = isCv
      ? renderResumeLayout(content.resume, selectedLayout, false)
      : renderResumeLayout(content.coverLetter, "executive", true);

    const filename = `kamkhoj-${isCv ? `cv-${selectedLayout}` : "cover-letter"}.html`;
    downloadBlob(new Blob([htmlToDownload], { type: "text/html;charset=utf-8" }), filename);
    setDownloadMsg(
      `Downloaded printable ${isCv ? "CV" : "cover letter"}. Open the file in browser and use Print → Save as PDF.`,
    );
    setTimeout(() => setDownloadMsg(""), 6000);
  }

  function handleOpenInNewTab() {
    const isCv = activeTab === "resume";
    const htmlToOpen = isCv
      ? renderResumeLayout(content.resume, selectedLayout, false)
      : renderResumeLayout(content.coverLetter, "executive", true);

    const blob = new Blob([htmlToOpen], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* Template Selection Strip */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>🎨 Choose CV Template</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                Resume.io Styles
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select any layout modeled after Resume.io&apos;s top templates. Instant live preview
              below.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Current layout:{" "}
            <strong className="text-blue-600 dark:text-blue-400 capitalize">
              {selectedLayout}
            </strong>
          </div>
        </div>

        {/* Template Selector Cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {resumeLayouts.slice(0, 5).map((item) => {
            const isSelected = selectedLayout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedLayout(item.id)}
                className={`group relative flex flex-col rounded-xl border-2 p-3 text-left transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/80 dark:border-blue-500 dark:bg-blue-950/40 shadow-sm"
                    : "border-border bg-background hover:border-slate-300 hover:bg-secondary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground group-hover:text-blue-600">
                    {item.name}
                  </span>
                  {isSelected && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      ✓
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {item.columns ? "2-Column Sidebar" : "Single Column ATS"}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Editor & Quick Link Tools (5 cols on lg) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Document Tab Selector */}
          <div className="flex rounded-xl border border-border bg-secondary/30 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("resume")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                activeTab === "resume"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📄 Résumé / CV
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("coverLetter")}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
                activeTab === "coverLetter"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ✉️ Cover Letter
            </button>
          </div>

          {/* AI Banner for Active Document */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm dark:border-blue-900/50 dark:from-blue-950/30 dark:to-indigo-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100">
                  {activeTab === "resume"
                    ? "100% JD Match with Gemini AI"
                    : "AI Role-Tailored Cover Letter"}
                </h3>
                <p className="mt-0.5 text-xs text-blue-800/80 dark:text-blue-300">
                  {activeTab === "resume"
                    ? `Optimize skills, summary, and experience bullets to match "${pack.job.title}".`
                    : `Generate a persuasive letter tailored to ${pack.job.company || "the hiring team"}.`}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy || blocked}
                    onClick={() => handleOpenAi(activeTab)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                  >
                    ✨ Tailor with AI
                  </button>
                  <button
                    type="button"
                    disabled={busy || blocked}
                    onClick={() => handleOpenAi("both")}
                    className="rounded-lg border border-blue-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-white dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                  >
                    Tailor Both Documents
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insert & Helper Toolbar */}
          {activeTab === "resume" && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-secondary/30 p-2 text-xs">
              <span className="font-bold text-muted-foreground mr-1">Insert:</span>
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 font-semibold hover:border-blue-400 hover:text-blue-600 shadow-2xs"
                title="Add markdown link or URL"
              >
                🔗 + Link
              </button>
              <button
                type="button"
                onClick={handleInsertProject}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 font-semibold hover:border-blue-400 hover:text-blue-600 shadow-2xs"
                title="Insert formatted project block"
              >
                🚀 + Project
              </button>
              <button
                type="button"
                onClick={handleInsertExperience}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 font-semibold hover:border-blue-400 hover:text-blue-600 shadow-2xs"
                title="Insert formatted job experience block"
              >
                💼 + Experience
              </button>
              <button
                type="button"
                onClick={handleAutoClean}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 font-semibold hover:border-emerald-400 hover:text-emerald-600 shadow-2xs ml-auto"
                title="Clean OCR/text glitches like 8UMMARY or 8KILL 8"
              >
                🧹 Clean Headings
              </button>
            </div>
          )}

          {/* Text Editor Card */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="document-text-editor" className="text-sm font-bold text-foreground">
                {activeTab === "resume" ? "Edit Résumé Text & Markdown" : "Edit Cover Letter Text"}
              </label>
              <span className="text-xs text-muted-foreground">
                {content[activeTab].length} characters
              </span>
            </div>

            <textarea
              id="document-text-editor"
              ref={textareaRef}
              rows={16}
              value={content[activeTab]}
              disabled={busy || blocked}
              maxLength={activeTab === "resume" ? 600000 : 30000}
              onChange={(e) => {
                setContent({ ...content, [activeTab]: e.target.value });
              }}
              placeholder={
                activeTab === "resume"
                  ? "Paste or edit CV sections (Summary, Skills, Experience, Education, Projects, Links)..."
                  : "Write or generate your cover letter..."
              }
              className="w-full rounded-xl border border-input bg-background p-3.5 font-sans text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            />

            <div className="space-y-1 text-[11px] text-muted-foreground">
              <p>
                💡 <strong>Links & Formatting:</strong> Use{" "}
                <code>[Live Demo](https://example.com)</code> or paste full URLs for clickable links
                in your CV!
              </p>
              <p>
                💡 <strong>Bullet points:</strong> Start lines with <code>-</code> or <code>•</code>{" "}
                to automatically create styled bullet lists.
              </p>
            </div>

            {/* Editor Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy || blocked || !dirty || !content.resume.trim()}
                  onClick={onSave}
                  className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "Saving…" : "Save changes"}
                </button>
                {dirty && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 animate-pulse">
                    ● Unsaved edits
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onLocalCopy}
                disabled={!content[activeTab]}
                className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
              >
                Download text backup
              </button>
            </div>

            {/* Compare Changes Collapsible */}
            <details className="border-t border-border pt-3">
              <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
                Compare changes against saved version
              </summary>
              <div className="mt-3">
                <DocumentChanges
                  before={(previousContent || pack.content)[activeTab]}
                  after={content[activeTab]}
                  baseline={`saved version ${pack.version}`}
                />
              </div>
            </details>
          </div>
        </div>

        {/* Right Column: Live Template Preview & Download (7 cols on lg) */}
        <div className="space-y-3 lg:col-span-7">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
            {/* Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-foreground">
                  Live Preview:{" "}
                  {activeTab === "resume"
                    ? `${selectedLayout.toUpperCase()} Layout`
                    : "Cover Letter"}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Scale controls */}
                <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-secondary/30 p-1 text-xs">
                  {[0.7, 0.85, 1.0].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className={`rounded px-2 py-0.5 font-semibold transition ${
                        scale === s ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                      }`}
                    >
                      {Math.round(s * 100)}%
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  title="Open full page in new tab"
                  className="rounded-lg border border-input p-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>

                {/* Instant Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={busy || blocked || !content[activeTab].trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download {activeTab === "resume" ? "CV Layout" : "Letter"}
                </button>
              </div>
            </div>

            {downloadMsg && (
              <div
                role="status"
                className="rounded-lg bg-blue-50 p-2.5 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
              >
                {downloadMsg}
              </div>
            )}

            {/* Document Iframe Sandbox Container */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-100 p-2 sm:p-4 dark:border-slate-800 dark:bg-slate-900 flex justify-center min-h-[620px]">
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  width: "794px",
                  marginBottom: `calc((950px * ${scale}) - 950px)`,
                }}
                className="transition-transform duration-200"
              >
                <iframe
                  title="Live CV Template Preview"
                  sandbox="allow-same-origin"
                  srcDoc={previewHtml}
                  className="h-[1100px] w-[794px] border-0 bg-white shadow-md rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Standard A4 Print format · Click links to open external pages</span>
              <span>
                Open downloaded HTML and choose <strong>Print → Save as PDF</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold">Add Clickable Link</h3>
            <p className="text-xs text-muted-foreground">
              Add a link for your Portfolio, GitHub, LinkedIn, or a live Project demo.
            </p>
            <div>
              <label className="block text-xs font-semibold mb-1">Link Title / Display Text</label>
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="e.g. Live Demo, GitHub, Portfolio"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">URL (Web Address)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="rounded-lg border border-input px-3.5 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!linkUrl.trim()}
                onClick={handleInsertLink}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tailoring Modal */}
      <CvAiTailorModal
        packId={pack.id}
        job={pack.job}
        currentResume={content.resume}
        currentCoverLetter={content.coverLetter}
        initialTarget={aiTarget}
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={handleApplyAi}
      />
    </div>
  );
}

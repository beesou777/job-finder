"use client";

import { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

export interface CvData {
  url: string;
  filename: string;
  uploadedAt: string;
  role: string | null;
  skills: string[];
  summary: string | null;
  experienceLevel: string | null;
}

interface CvUploadCardProps {
  onCvChanged?: () => void;
  activeMode: "all" | "cv" | "preferences";
  onModeChange: (mode: "all" | "cv" | "preferences") => void;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function CvUploadCard({ onCvChanged, activeMode, onModeChange }: CvUploadCardProps) {
  const [cv, setCv] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCv();
  }, []);

  async function fetchCv() {
    try {
      setLoading(true);
      const res = await fetch("/api/me/cv", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.hasCv && data.cv) {
          setCv(data.cv);
        } else {
          setCv(null);
        }
      }
    } catch (err) {
      console.error("Failed to load CV:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setError(null);

    // Strict 4MB size validation
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. The maximum allowed size is 4MB.`,
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("Uploading to Cloudflare R2...");

      const formData = new FormData();
      formData.append("file", file);

      // Status indicator update
      const timer = setTimeout(() => {
        setUploadStatus("Analyzing CV & extracting skills with Gemini AI...");
      }, 1200);

      const res = await fetch("/api/me/cv", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload and parse CV.");
      }

      setCv(data.cv);
      onCvChanged?.();
      onModeChange("cv");
    } catch (err: any) {
      setError(err?.message || "An error occurred while uploading CV.");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }

  async function handleDeleteCv() {
    if (!confirm("Are you sure you want to delete your uploaded CV?")) return;
    try {
      setIsDeleting(true);
      const res = await fetch("/api/me/cv", { method: "DELETE" });
      if (res.ok) {
        setCv(null);
        onCvChanged?.();
        onModeChange("all");
      }
    } catch (err) {
      console.error("Failed to delete CV:", err);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mb-8 flex items-center justify-center rounded-2xl border border-white/10 bg-[#171715] p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-sm text-zinc-400">Loading CV details...</span>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md,image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-[#171715] p-10 text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-ping rounded-full bg-primary/20" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="mt-4 font-bold text-white">{uploadStatus}</p>
          <p className="mt-1 text-xs text-zinc-500">
            Securely uploaded to Cloudflare R2 and processed with Gemini AI.
          </p>
        </div>
      ) : !cv ? (
        /* Empty State: Upload Prompt */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-white/10 bg-[#171715]/60 hover:border-primary/50 hover:bg-[#171715]"
          }`}
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition group-hover:scale-110 group-hover:border-primary/40">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">Upload your CV to auto-match jobs</h3>
          <p className="mt-1 max-w-md text-sm text-zinc-400">
            Upload your resume (<span className="text-zinc-300">PDF, DOCX, TXT under 4MB</span>).
            Gemini AI will analyze your role & skills to find your perfect job matches.
          </p>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Select CV to Upload
          </button>
        </div>
      ) : (
        /* Active State: CV Card with AI Extraction */
        <div className="rounded-2xl border border-white/10 bg-[#171715] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white">{cv.filename || "Uploaded CV"}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {cv.uploadedAt
                    ? `Uploaded on ${new Date(cv.uploadedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : "Stored on Cloudflare R2"}
                </p>
                {cv.url && (
                  <a
                    href={cv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    View uploaded CV <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Replace CV
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCv}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>
            </div>
          </div>

          {/* AI Extracted Profile Highlights */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {cv.role && (
                <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Briefcase className="h-3.5 w-3.5" />
                  Role: {cv.role}
                </div>
              )}
              {cv.experienceLevel && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                  Level: {cv.experienceLevel}
                </div>
              )}
            </div>

            {cv.summary && (
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                <span className="font-semibold text-zinc-300">AI Profile Summary: </span>
                {cv.summary}
              </p>
            )}

            {cv.skills && cv.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Extracted Skills used for job matching:
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cv.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-white/10 bg-[#22221f] px-2.5 py-1 text-xs text-zinc-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Matching Filter Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <span className="text-xs font-bold text-zinc-400">Displaying:</span>
            <button
              onClick={() => onModeChange("cv")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeMode === "cv"
                  ? "bg-primary text-zinc-950 shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              CV Match Only ({cv.role || "Extracted Skills"})
            </button>
            <button
              onClick={() => onModeChange("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeMode === "all"
                  ? "bg-primary text-zinc-950 shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              All Matches (CV + Preferences)
            </button>
            <button
              onClick={() => onModeChange("preferences")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeMode === "preferences"
                  ? "bg-primary text-zinc-950 shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              Preferences Only
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

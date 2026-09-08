"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck2,
} from "lucide-react";
import { authFetch } from "@/lib/auth-context";

interface ReplaceCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cvData?: any) => void;
  currentCvFilename?: string | null;
  currentCvUrl?: string | null;
  currentRole?: string | null;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt", ".md", ".png", ".jpg", ".jpeg"];

export function ReplaceCvModal({
  isOpen,
  onClose,
  onSuccess,
  currentCvFilename,
  currentCvUrl,
  currentRole,
}: ReplaceCvModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isUploading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUploading, onClose]);

  // Reset local state when opened
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMessage(null);
      setIsUploading(false);
      setUploadStep("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleProcessFile(file: File) {
    setError(null);
    setSuccessMessage(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed file size is 4MB.`,
      );
      return;
    }

    // Validate extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(
        `Unsupported file type (${ext}). Please select a PDF, DOCX, DOC, TXT, or MD resume file.`,
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadStep(`Uploading "${file.name}" to secure storage...`);

      const timer1 = setTimeout(() => {
        setUploadStep("Gemini AI analyzing skills, experience & target role...");
      }, 1200);

      const timer2 = setTimeout(() => {
        setUploadStep("Recalculating 80%+ job match rankings...");
      }, 3000);

      const formData = new FormData();
      formData.append("file", file);

      const res = await authFetch("/api/me/cv", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to process and analyze CV.");
      }

      setSuccessMessage(`CV updated to "${file.name}"! Matches updated.`);
      onSuccess(data.cv);

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      setError(err?.message || "Failed to upload CV. Please check your network and try again.");
    } finally {
      setIsUploading(false);
      setUploadStep("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  }

  async function handleDeleteCv() {
    if (!confirm("Are you sure you want to remove your uploaded CV?")) return;
    try {
      setIsDeleting(true);
      setError(null);
      const res = await authFetch("/api/me/cv", { method: "DELETE" });
      if (res.ok) {
        setSuccessMessage("CV removed successfully.");
        onSuccess(null);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete CV.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete CV.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#141412] p-6 text-white shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">
                {currentCvFilename ? "Replace CV Profile" : "Upload CV Profile"}
              </h2>
              <p className="text-xs text-zinc-400">
                Auto-match jobs with Gemini AI skills extraction
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current CV status (if exists) */}
        {currentCvFilename && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-200">{currentCvFilename}</p>
                {currentRole && <p className="text-[11px] text-zinc-500">Role: {currentRole}</p>}
              </div>
            </div>
            {currentCvUrl && (
              <a
                href={currentCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-primary hover:underline shrink-0 text-[11px]"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Hidden reliable file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="sr-only"
          onClick={(e) => {
            (e.target as HTMLInputElement).value = "";
          }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
        />

        {/* Main interactive area */}
        <div className="mt-5">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-[#171715] p-8 text-center space-y-4 animate-in fade-in">
              <div className="relative">
                <div className="h-14 w-14 animate-ping rounded-full bg-primary/20" />
                <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-white">{uploadStep}</p>
                <p className="text-xs text-zinc-500">
                  Parsing career experience, skills, and target seniority...
                </p>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-white/15 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.04]"
              }`}
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 transition group-hover:scale-110 group-hover:border-primary/40 group-hover:bg-primary/10">
                <UploadCloud className="h-7 w-7 text-primary" />
              </div>

              <h3 className="mt-3.5 text-sm font-bold text-white">
                Drag & drop your new CV here, or{" "}
                <span className="text-primary underline">browse</span>
              </h3>

              <p className="mt-1 text-xs text-zinc-400">
                Supports PDF, DOCX, DOC, or TXT up to 4MB
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-zinc-950 shadow-sm transition hover:bg-white"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                Select CV File
              </button>
            </div>
          )}
        </div>

        {/* Footer info & Delete Action */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
          {currentCvFilename ? (
            <button
              type="button"
              disabled={isUploading || isDeleting}
              onClick={handleDeleteCv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Remove CV
            </button>
          ) : (
            <span className="text-[11px] text-zinc-500">
              Fast Cloudflare R2 + Gemini AI parsing
            </span>
          )}

          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 font-semibold text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
// KamKhoj Play — shared game shell: title, score/timer, pause/restart,
// fullscreen, sound, help, result screen, personal best, share.

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Flag, HelpCircle, Home, Maximize2, Pause, Play as PlayIcon,
  RotateCcw, Share2, Star, Volume2, VolumeX,
} from "lucide-react";
import { usePlay } from "./PlayProvider";
import { GAME_MAP } from "@/lib/play/registry";
import { cn } from "@/lib/utils";

interface ShellProps {
  gameId: string;
  score?: number;
  best?: number | null;
  timerLabel?: string | null;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit?: () => void;
  result?: { title: string; subtitle?: string; xpGained?: number } | null;
  onShareText?: string;
  children: React.ReactNode;
}

export function GameShell(props: ShellProps) {
  const { gameId, score, best, timerLabel, paused, onPause, onResume, onRestart, result, onShareText, children } = props;
  const meta = GAME_MAP[gameId];
  const { profile, updateProfile, playSound } = usePlay();
  const [showHelp, setShowHelp] = useState(false);
  const [shared, setShared] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) void wrapRef.current?.requestFullscreen?.();
      else void document.exitFullscreen();
    } catch { /* unsupported */ }
  }, []);

  // Escape closes help or pauses; R restarts (when not typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "Escape") {
        if (showHelp) setShowHelp(false);
        else if (!result && !typing) { if (paused) onResume(); else onPause(); }
      }
      if ((e.key === "r" || e.key === "R") && !typing && !e.metaKey && !e.ctrlKey) onRestart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showHelp, paused, result, onPause, onResume, onRestart]);

  // auto-pause on tab hide
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && !paused && !result) onPause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [paused, result, onPause]);

  const share = useCallback(async () => {
    const text = onShareText ?? `I scored ${score ?? 0} in ${meta?.title ?? gameId} on KamKhoj Play.`;
    try {
      const nav = navigator as Navigator & { share?: (d: { title: string; text: string }) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: "KamKhoj Play", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      } catch { /* clipboard unavailable */ }
    }
  }, [onShareText, score, meta, gameId]);

  return (
    <div ref={wrapRef} className="play-shell mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6">
      <div className="mb-3 flex items-center gap-2 text-[13px]">
        <Link href="/play" className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Play
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-extrabold text-[#102e67]">{meta?.title ?? gameId}</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_36px_rgba(31,78,140,.08)]">
        {/* header bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-[#f6faff] px-4 py-3">
          <div className="mr-auto flex items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-black text-[#102e67]">{meta?.title}</p>
              <p className="truncate text-xs text-slate-500">{meta?.tagline}</p>
            </div>
          </div>
          {timerLabel && (
            <span className="rounded-lg bg-[#102e67] px-3 py-1.5 font-mono text-sm font-black tabular-nums text-white" aria-live="polite">
              {timerLabel}
            </span>
          )}
          {typeof score === "number" && (
            <span className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-sm font-black tabular-nums text-[#102e67]" aria-live="polite">
              {score}
              {best !== null && best !== undefined && (
                <span className="ml-2 text-[11px] font-bold text-slate-400">BEST {best}</span>
              )}
            </span>
          )}
          <div className="flex items-center gap-1">
            <ShellBtn label={paused ? "Resume" : "Pause"} onClick={() => { playSound("click"); if (paused) onResume(); else onPause(); }}>
              {paused ? <PlayIcon className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </ShellBtn>
            <ShellBtn label="Restart (R)" onClick={() => { playSound("click"); onRestart(); }}>
              <RotateCcw className="h-4 w-4" />
            </ShellBtn>
            <ShellBtn label="Fullscreen" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </ShellBtn>
            <ShellBtn label={profile.sound ? "Mute sound" : "Unmute sound"} onClick={() => updateProfile({ sound: !profile.sound })}>
              {profile.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </ShellBtn>
            <ShellBtn label="How to play" onClick={() => setShowHelp(true)}>
              <HelpCircle className="h-4 w-4" />
            </ShellBtn>
          </div>
        </div>

        <div className="relative p-4 sm:p-6">
          {paused && !result && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-sm">
              <p className="text-lg font-black text-[#102e67]">Paused</p>
              <div className="flex gap-2">
                <button onClick={onResume} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700">
                  Resume
                </button>
                <button onClick={onRestart} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-300">
                  Restart
                </button>
              </div>
            </div>
          )}
          {result ? (
            <div className="mx-auto max-w-md py-6 text-center" role="status">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl" aria-hidden>
                🏆
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#102e67]">{result.title}</h2>
              {result.subtitle && <p className="mt-1 text-sm text-slate-500">{result.subtitle}</p>}
              {typeof result.xpGained === "number" && (
                <p className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  <Star className="h-3.5 w-3.5" /> +{result.xpGained} XP
                </p>
              )}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button onClick={onRestart} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700">
                  <RotateCcw className="h-4 w-4" /> Play again
                </button>
                <button onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-300">
                  <Share2 className="h-4 w-4" /> {shared ? "Copied!" : "Share"}
                </button>
                <Link href="/play" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-300">
                  <Home className="h-4 w-4" /> All games
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#071a38]/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="How to play">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-base font-black text-[#102e67]">How to play — {meta?.title}</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {(meta?.instructions ?? []).map((s) => (
                <li key={s} className="flex gap-2"><Flag className="mt-1 h-3.5 w-3.5 shrink-0 text-blue-500" />{s}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Controls</p>
            <ul className="mt-1 space-y-1 text-sm text-slate-600">
              {(meta?.controls ?? []).map((s) => <li key={s}>• {s}</li>)}
            </ul>
            <button onClick={() => setShowHelp(false)} className="mt-4 w-full rounded-xl bg-[#102e67] py-2.5 text-sm font-black text-white">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShellBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn("flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500")}
    >
      {children}
    </button>
  );
}

"use client";
// KamKhoj Play — client chrome: provider, theme, toasts, command palette.

import React, { useEffect } from "react";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { PlayProvider, usePlay } from "@/components/play/PlayProvider";
import { CommandPalette } from "@/components/play/CommandPalette";
import { PlayErrorBoundary } from "@/components/play/PlayErrorBoundary";

function Themed({ children }: { children: React.ReactNode }) {
  const { profile } = usePlay();
  useEffect(() => {
    try {
      document.documentElement.dataset.playTheme = profile.theme;
      document.documentElement.classList.toggle("play-reduced", profile.reducedMotion);
    } catch { /* noop */ }
  }, [profile.theme, profile.reducedMotion]);
  const themeBg =
    profile.theme === "midnight"
      ? "bg-[#0a1428]"
      : profile.theme === "arcade"
        ? "bg-[#101018]"
        : profile.theme === "calm"
          ? "bg-[#f4f6f1]"
          : "bg-[#f4f8ff]";
  return (
    <div className={`min-h-screen ${themeBg} pb-20`}>
      <PlayNav />
      <div className="pt-4">{children}</div>
      <Toasts />
      <CommandPalette />
    </div>
  );
}

function PlayNav() {
  const { level } = usePlay();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/play" className="flex items-center gap-2 font-black tracking-tight text-[#102e67]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102e67] text-white">
            <Gamepad2 className="h-4 w-4" />
          </span>
          <span>kamkhoj <span className="text-blue-600">play</span></span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 text-[13px] font-bold text-slate-500 sm:flex" aria-label="Play sections">
          <NavLink href="/play">Games</NavLink>
          <NavLink href="/play/daily">Daily</NavLink>
          <NavLink href="/play/achievements">Achievements</NavLink>
          <NavLink href="/play/stats">Stats</NavLink>
          <NavLink href="/play/settings">Settings</NavLink>
        </nav>
        <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">LVL {level}</span>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1.5 text-[13px] font-bold text-slate-500 sm:hidden" aria-label="Play sections mobile">
        <NavLink href="/play">Games</NavLink>
        <NavLink href="/play/daily">Daily</NavLink>
        <NavLink href="/play/achievements">Achievements</NavLink>
        <NavLink href="/play/stats">Stats</NavLink>
        <NavLink href="/play/settings">Settings</NavLink>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="whitespace-nowrap rounded-lg px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700">
      {children}
    </Link>
  );
}

function Toasts() {
  const { toasts, dismissToast, playSound } = usePlay();
  useEffect(() => {
    if (toasts.length) playSound("achievement");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts.length]);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[99] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-amber-200 bg-white p-4 text-left shadow-[0_16px_44px_rgba(31,78,140,.2)]"
        >
          <span className="text-2xl" aria-hidden>{t.kind === "achievement" ? "🏆" : t.kind === "level" ? "⭐" : t.kind === "daily" ? "📅" : "ℹ️"}</span>
          <span>
            <span className="block text-sm font-black text-[#102e67]">{t.title}</span>
            <span className="block text-xs text-slate-500">{t.body}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export default function PlayClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayProvider>
      <PlayErrorBoundary name="play">
        <Themed>{children}</Themed>
      </PlayErrorBoundary>
    </PlayProvider>
  );
}

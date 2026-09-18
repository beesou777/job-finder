"use client";
// KamKhoj Play — Ctrl/⌘+K command palette (games, pages, toggles).

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { GAMES } from "@/lib/play/registry";
import { usePlay } from "./PlayProvider";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const { profile, updateProfile, playSound } = usePlay();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const games = GAMES.filter((g) => !needle || g.title.toLowerCase().includes(needle) || g.tagline.toLowerCase().includes(needle)).slice(0, 8);
    const pages = [
      { title: "Play home", href: "/play" },
      { title: "Daily challenges", href: "/play/daily" },
      { title: "Achievements", href: "/play/achievements" },
      { title: "Statistics", href: "/play/stats" },
      { title: "Settings", href: "/play/settings" },
    ].filter((p) => !needle || p.title.toLowerCase().includes(needle));
    return { games, pages };
  }, [q]);

  if (!open) return null;

  const go = (href: string) => {
    playSound("click");
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center bg-[#071a38]/50 p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Play commands">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search games, pages, actions…"
            className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="Search Play"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.games.map((g) => (
            <button key={g.id} onClick={() => go(`/play/${g.id}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50">
              <span className="text-sm font-black text-[#102e67]">{g.title}</span>
              <span className="truncate text-xs text-slate-400">{g.tagline}</span>
            </button>
          ))}
          {results.pages.map((p) => (
            <button key={p.href} onClick={() => go(p.href)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50">
              <span className="text-sm font-bold text-slate-600">{p.title}</span>
            </button>
          ))}
          <button
            onClick={() => { updateProfile({ sound: !profile.sound }); setOpen(false); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50"
          >
            <span className="text-sm font-bold text-slate-600">{profile.sound ? "Mute sound" : "Unmute sound"}</span>
          </button>
          {results.games.length === 0 && results.pages.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-400">No matches. Try another search.</p>
          )}
        </div>
      </div>
      <button aria-label="Close" className="fixed inset-0 -z-10 cursor-default" onClick={() => setOpen(false)} />
    </div>
  );
}

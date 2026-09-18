"use client";
// Achievements page — unlocked/locked/progress, category + rarity filters.

import React, { useMemo, useState } from "react";
import { usePlay } from "@/components/play/PlayProvider";
import { ACHIEVEMENTS } from "@/lib/play/achievements";
import type { AchievementDef } from "@/lib/play/types";
import { cn } from "@/lib/utils";

const RARITY_STYLE: Record<string, string> = {
  common: "bg-slate-100 text-slate-600",
  uncommon: "bg-emerald-100 text-emerald-700",
  rare: "bg-blue-100 text-blue-700",
  epic: "bg-purple-100 text-purple-700",
  legendary: "bg-amber-100 text-amber-700",
};

const ICONS: Record<string, string> = {
  play: "▶️", compass: "🧭", globe: "🌍", map: "🗺️", zap: "⚡", flame: "🔥",
  medal: "🏅", star: "⭐", crown: "👑", trophy: "🏆", timer: "⏱️", rocket: "🚀",
  crosshair: "🎯", target: "🎯", palette: "🎨", brain: "🧠", keyboard: "⌨️",
  wind: "💨", swords: "⚔️", check: "✅", layers: "🗂️", sparkles: "✨",
  repeat: "🔁", audio: "🔊", hash: "🔟", eye: "👁️", camera: "📸",
  grid: "🔢", flag: "🚩", puzzle: "🧩", snake: "🐍", help: "❓",
  graduation: "🎓", mountain: "🏔️", type: "🔤", calendar: "📅",
  infinity: "♾️", moon: "🌙", sun: "🌅", "calendar-check": "📅",
};

export default function AchievementsPage() {
  const { achievements } = usePlay();
  const [cat, setCat] = useState("all");
  const [rarity, setRarity] = useState("all");
  const [tab, setTab] = useState<"all" | "unlocked" | "locked">("all");

  const unlocked = ACHIEVEMENTS.filter((a) => achievements[a.id]?.unlockedAt);
  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  const list = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (rarity !== "all" && a.rarity !== rarity) return false;
      const un = !!achievements[a.id]?.unlockedAt;
      if (tab === "unlocked" && !un) return false;
      if (tab === "locked" && un) return false;
      return true;
    });
  }, [cat, rarity, tab, achievements]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <h1 className="text-2xl font-black tracking-tight text-[#102e67]">Achievements</h1>
      <p className="text-sm text-slate-500">{unlocked.length} of {ACHIEVEMENTS.length} unlocked · {pct}% complete</p>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "unlocked", "locked"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-4 py-1.5 text-xs font-black capitalize", tab === t ? "bg-[#102e67] text-white" : "border border-slate-200 bg-white text-slate-500")}>
            {t}
          </button>
        ))}
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold" aria-label="Filter by category">
          <option value="all">All categories</option>
          {[...new Set(ACHIEVEMENTS.map((a) => a.category))].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold" aria-label="Filter by rarity">
          <option value="all">All rarities</option>
          {["common", "uncommon", "rare", "epic", "legendary"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <AchievementCard key={a.id} def={a} unlockedAt={achievements[a.id]?.unlockedAt ?? null} progress={achievements[a.id]?.progress ?? 0} />
        ))}
      </div>
      {list.length === 0 && <p className="mt-6 rounded-xl bg-white p-8 text-center text-sm text-slate-400">Nothing here yet — play games to start unlocking.</p>}
    </div>
  );
}

function AchievementCard({ def, unlockedAt, progress }: { def: AchievementDef; unlockedAt: number | null; progress: number }) {
  const pct = Math.min(100, Math.round((progress / Math.max(1, def.target)) * 100));
  const hidden = def.hidden && !unlockedAt;
  return (
    <div className={cn("rounded-2xl border p-4", unlockedAt ? "border-amber-200 bg-amber-50/50" : "border-slate-200 bg-white opacity-90")}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f2f7ff] text-2xl" aria-hidden>
          {hidden ? "❔" : ICONS[def.icon] ?? "🏆"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#102e67]">{hidden ? "Hidden achievement" : def.title}</p>
          <p className="text-xs text-slate-500">{hidden ? "Keep playing to discover it." : def.description}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black capitalize", RARITY_STYLE[def.rarity])}>{def.rarity}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">+{def.xp} XP</span>
            {unlockedAt && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">✓ {new Date(unlockedAt).toLocaleDateString()}</span>}
          </div>
          {!unlockedAt && !hidden && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-0.5 text-[10px] font-bold tabular-nums text-slate-400">{Math.min(progress, def.target)}/{def.target}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

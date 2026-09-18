"use client";
// Statistics center — personal totals, per-game stats, records, session chart.

import React, { useMemo } from "react";
import Link from "next/link";
import { usePlay } from "@/components/play/PlayProvider";
import { GAMES, GAME_MAP } from "@/lib/play/registry";
import { levelProgress } from "@/lib/play/xp";
import { Sparkline, StatBlock, XpBar } from "@/components/play/charts";
import { ACHIEVEMENTS } from "@/lib/play/achievements";

export default function StatsPage() {
  const { stats, sessions, achievements, level } = usePlay();
  const prog = levelProgress(stats.xp);
  const unlocked = Object.values(achievements).filter((a) => a.unlockedAt).length;

  const mostPlayed = useMemo(() => {
    const entries = Object.entries(stats.perGamePlays).filter(([k]) => !k.includes("_"));
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [stats]);

  const favorite = stats.favorites[0];
  const last14 = useMemo(() => {
    const days: number[] = Array(14).fill(0);
    const now = Date.now();
    for (const s of sessions) {
      const d = Math.floor((now - s.endedAt) / 86400000);
      if (d >= 0 && d < 14) days[13 - d] += 1;
    }
    return days;
  }, [sessions]);

  const records = useMemo(
    () =>
      [
        { label: "Fastest reaction", value: stats.perGameBest["reaction"] !== undefined ? `${stats.perGameBest["reaction"]}ms` : "—", game: "reaction" },
        { label: "Highest typing WPM", value: stats.perGameBest["typing"] ?? "—", game: "typing" },
        { label: "Highest Snake score", value: stats.perGameBest["snake"] ?? "—", game: "snake" },
        { label: "Best Merge 2048 tile", value: stats.perGameBest["merge"] ?? "—", game: "merge" },
        { label: "Best Memory score", value: stats.perGameBest["memory"] ?? "—", game: "memory" },
        { label: "Best Math Rush", value: stats.perGameBest["math"] ?? "—", game: "math" },
        { label: "Best Nepal score", value: stats.perGameBest["nepal"] ?? "—", game: "nepal" },
        { label: "Best Sequence round", value: stats.perGameBest["sequence"] ?? "—", game: "sequence" },
      ],
    [stats],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <h1 className="text-2xl font-black tracking-tight text-[#102e67]">Your statistics</h1>
      <p className="text-sm text-slate-500">Everything below is local to this device — your personal records.</p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <XpBar into={prog.into} need={prog.need} level={prog.level} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatBlock label="Level" value={`${level}`} sub={`${stats.xp} total XP`} />
        <StatBlock label="Play time" value={`${Math.floor(stats.totalPlayMs / 60000)}m`} sub={`${stats.sessions} sessions`} />
        <StatBlock label="Completed" value={`${stats.completed}`} sub={`${stats.sessions - stats.completed} casual`} />
        <StatBlock label="Streak" value={`${stats.currentStreak}d`} sub={`longest ${stats.longestStreak}d`} />
        <StatBlock label="Most played" value={mostPlayed ? GAME_MAP[mostPlayed[0]]?.title ?? mostPlayed[0] : "—"} sub={mostPlayed ? `${mostPlayed[1]} plays` : "play something!"} />
        <StatBlock label="Favorite" value={favorite ? GAME_MAP[favorite]?.title ?? favorite : "—"} sub={favorite ? "pinned ♥" : "pin games with ♥"} />
        <StatBlock label="Achievements" value={`${unlocked}/${ACHIEVEMENTS.length}`} sub={`${Math.round((unlocked / ACHIEVEMENTS.length) * 100)}% complete`} />
        <StatBlock label="Games tried" value={`${Object.keys(stats.perGamePlays).filter((k) => !k.includes("_")).length}/20`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#102e67]">Sessions — last 14 days</h2>
          <div className="mt-2"><Sparkline values={last14} width={420} height={64} /></div>
          <h2 className="mt-4 text-sm font-black uppercase tracking-wider text-[#102e67]">Recent sessions</h2>
          {sessions.length === 0 ? (
            <p className="mt-2 rounded-xl bg-slate-50 p-4 text-center text-[13px] text-slate-400">No sessions yet. Play a game!</p>
          ) : (
            <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
              {sessions.slice(0, 20).map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-1.5 text-xs">
                  <Link href={`/play/${s.gameId}`} className="font-black text-[#102e67] hover:underline">{GAME_MAP[s.gameId]?.title ?? s.gameId}</Link>
                  <span className="tabular-nums text-slate-500">{s.score} pts · {Math.round(s.durationMs / 1000)}s</span>
                  <span className="ml-auto text-slate-400">{new Date(s.endedAt).toLocaleDateString()} {s.completed ? "✓" : ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#102e67]">Personal records (this device)</h2>
          <ul className="mt-2 space-y-1.5">
            {records.map((r) => (
              <li key={r.label} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="font-bold text-slate-500">{r.label}</span>
                <span className="ml-auto font-black tabular-nums text-[#102e67]">{r.value}</span>
                <Link href={`/play/${r.game}`} className="text-xs font-black text-blue-700 hover:underline">Play</Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-4 text-sm font-black uppercase tracking-wider text-[#102e67]">Per-game plays</h2>
          <ul className="mt-2 space-y-1">
            {GAMES.map((g) => {
              const plays = stats.perGamePlays[g.id] ?? 0;
              const max = Math.max(1, ...GAMES.map((x) => stats.perGamePlays[x.id] ?? 0));
              return (
                <li key={g.id} className="flex items-center gap-2 text-xs">
                  <span className="w-32 truncate font-bold text-slate-500">{g.title}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span className="block h-full rounded-full bg-blue-500" style={{ width: `${(plays / max) * 100}%` }} />
                  </span>
                  <span className="w-10 text-right font-black tabular-nums text-[#102e67]">{plays}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

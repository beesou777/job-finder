"use client";
// Daily challenges — deterministic per date, completion, streak.

import React, { useMemo } from "react";
import Link from "next/link";
import { CalendarCheck2, Flame } from "lucide-react";
import { usePlay } from "@/components/play/PlayProvider";
import { getDailyChallenges } from "@/lib/play/daily";
import { todayKey } from "@/lib/play/storage";
import { GAME_MAP } from "@/lib/play/registry";

function shift(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${`${dt.getUTCMonth() + 1}`.padStart(2, "0")}-${`${dt.getUTCDate()}`.padStart(2, "0")}`;
}

export default function DailyPage() {
  const { dailyDone, stats, playSound } = usePlay();
  const today = todayKey();
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => shift(today, i - 3)), [today]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#102e67]">
        <CalendarCheck2 className="h-6 w-6 text-blue-600" /> Daily challenges
      </h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <Flame className="h-4 w-4 text-orange-500" /> {stats.currentStreak}-day streak · longest {stats.longestStreak} days.
        Same challenges for everyone, every day — no account needed.
      </p>

      <div className="mt-4 grid gap-3">
        {days.map((day) => {
          const list = getDailyChallenges(day);
          const done = dailyDone[day] ?? [];
          const isToday = day === today;
          const isPast = day < today;
          return (
            <div key={day} className={`rounded-2xl border p-4 ${isToday ? "border-blue-300 bg-white shadow-[0_10px_30px_rgba(31,78,140,.1)]" : "border-slate-200 bg-white/70"}`}>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {isToday ? `Today · ${day}` : isPast ? `Past · ${day}` : `Upcoming · ${day}`}
                {done.length > 0 && <span className="ml-2 text-emerald-600">✓ {done.length}/{list.length}</span>}
              </p>
              <div className="mt-2 space-y-2">
                {list.map((c) => {
                  const finished = done.includes(c.id);
                  const locked = day > today;
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${finished ? "bg-emerald-100" : "bg-blue-50"}`} aria-hidden>
                        {finished ? "✓" : "🎯"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-[#102e67]">{c.title}</p>
                        <p className="truncate text-xs text-slate-400">{c.detail} · +{c.xp} XP · {GAME_MAP[c.gameId]?.title}</p>
                      </div>
                      {isToday && !finished && (
                        <Link href={`/play/${c.gameId}`} onClick={() => playSound("click")} className="shrink-0 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-black text-white">
                          Play
                        </Link>
                      )}
                      {locked && <span className="text-[11px] font-bold text-slate-300">Unlocks {day}</span>}
                    </div>
                  );
                })}
              </div>
              {isToday && done.length === list.length && (
                <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-black text-emerald-700" role="status">
                  🎉 All daily challenges complete! Come back tomorrow.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

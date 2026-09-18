"use client";
// KamKhoj Play home — hero, continue playing, daily, featured, categories,
// recommendations, achievements preview, level/XP, stats, favorites, quick play.

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck2, ChevronRight, Clock3, Flame, Heart, Play, Search,
  Sparkles, Star, Trophy,
} from "lucide-react";
import { usePlay } from "@/components/play/PlayProvider";
import { GAMES, PLAY_CATEGORIES, GAME_MAP } from "@/lib/play/registry";
import { getDailyChallenges } from "@/lib/play/daily";
import { todayKey } from "@/lib/play/storage";
import { levelProgress } from "@/lib/play/xp";
import { ACHIEVEMENTS } from "@/lib/play/achievements";
import { XpBar } from "@/components/play/charts";
import { cn } from "@/lib/utils";

const GAME_EMOJI: Record<string, string> = {
  reaction: "⚡", typing: "⌨️", snake: "🐍", merge: "🔢", memory: "🃏",
  sudoku: "🧩", math: "➗", scramble: "🔀", hangman: "🪢", color: "🎨",
  aim: "🎯", sequence: "🔔", "number-memory": "🔟", "visual-memory": "👁️",
  nepal: "🏔️", quiz: "❓", tictactoe: "⭕", connect4: "🔴", minesweeper: "💣", sliding: "🧱",
};

export default function PlayHome() {
  const { ready, profile, stats, achievements, saves, dailyDone, toggleFavorite, playSound, level } = usePlay();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState("recommended");

  const today = todayKey();
  const challenges = useMemo(() => getDailyChallenges(today), [today]);
  const doneToday = dailyDone[today] ?? [];
  const prog = levelProgress(stats.xp);
  const unlockedCount = Object.values(achievements).filter((a) => a.unlockedAt).length;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = GAMES.filter((g) =>
      (!needle || g.title.toLowerCase().includes(needle) || g.tagline.toLowerCase().includes(needle)) &&
      (cat === "all" || g.category.includes(cat as never)),
    );
    const plays = (id: string) => stats.perGamePlays[id] ?? 0;
    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "recent") list = [...list].sort((a, b) => (stats.lastPlayedAt[b.id] ?? 0) - (stats.lastPlayedAt[a.id] ?? 0));
    else if (sort === "most") list = [...list].sort((a, b) => plays(b.id) - plays(a.id));
    else {
      // recommended: favorites + recent + unplayed discovery
      list = [...list].sort((a, b) => {
        const score = (g: (typeof GAMES)[number]) =>
          (stats.favorites.includes(g.id) ? 100 : 0) + Math.min(20, plays(g.id) * 2) + (plays(g.id) === 0 ? 8 : 0);
        return score(b) - score(a);
      });
    }
    return list;
  }, [q, cat, sort, stats]);

  const recommended = useMemo(() => {
    const unplayed = GAMES.filter((g) => !(stats.perGamePlays[g.id] ?? 0));
    const favs = GAMES.filter((g) => stats.favorites.includes(g.id));
    const recent = stats.recentGameIds.map((id) => GAME_MAP[id]).filter(Boolean).slice(0, 4);
    const seen = new Set<string>();
    const out: typeof GAMES = [];
    for (const g of [...favs, ...recent, ...unplayed, ...GAMES]) {
      if (!seen.has(g.id)) { seen.add(g.id); out.push(g); }
      if (out.length >= 4) break;
    }
    return out;
  }, [stats]);

  const resumable = useMemo(
    () => Object.values(saves).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [saves],
  );

  const featured = useMemo(() => {
    const h = Number(today.replaceAll("-", "")) || 0;
    return GAMES[h % GAMES.length];
  }, [today]);

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500">Loading your Play profile…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      {/* hero */}
      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[.14em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" /> KamKhoj Play
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#102e67] sm:text-3xl">
              Hey {profile.nickname} — pick a game and play.
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              20 free games that run entirely in your browser. Earn XP, unlock achievements,
              and come back tomorrow for fresh daily challenges. No account needed.
            </p>
            <div className="mt-3 max-w-md">
              <XpBar into={prog.into} need={prog.need} level={prog.level} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <QuickStat icon={<Flame className="h-3.5 w-3.5" />} label={`${stats.currentStreak}-day streak`} />
              <QuickStat icon={<Trophy className="h-3.5 w-3.5" />} label={`${unlockedCount}/${ACHIEVEMENTS.length} achievements`} />
              <QuickStat icon={<Clock3 className="h-3.5 w-3.5" />} label={`${Math.round(stats.totalPlayMs / 60000)} min played`} />
            </div>
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-[#f6faff] p-4 lg:w-80">
            <p className="text-[11px] font-black uppercase tracking-[.14em] text-slate-400">Today&apos;s challenge</p>
            <div className="mt-2 space-y-2">
              {challenges.map((c) => {
                const done = doneToday.includes(c.id);
                return (
                  <Link key={c.id} href={`/play/${c.gameId}`} onClick={() => playSound("click")}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2 hover:border-blue-300">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-sm", done ? "bg-emerald-100" : "bg-blue-50")}>
                      {done ? "✓" : <CalendarCheck2 className="h-4 w-4 text-blue-600" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-extrabold text-[#102e67]">{c.title}</span>
                      <span className="block text-[11px] text-slate-400">+{c.xp} XP</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </Link>
                );
              })}
            </div>
            <Link href="/play/daily" className="mt-2 block text-center text-xs font-black text-blue-700 hover:underline">
              View all daily challenges
            </Link>
          </div>
        </div>
      </section>

      {/* continue + featured */}
      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SectionHead title="Continue playing" href={resumable.length ? undefined : "/play"} />
          {resumable.length === 0 ? (
            <Empty text="Resumable runs (2048, Sudoku, Sliding) will appear here." />
          ) : (
            <div className="mt-2 space-y-2">
              {resumable.map((s) => (
                <Link key={s.gameId} href={`/play/${s.gameId}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 hover:border-blue-300">
                  <span className="text-2xl" aria-hidden>{GAME_EMOJI[s.gameId] ?? "🎮"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-[#102e67]">{GAME_MAP[s.gameId]?.title ?? s.gameId}</span>
                    <span className="block truncate text-[11px] text-slate-400">{s.label} · {rel(s.updatedAt)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white"><Play className="h-3 w-3" />Resume</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
          <SectionHead title="Featured game" />
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl" aria-hidden>{GAME_EMOJI[featured.id]}</span>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-[#102e67]">{featured.title}</p>
              <p className="truncate text-xs text-slate-500">{featured.tagline}</p>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-[13px] text-slate-500">{featured.description}</p>
          <Link href={`/play/${featured.id}`} onClick={() => playSound("click")}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#102e67] px-4 py-2 text-xs font-black text-white hover:bg-blue-700">
            <Play className="h-3.5 w-3.5" /> Play now
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SectionHead title="Recommended for you" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            {recommended.map((g) => (
              <Link key={g.id} href={`/play/${g.id}`} className="rounded-xl border border-slate-100 p-2.5 hover:border-blue-300">
                <span className="text-2xl" aria-hidden>{GAME_EMOJI[g.id]}</span>
                <span className="mt-1 block truncate text-[13px] font-extrabold text-[#102e67]">{g.title}</span>
                <span className="block truncate text-[11px] text-slate-400">{(stats.perGamePlays[g.id] ?? 0)} plays</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* discovery */}
      <section className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search 20 games… (try “memory” or “nepal”)"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold outline-none focus:border-blue-400"
              aria-label="Search games"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600" aria-label="Sort games">
            <option value="recommended">Recommended</option>
            <option value="recent">Recently played</option>
            <option value="most">Your most played</option>
            <option value="az">A–Z</option>
          </select>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Categories">
          {PLAY_CATEGORIES.map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}
              className={cn("whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-black", cat === c.id ? "bg-[#102e67] text-white" : "border border-slate-200 bg-white text-slate-500 hover:border-blue-300")}>
              {c.label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <Empty text="No games match. Clear the search or pick another category." />
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((g) => {
              const fav = stats.favorites.includes(g.id);
              const plays = stats.perGamePlays[g.id] ?? 0;
              const best = stats.perGameBest[g.id];
              return (
                <article key={g.id} className="group flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_14px_30px_rgba(31,78,140,.1)]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f2f7ff] text-2xl" aria-hidden>
                    {GAME_EMOJI[g.id]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <h3 className="truncate text-[15px] font-black text-[#102e67]">{g.title}</h3>
                      <button
                        onClick={() => { toggleFavorite(g.id); playSound("click"); }}
                        aria-label={fav ? `Remove ${g.title} from favorites` : `Add ${g.title} to favorites`}
                        aria-pressed={fav}
                        className={cn("ml-auto shrink-0 rounded-lg p-1.5", fav ? "text-red-500" : "text-slate-300 hover:text-red-400")}
                      >
                        <Heart className={cn("h-4 w-4", fav && "fill-current")} />
                      </button>
                    </div>
                    <p className="truncate text-xs text-slate-500">{g.tagline}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                      <span>~{g.minutes} min</span>·<span>{plays} plays</span>
                      {best !== undefined && <span className="inline-flex items-center gap-0.5 text-amber-600"><Star className="h-3 w-3" />{best}</span>}
                    </p>
                    <Link href={`/play/${g.id}`} onClick={() => playSound("click")}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-black text-white group-hover:bg-blue-700">
                      <Play className="h-3 w-3" /> Quick play
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* favorites + level strip */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SectionHead title={`Your favorites (${stats.favorites.length})`} />
          {stats.favorites.length === 0 ? (
            <Empty text="Tap the heart on any game to pin it here." />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.favorites.map((id) => (
                <Link key={id} href={`/play/${id}`} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-[#102e67] hover:border-blue-300">
                  <span aria-hidden>{GAME_EMOJI[id]}</span> {GAME_MAP[id]?.title ?? id}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <SectionHead title="Your level" href="/play/stats" />
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102e67] text-xl font-black text-white">{level}</span>
            <div className="flex-1">
              <XpBar into={prog.into} need={prog.need} level={prog.level} />
              <p className="mt-1 text-[11px] text-slate-400">
                {stats.sessions} sessions · {stats.completed} completed · best streak {stats.longestStreak}d · {unlockedCount} achievements · press <kbd className="rounded border px-1">Ctrl K</kbd> for commands
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-sm font-black uppercase tracking-wider text-[#102e67]">{title}</h2>
      {href && (
        <Link href={href} className="ml-auto inline-flex items-center gap-0.5 text-xs font-black text-blue-700 hover:underline">
          View <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function QuickStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2f7ff] px-3 py-1.5 text-xs font-black text-[#102e67]">
      <span className="text-blue-600">{icon}</span> {label}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-2 rounded-xl bg-slate-50 px-3 py-5 text-center text-[13px] text-slate-400">{text}</p>;
}

function rel(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60000) return "just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
  return `${Math.floor(d / 86400000)}d ago`;
}

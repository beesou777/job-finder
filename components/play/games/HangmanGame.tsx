"use client";
// Hangman — original SVG gallows, 6 categories, hints, difficulties.

import React, { useCallback, useMemo, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { HANGMAN_WORDS } from "@/lib/play/data";

const CATS = ["All", "General", "Technology", "Countries", "Movies", "Sports", "Nepal"];
const MAX_WRONG: Record<string, number> = { easy: 8, medium: 6, hard: 5 };
type Diff = keyof typeof MAX_WRONG;

function Gallows({ wrong }: { wrong: number }) {
  const parts = [
    <circle key="h" cx={70} cy={30} r={10} />,
    <line key="b" x1={70} y1={40} x2={70} y2={70} />,
    <line key="la" x1={70} y1={48} x2={55} y2={60} />,
    <line key="ra" x1={70} y1={48} x2={85} y2={60} />,
    <line key="ll" x1={70} y1={70} x2={58} y2={90} />,
    <line key="rl" x1={70} y1={70} x2={82} y2={90} />,
    <circle key="e1" cx={66} cy={28} r={1.2} />,
    <circle key="e2" cx={74} cy={28} r={1.2} />,
  ];
  return (
    <svg viewBox="0 0 120 105" className="h-36 w-32" role="img" aria-label={`Gallows, ${wrong} wrong guesses`}>
      <line x1={10} y1={100} x2={60} y2={100} stroke="#102e67" strokeWidth={4} strokeLinecap="round" />
      <line x1={30} y1={100} x2={30} y2={8} stroke="#102e67" strokeWidth={4} strokeLinecap="round" />
      <line x1={30} y1={8} x2={70} y2={8} stroke="#102e67" strokeWidth={4} strokeLinecap="round" />
      <line x1={70} y1={8} x2={70} y2={18} stroke="#102e67" strokeWidth={3} />
      <g stroke="#e5484d" strokeWidth={3.5} strokeLinecap="round" fill="none">
        {parts.slice(0, Math.min(wrong, parts.length))}
      </g>
    </svg>
  );
}

export default function HangmanGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [cat, setCat] = useState("All");
  const [diff, setDiff] = useState<Diff>("medium");
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * HANGMAN_WORDS.length));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [hintUsed, setHintUsed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(Date.now());

  const pool = useMemo(() => HANGMAN_WORDS.map((w, i) => ({ ...w, i })).filter((w) => cat === "All" || w.category === cat), [cat]);
  const entry = HANGMAN_WORDS[idx % HANGMAN_WORDS.length];
  const word = entry.word.replace(/[^A-Z]/g, "");
  const wrong = [...guessed].filter((l) => !word.includes(l)).length;
  const maxWrong = MAX_WRONG[diff];
  const revealed = word.split("").every((l) => guessed.has(l));
  const dead = wrong >= maxWrong;

  const newRound = useCallback((c: string, d: Diff, keepStreak = true) => {
    const p = HANGMAN_WORDS.map((w, i) => ({ ...w, i })).filter((w) => c === "All" || w.category === c);
    setCat(c); setDiff(d);
    setIdx(p[Math.floor(Math.random() * p.length)].i);
    setGuessed(new Set());
    setHintUsed(false);
    setPaused(false);
    setResult(null);
    if (!keepStreak) setStreak(0);
    startRef.current = Date.now();
  }, []);

  const end = (won: boolean, g: Set<string>) => {
    const w = [...g].filter((l) => !word.includes(l)).length;
    const score = won ? Math.max(10, word.length * 12 - w * 8 - (hintUsed ? 10 : 0)) : 0;
    const { xpGained } = recordResult({
      gameId: "hangman", score, completed: won, durationMs: Date.now() - startRef.current,
      meta: { wrong: w, streak: won ? streak + 1 : 0 },
    });
    if (won) { setStreak((s) => s + 1); playSound("success"); }
    else { setStreak(0); playSound("gameover"); }
    setResult({
      title: won ? `Solved: ${word}` : `The word was ${word}`,
      subtitle: won ? `${w} wrong ${w === 1 ? "guess" : "guesses"} · streak ×${streak + 1}` : "Better luck next round.",
      xpGained,
    });
  };

  const guess = (letter: string) => {
    if (paused || result || revealed || dead || guessed.has(letter)) return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);
    playSound(word.includes(letter) ? "flip" : "error");
    const w = [...next].filter((l) => !word.includes(l)).length;
    const win = word.split("").every((l) => next.has(l));
    if (win || w >= maxWrong) window.setTimeout(() => end(win, next), 350);
  };

  const hint = () => {
    if (hintUsed || result) return;
    const missing = word.split("").find((l) => !guessed.has(l));
    if (missing) {
      setHintUsed(true);
      guess(missing);
    }
  };

  // physical keyboard
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const k = e.key.toUpperCase();
      if (/^[A-Z]$/.test(k)) guess(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessed, paused, result, word, maxWrong]);

  const best = stats.perGameBest["hangman"];

  return (
    <GameShell
      gameId="hangman" score={streak} best={typeof best === "number" ? best : null}
      timerLabel={`${maxWrong - wrong} tries left`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => newRound(cat, diff, false)} result={result}
      onShareText={result ? `I'm on a ×${streak} Hangman streak on KamKhoj Play.` : undefined}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button key={c} onClick={() => newRound(c, diff)} className={`rounded-lg px-3 py-1 text-xs font-black ${cat === c ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{c}</button>
        ))}
      </div>
      <div className="mb-3 flex gap-1.5">
        {(Object.keys(MAX_WRONG) as Diff[]).map((d) => (
          <button key={d} onClick={() => newRound(cat, d)} className={`rounded-lg px-3 py-1 text-xs font-bold capitalize ${diff === d ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>{d} ({MAX_WRONG[d]} tries)</button>
        ))}
        <button onClick={() => newRound(cat, diff)} className="ml-auto rounded-lg border border-slate-200 px-3 py-1 text-xs font-black text-slate-500">New word</button>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-[#f8fbff] p-4 sm:flex-row sm:gap-6">
        <Gallows wrong={wrong} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-[11px] font-black uppercase tracking-[.2em] text-slate-400">{entry.category}</p>
          <p className="mt-1 font-mono text-3xl font-black tracking-[.25em] text-[#102e67]" aria-label={revealed || dead ? word : "Hidden word progress"}>
            {word.split("").map((l, i) => <span key={i}>{guessed.has(l) ? l : "_"}</span>)}
          </p>
          <p className="mt-1 text-sm text-slate-500">💡 {hintUsed || revealed || dead ? entry.hint : "Use a hint to reveal a letter (−score)."}</p>
          <div className="mt-2 flex justify-center gap-2 sm:justify-start">
            <button onClick={hint} disabled={hintUsed} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500 disabled:opacity-40">Hint</button>
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">Streak ×{streak}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5 sm:grid-cols-9" role="group" aria-label="Letter grid">
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => {
          const used = guessed.has(l);
          const good = used && word.includes(l);
          return (
            <button
              key={l} onClick={() => guess(l)} disabled={used}
              aria-label={`Letter ${l}${used ? (good ? ", correct" : ", wrong") : ""}`}
              className={`flex h-11 items-center justify-center rounded-lg font-mono text-base font-black ${used ? (good ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-300") : "bg-[#102e67] text-white hover:bg-[#1a3c7a]"}`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}

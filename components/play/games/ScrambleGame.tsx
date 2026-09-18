"use client";
// Word Scramble — 7 categories, hints, skips, timer, streaks.

import React, { useCallback, useMemo, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { SCRAMBLE_WORDS } from "@/lib/play/data";
import { scrambleWord } from "@/lib/play/logic";

const CATS = ["All", "General", "Technology", "Animals", "Countries", "Food", "Sports", "Nepal"];
const ROUND_SECONDS = 120;

export default function ScrambleGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [cat, setCat] = useState("All");
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SCRAMBLE_WORDS.length));
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [solves, setSolves] = useState(0);
  const [skips, setSkips] = useState(0);
  const [streak, setStreak] = useState(0);
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(Date.now());
  const timer = useRef<number | null>(null);

  const pool = useMemo(() => SCRAMBLE_WORDS.map((w, i) => ({ ...w, i })).filter((w) => cat === "All" || w.category === cat), [cat]);
  const word = SCRAMBLE_WORDS[idx % SCRAMBLE_WORDS.length];
  const scrambled = useMemo(() => scrambleWord(word.word, Math.random), [word.word]);

  const stop = () => { if (timer.current) { window.clearInterval(timer.current); timer.current = null; } };

  const finish = useCallback(() => {
    stop();
    setRunning(false);
    const { xpGained } = recordResult({
      gameId: "scramble", score, completed: true, durationMs: Date.now() - startRef.current,
      meta: { solves, streak },
    });
    playSound(score > 0 ? "success" : "gameover");
    setResult({ title: `${score} points`, subtitle: `${solves} solved · ${skips} skipped · best streak ×${streak}`, xpGained });
  }, [score, solves, skips, streak, recordResult, playSound]);

  const start = (c: string) => {
    setCat(c);
    const p = SCRAMBLE_WORDS.map((w, i) => ({ ...w, i })).filter((w) => c === "All" || w.category === c);
    const first = p[Math.floor(Math.random() * p.length)];
    setIdx(first.i);
    setGuess(""); setScore(0); setSolves(0); setSkips(0); setStreak(0);
    setLeft(ROUND_SECONDS); setRunning(true); setPaused(false); setResult(null);
    setHintShown(false); setFeedback(null);
    startRef.current = Date.now();
    stop();
    timer.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { window.setTimeout(() => finishRef.current(), 0); return 0; }
        return l - 1;
      });
    }, 1000);
    playSound("click");
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  React.useEffect(() => stop, []);
  React.useEffect(() => {
    if (paused && timer.current) { window.clearInterval(timer.current); timer.current = null; }
    if (!paused && running && !timer.current && !result) {
      timer.current = window.setInterval(() => {
        setLeft((l) => {
          if (l <= 1) { window.setTimeout(() => finishRef.current(), 0); return 0; }
          return l - 1;
        });
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const nextWord = () => {
    const next = pool[Math.floor(Math.random() * pool.length)];
    setIdx(next.i);
    setGuess("");
    setHintShown(false);
    setFeedback(null);
  };

  const submit = () => {
    if (!running || paused || result) return;
    if (guess.trim().toUpperCase() === word.word) {
      const pts = word.word.length * 10 + (hintShown ? 0 : 5) + Math.min(20, streak * 2);
      setScore((s) => s + pts);
      setSolves((s) => s + 1);
      setStreak((s) => s + 1);
      setFeedback(`Correct! +${pts}`);
      playSound("pop");
      window.setTimeout(nextWord, 450);
    } else {
      setFeedback("Not quite — try again.");
      setStreak(0);
      playSound("error");
    }
  };

  const skip = () => {
    setSkips((s) => s + 1);
    setStreak(0);
    playSound("click");
    nextWord();
  };

  const best = stats.perGameBest["scramble"];

  return (
    <GameShell
      gameId="scramble" score={score} best={typeof best === "number" ? best : null} timerLabel={`${left}s`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => start(cat)} result={result}
      onShareText={result ? `I solved ${solves} scrambles (${score} pts) on KamKhoj Word Scramble.` : undefined}
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button key={c} onClick={() => start(c)} className={`rounded-lg px-3 py-1 text-xs font-black ${cat === c && running ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{c}</button>
        ))}
      </div>
      {!running && !result ? (
        <button onClick={() => start(cat)} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Start unscrambling</button>
      ) : !result ? (
        <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-5 text-center">
          <p className="text-[11px] font-black uppercase tracking-[.2em] text-slate-400">{word.category} · {word.word.length} letters</p>
          <p className="mt-2 font-mono text-4xl font-black tracking-[.18em] text-[#102e67]" aria-label={`Scrambled: ${scrambled}`}>{scrambled}</p>
          {hintShown && <p className="mt-2 text-sm text-amber-700">💡 {word.hint}</p>}
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mx-auto mt-4 flex max-w-sm gap-2">
            <input
              value={guess} onChange={(e) => setGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center font-mono text-xl font-black uppercase tracking-widest outline-none focus:border-blue-400"
              placeholder="YOUR GUESS" aria-label="Your guess" maxLength={16}
            />
            <button className="rounded-xl bg-[#102e67] px-5 font-black text-white">↵</button>
          </form>
          {feedback && <p className="mt-2 text-sm font-bold text-slate-500">{feedback}</p>}
          <div className="mt-3 flex justify-center gap-2">
            <button onClick={() => setHintShown(true)} disabled={hintShown} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-500 disabled:opacity-40">Hint</button>
            <button onClick={skip} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-500">Skip (resets streak)</button>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-400">Solved {solves} · streak ×{streak}</p>
        </div>
      ) : null}
    </GameShell>
  );
}

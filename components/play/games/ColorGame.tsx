"use client";
// Color Clash — Stroop game: match WORD or INK as the rule flips.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";

const COLORS = [
  { name: "RED", hex: "#e5484d" },
  { name: "BLUE", hex: "#1769e8" },
  { name: "GREEN", hex: "#22a06b" },
  { name: "YELLOW", hex: "#d9a400" },
  { name: "PURPLE", hex: "#7c3aed" },
  { name: "ORANGE", hex: "#ea580c" },
];
type Rule = "word" | "ink";
const ROUND_MS = 30000;

export default function ColorGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [word, setWord] = useState(0);
  const [ink, setInk] = useState(1);
  const [rule, setRule] = useState<Rule>("word");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [left, setLeft] = useState(ROUND_MS / 1000);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const reactionTimes = useRef<number[]>([]);
  const shownAt = useRef(Date.now());
  const startRef = useRef(Date.now());

  const deal = useCallback((level: number) => {
    let w = Math.floor(Math.random() * COLORS.length);
    let k = Math.floor(Math.random() * COLORS.length);
    if (Math.random() < 0.5) {
      // force mismatch sometimes
      while (k === w) k = Math.floor(Math.random() * COLORS.length);
    }
    setWord(w);
    setInk(k);
    // rule flips occasionally at higher scores
    if (level >= 8 && Math.random() < 0.22) {
      setRule((r) => {
        const next: Rule = r === "word" ? "ink" : "word";
        playSound("flip");
        return next;
      });
    }
    shownAt.current = Date.now();
  }, [playSound]);

  const finish = useCallback(() => {
    setRunning(false);
    const avg = reactionTimes.current.length ? Math.round(reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length) : 0;
    const { xpGained } = recordResult({
      gameId: "color", score, completed: true, durationMs: Date.now() - startRef.current,
      meta: { correct, wrong, avgMs: avg },
    });
    playSound(score >= 12 ? "success" : "gameover");
    setResult({ title: `${score} points`, subtitle: `${correct} correct · ${wrong} wrong · avg ${avg}ms`, xpGained });
  }, [score, correct, wrong, recordResult, playSound]);

  const finishRef = useRef(finish);
  finishRef.current = finish;

  const start = () => {
    setScore(0); setCombo(0); setCorrect(0); setWrong(0);
    setLeft(ROUND_MS / 1000); setRunning(true); setPaused(false); setResult(null);
    setRule(Math.random() < 0.5 ? "word" : "ink");
    reactionTimes.current = [];
    startRef.current = Date.now();
    deal(0);
    playSound("click");
  };

  useEffect(() => {
    if (!running || paused || result) return;
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 0.2) { window.setTimeout(() => finishRef.current(), 0); return 0; }
        return Math.round((l - 0.2) * 10) / 10;
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [running, paused, result]);

  const pick = (i: number) => {
    if (!running || paused || result) return;
    const target = rule === "word" ? word : ink;
    reactionTimes.current.push(Date.now() - shownAt.current);
    if (i === target) {
      const c = combo + 1;
      setCombo(c);
      setCorrect((x) => x + 1);
      setScore((s) => s + 1 + Math.floor(c / 4));
      setFlash("ok");
      playSound("pop");
    } else {
      setCombo(0);
      setWrong((x) => x + 1);
      setFlash("bad");
      playSound("error");
    }
    window.setTimeout(() => setFlash(null), 150);
    deal(score);
  };

  const best = stats.perGameBest["color"];

  return (
    <GameShell
      gameId="color" score={score} best={typeof best === "number" ? best : null} timerLabel={`${Math.ceil(left)}s`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={start} result={result}
      onShareText={result ? `I scored ${score} in KamKhoj Color Clash. My brain hurts.` : undefined}
    >
      {!running && !result ? (
        <button onClick={start} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Start Color Clash</button>
      ) : !result ? (
        <div className={`rounded-2xl border-2 p-5 text-center ${flash === "ok" ? "border-emerald-400" : flash === "bad" ? "border-red-300" : "border-slate-100"}`}>
          <p className="inline-block rounded-full bg-[#102e67] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
            Rule: tap the {rule === "word" ? "WORD meaning" : "INK color"}
          </p>
          <p className="mt-4 font-mono text-6xl font-black tracking-wide" style={{ color: COLORS[ink].hex }} aria-label={`The word ${COLORS[word].name} shown in color`}>
            {COLORS[word].name}
          </p>
          <p className="mt-1 text-xs font-bold text-slate-400">Don&apos;t read — follow the rule. Combo ×{combo}</p>
          <div className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-2">
            {COLORS.map((c, i) => (
              <button
                key={c.name} onClick={() => pick(i)}
                aria-label={c.name}
                className="flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-[#102e67] hover:border-blue-300 active:scale-95"
              >
                <span className="h-5 w-5 rounded-full" style={{ background: c.hex }} aria-hidden />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </GameShell>
  );
}

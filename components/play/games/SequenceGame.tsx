"use client";
// Sequence Memory — watch the light/tone pattern, repeat it. Visual-first.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";

const PADS = [
  { id: 0, color: "#e5484d", key: "1" },
  { id: 1, color: "#1769e8", key: "2" },
  { id: 2, color: "#22a06b", key: "3" },
  { id: 3, color: "#d9a400", key: "4" },
];

export default function SequenceGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [seq, setSeq] = useState<number[]>([]);
  const [input, setInput] = useState(0);
  const [showing, setShowing] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(Date.now());
  const seqRef = useRef<number[]>([]);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const showSeq = useCallback((s: number[]) => {
    setShowing(true);
    setLit(null);
    s.forEach((pad, i) => {
      const t = window.setTimeout(() => {
        setLit(pad);
        playSound("flip");
        const off = window.setTimeout(() => setLit(null), 320);
        timers.current.push(off);
      }, 500 + i * 560);
      timers.current.push(t);
    });
    const done = window.setTimeout(() => {
      setShowing(false);
      setInput(0);
    }, 500 + s.length * 560);
    timers.current.push(done);
  }, [playSound]);

  const start = () => {
    clearTimers();
    const first = [Math.floor(Math.random() * 4)];
    seqRef.current = first;
    setSeq(first);
    setRound(1);
    setRunning(true);
    setPaused(false);
    setResult(null);
    startRef.current = Date.now();
    playSound("click");
    showSeq(first);
  };

  const press = (pad: number) => {
    if (!running || showing || paused || result) return;
    playSound(pad === seqRef.current[input] ? "pop" : "error");
    if (pad !== seqRef.current[input]) {
      // fail
      const r = round;
      const { xpGained } = recordResult({
        gameId: "sequence", score: r, completed: r > 1, durationMs: Date.now() - startRef.current,
        meta: { round: r },
      });
      setRunning(false);
      setResult({ title: `Reached round ${r}`, subtitle: r >= 7 ? "Echo achievement territory!" : "Watch closely and try again.", xpGained });
      return;
    }
    const ni = input + 1;
    if (ni >= seqRef.current.length) {
      const next = [...seqRef.current, Math.floor(Math.random() * 4)];
      seqRef.current = next;
      setSeq(next);
      setRound(next.length);
      setInput(0);
      window.setTimeout(() => showSeq(next), 600);
    } else {
      setInput(ni);
    }
  };

  // keyboard 1-4
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0) press(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, showing, running, paused, result, round]);

  const best = stats.perGameBest["sequence"];

  return (
    <GameShell
      gameId="sequence" score={round} best={typeof best === "number" ? best : null} timerLabel={`Round ${round || "–"}`}
      paused={paused} onPause={() => { clearTimers(); setPaused(true); }} onResume={() => setPaused(false)}
      onRestart={start} result={result}
      onShareText={result ? `I reached round ${round} in KamKhoj Sequence Memory.` : undefined}
    >
      {!running && !result ? (
        <button onClick={start} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Start sequence</button>
      ) : (
        <>
          <p className="mb-3 text-center text-sm font-bold text-slate-500" aria-live="polite">
            {!result && (showing ? "Watch the pattern…" : "Your turn — repeat it!")}
          </p>
          <div className="mx-auto grid max-w-[360px] grid-cols-2 gap-3" role="group" aria-label="Sequence pads">
            {PADS.map((p) => (
              <button
                key={p.id}
                onClick={() => press(p.id)}
                aria-label={`Pad ${p.key}`}
                className="flex aspect-square items-center justify-center rounded-2xl text-2xl font-black text-white transition-all"
                style={{
                  background: p.color,
                  opacity: lit === p.id ? 1 : showing ? 0.45 : 0.85,
                  transform: lit === p.id ? "scale(1.05)" : "scale(1)",
                  boxShadow: lit === p.id ? `0 0 32px ${p.color}` : "none",
                }}
              >
                {p.key}
              </button>
            ))}
          </div>
        </>
      )}
    </GameShell>
  );
}

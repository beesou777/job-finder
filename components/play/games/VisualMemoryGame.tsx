"use client";
// Visual Memory — grid flashes highlighted cells; recall them. Grows by level.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";

function levelConfig(level: number): { size: number; count: number } {
  if (level <= 2) return { size: 3, count: 3 + (level - 1) };
  if (level <= 4) return { size: 4, count: 4 + (level - 3) };
  if (level <= 6) return { size: 5, count: 5 + (level - 5) };
  if (level <= 9) return { size: 6, count: 7 + (level - 7) };
  return { size: 7, count: 10 + Math.min(6, level - 10) };
}

type Phase = "idle" | "show" | "recall" | "done";

export default function VisualMemoryGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [level, setLevel] = useState(1);
  const [targets, setTargets] = useState<Set<number>>(new Set([0, 4, 8]));
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [lives] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(Date.now());
  const timer = useRef<number | null>(null);

  const cfg = levelConfig(level);

  const deal = useCallback((lv: number) => {
    if (timer.current) window.clearTimeout(timer.current);
    const { size, count } = levelConfig(lv);
    const total = size * size;
    const set = new Set<number>();
    while (set.size < Math.min(count, total)) set.add(Math.floor(Math.random() * total));
    setTargets(set);
    setPicked(new Set());
    setPhase("show");
    timer.current = window.setTimeout(() => setPhase("recall"), 900 + count * 320);
  }, []);

  const start = () => {
    setLevel(1);
    setMistakes(0);
    setWrong(0);
    setResult(null);
    setPaused(false);
    startRef.current = Date.now();
    playSound("click");
    deal(1);
  };

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const tap = (i: number) => {
    if (phase !== "recall" || paused || result) return;
    if (picked.has(i)) return;
    if (targets.has(i)) {
      const next = new Set(picked);
      next.add(i);
      setPicked(next);
      playSound("pop");
      if (next.size === targets.size) {
        playSound("success");
        const nl = level + 1;
        setLevel(nl);
        window.setTimeout(() => deal(nl), 550);
      }
    } else {
      const w = wrong + 1;
      const m = mistakes + 1;
      setWrong(w);
      setMistakes(m);
      playSound("error");
      if (m >= lives) {
        if (timer.current) window.clearTimeout(timer.current);
        const { xpGained } = recordResult({
          gameId: "visual-memory", score: level, completed: level > 1,
          durationMs: Date.now() - startRef.current, meta: { level, mistakes: m },
        });
        setPhase("done");
        setResult({ title: `Reached level ${level}`, subtitle: `${m} mistakes · grid up to ${cfg.size}×${cfg.size}`, xpGained });
      } else {
        // brief flash of the mistake, then re-deal same level
        window.setTimeout(() => deal(level), 650);
      }
    }
  };

  const best = stats.perGameBest["visual-memory"];

  return (
    <GameShell
      gameId="visual-memory" score={level} best={typeof best === "number" ? best : null}
      timerLabel={`Level ${level} · ❤ ${lives - mistakes}`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={start} result={result}
      onShareText={result ? `I reached level ${level} in KamKhoj Visual Memory.` : undefined}
    >
      {phase === "idle" && !result ? (
        <button onClick={start} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Start visual memory</button>
      ) : !result ? (
        <>
          <p className="mb-2 text-center text-sm font-bold text-slate-500" aria-live="polite">
            {phase === "show" ? `Memorize the ${targets.size} glowing cells…` : `Tap the ${targets.size} cells · found ${picked.size}`}
          </p>
          <div className="mx-auto grid w-full max-w-[400px] gap-1.5" style={{ gridTemplateColumns: `repeat(${cfg.size}, minmax(0,1fr))` }} role="grid" aria-label="Memory grid">
            {Array.from({ length: cfg.size * cfg.size }, (_, i) => {
              const isTarget = targets.has(i);
              const isPicked = picked.has(i);
              const show = phase === "show" && isTarget;
              return (
                <button
                  key={i} role="gridcell" aria-label={show || isPicked ? "Highlighted cell" : "Cell"}
                  onClick={() => tap(i)}
                  className={`aspect-square rounded-lg transition-all ${show ? "bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,.8)]" : isPicked ? "bg-emerald-500" : "bg-[#dbe7f7] hover:bg-[#c3d9f5]"}`}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </GameShell>
  );
}

"use client";
// Aim Trainer — responsive arena, 30s/60s/50-targets/precision modes.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";

type Mode = "30s" | "60s" | "50targets" | "precision";
const MODE_LABEL: Record<Mode, string> = { "30s": "30 seconds", "60s": "60 seconds", "50targets": "50 targets", precision: "Precision" };

interface Target { id: number; x: number; y: number; size: number; born: number }

export default function AimGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [mode, setMode] = useState<Mode>("30s");
  const [target, setTarget] = useState<Target | null>(null);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [left, setLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const [score, setScore] = useState(0);
  const acqTimes = useRef<number[]>([]);
  const arenaRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const startRef = useRef(Date.now());

  const spawn = useCallback((precision: boolean) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    const W = Math.min(640, rect?.width || 320);
    const H = Math.min(420, rect?.height || 300);
    const size = precision ? 26 + Math.random() * 10 : 40 + Math.random() * 26;
    const x = size / 2 + Math.random() * Math.max(10, W - size);
    const y = size / 2 + Math.random() * Math.max(10, H - size);
    idRef.current += 1;
    setTarget({ id: idRef.current, x: (x / W) * 100, y: (y / H) * 100, size, born: Date.now() });
  }, []);

  const finish = useCallback(() => {
    setRunning(false);
    setTarget(null);
    const h = hitsRef.current;
    const s = shotsRef.current;
    const acc = s ? Math.round((h / s) * 1000) / 10 : 0;
    const avg = acqTimes.current.length ? Math.round(acqTimes.current.reduce((a, b) => a + b, 0) / acqTimes.current.length) : 0;
    const bestMs = acqTimes.current.length ? Math.round(Math.min(...acqTimes.current)) : 0;
    const sc = mode === "50targets" ? Math.max(0, Math.round(5000 - avg * 2 - (s - h) * 25)) : scoreRef.current;
    const { xpGained } = recordResult({
      gameId: "aim", score: sc, completed: true, durationMs: Date.now() - startRef.current,
      meta: { hits: h, shots: s, accuracy: acc, avgMs: avg, bestMs },
    });
    playSound(h >= 10 ? "success" : "gameover");
    setResult({ title: `${h} hits · ${acc}%`, subtitle: `Avg acquisition ${avg}ms · best ${bestMs}ms · score ${sc}`, xpGained });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, recordResult, playSound]);

  const hitsRef = useRef(0);
  const shotsRef = useRef(0);
  const scoreRef = useRef(0);
  hitsRef.current = hits;
  shotsRef.current = shots;
  scoreRef.current = score;

  const finishRef = useRef(finish);
  finishRef.current = finish;

  const start = (m: Mode) => {
    setMode(m);
    setHits(0); setShots(0); setScore(0);
    setLeft(m === "60s" ? 60 : 30);
    setRunning(true); setPaused(false); setResult(null);
    acqTimes.current = [];
    startRef.current = Date.now();
    window.setTimeout(() => spawn(m === "precision"), 60);
    playSound("click");
  };

  useEffect(() => {
    if (!running || paused || result) return;
    if (mode === "50targets") return;
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { window.setTimeout(() => finishRef.current(), 0); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, paused, result, mode]);

  const onHit = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!running || paused || result || !target) return;
    const dt = Date.now() - target.born;
    acqTimes.current.push(dt);
    const gain = Math.max(5, Math.round(120 - dt / 10)) + (mode === "precision" ? 40 : 0);
    setHits((h) => {
      const nh = h + 1;
      if (mode === "50targets" && nh >= 50) window.setTimeout(() => finishRef.current(), 60);
      return nh;
    });
    setShots((s) => s + 1);
    setScore((s) => s + gain);
    playSound("pop");
    spawn(mode === "precision");
  };

  const onMiss = () => {
    if (!running || paused || result || !target) return;
    setShots((s) => s + 1);
    playSound("error");
  };

  const best = stats.perGameBest["aim"];
  const acc = shots ? Math.round((hits / shots) * 1000) / 10 : 100;

  return (
    <GameShell
      gameId="aim" score={score} best={typeof best === "number" ? best : null}
      timerLabel={mode === "50targets" ? `${hits}/50` : `${left}s`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => start(mode)} result={result}
      onShareText={result ? `I hit ${hits} targets at ${acc}% accuracy on KamKhoj Aim Trainer.` : undefined}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
          <button key={m} onClick={() => start(m)} className={`rounded-lg px-3 py-1 text-xs font-black ${mode === m && running ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{MODE_LABEL[m]}</button>
        ))}
        {!running && !result && (
          <button onClick={() => start(mode)} className="ml-auto rounded-lg bg-emerald-600 px-4 py-1 text-xs font-black text-white">Start</button>
        )}
      </div>
      <div
        ref={arenaRef}
        onClick={onMiss}
        onTouchStart={onMiss}
        className="relative h-[300px] w-full touch-manipulation select-none overflow-hidden rounded-2xl border border-slate-200 bg-[#0f1e3a] sm:h-[380px]"
        role="application"
        aria-label="Aim arena. Tap targets as they appear."
      >
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,.5) 1px, transparent 0)", backgroundSize: "26px 26px" }} />
        {target && (
          <button
            key={target.id}
            onClick={onHit}
            onTouchStart={onHit}
            aria-label="Target"
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_0_6px_rgba(229,72,77,.25),0_0_24px_rgba(229,72,77,.7)] transition-transform active:scale-90"
            style={{ left: `${target.x}%`, top: `${target.y}%`, width: target.size, height: target.size }}
          >
            <span className="mx-auto block rounded-full bg-white/90" style={{ width: target.size * 0.38, height: target.size * 0.38 }} />
          </button>
        )}
        {!running && !result && (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/60">Press Start, then tap targets</div>
        )}
      </div>
      <p className="mt-2 text-center text-xs font-bold text-slate-400">Hits {hits} · Shots {shots} · Acc {acc}% · Score {score}</p>
    </GameShell>
  );
}

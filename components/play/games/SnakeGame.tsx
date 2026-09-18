"use client";
// Snake — rAF loop, keyboard/WASD/swipe/d-pad, themes, speed ramp.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { snakeHitsSelf, snakeHitsWall, snakeNext, type SnakePoint } from "@/lib/play/logic";

const COLS = 20;
const ROWS = 20;

type Theme = { name: string; bg: string; snake: string; head: string; food: string };
const THEMES: Theme[] = [
  { name: "Meadow", bg: "#eef7ee", snake: "#22a06b", head: "#0e7a4c", food: "#e5484d" },
  { name: "Midnight", bg: "#0f1e3a", snake: "#5aa2ff", head: "#cfe3ff", food: "#ffb020" },
  { name: "Desert", bg: "#faf3e3", snake: "#b07d2b", head: "#7a5212", food: "#c2410c" },
];

function randomFood(snake: SnakePoint[]): SnakePoint {
  for (let i = 0; i < 500; i++) {
    const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
  return { x: 0, y: 0 };
}

export default function SnakeGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [snake, setSnake] = useState<SnakePoint[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState<SnakePoint>({ x: 14, y: 10 });
  const [dir, setDir] = useState<SnakePoint>({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dead, setDead] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const dirRef = useRef(dir);
  const stateRef = useRef({ snake, food, score });
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const startRef = useRef(0);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  dirRef.current = dir;
  stateRef.current = { snake, food, score };

  const stepMs = Math.max(70, 150 - score * 1.2);

  const die = useCallback(() => {
    setRunning(false);
    setDead(true);
    playSound("gameover");
    const s = stateRef.current.score;
    const { xpGained } = recordResult({ gameId: "snake", score: s, completed: s > 0, durationMs: Date.now() - startRef.current, meta: {} });
    setResult({ title: `Game over — ${s} points`, subtitle: s >= 100 ? "Snake Charmer material!" : "Eat more to grow your score.", xpGained });
  }, [recordResult, playSound]);

  const loop = useCallback((t: number) => {
    if (!runningRef.current || pausedRef.current) return;
    if (t - lastRef.current >= stepMsRef.current) {
      lastRef.current = t;
      const st = stateRef.current;
      const next = snakeNext(st.snake[0], dirRef.current);
      if (snakeHitsWall(next, COLS, ROWS) || snakeHitsSelf(st.snake, next, next.x === st.food.x && next.y === st.food.y)) {
        die();
        return;
      }
      const grows = next.x === st.food.x && next.y === st.food.y;
      const body = grows ? [next, ...st.snake] : [next, ...st.snake.slice(0, -1)];
      const ns = grows ? st.score + 10 : st.score;
      setSnake(body);
      setScore(ns);
      if (grows) {
        playSound("pop");
        const f = randomFood(body);
        setFood(f);
        stateRef.current = { snake: body, food: f, score: ns };
      } else {
        stateRef.current = { snake: body, food: st.food, score: ns };
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [die, playSound]);

  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const stepMsRef = useRef(stepMs);
  runningRef.current = running && !dead;
  pausedRef.current = paused;
  stepMsRef.current = stepMs;

  useEffect(() => {
    if (running && !paused && !dead) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, paused, dead, loop]);

  const start = () => {
    const fresh = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(fresh);
    setFood(randomFood(fresh));
    setDir({ x: 1, y: 0 });
    setScore(0);
    setDead(false);
    setResult(null);
    setPaused(false);
    setRunning(true);
    startRef.current = Date.now();
    lastRef.current = performance.now();
    stateRef.current = { snake: fresh, food: { x: 14, y: 10 }, score: 0 };
    playSound("click");
  };

  const steer = useCallback((x: number, y: number) => {
    const d = dirRef.current;
    if ((x === -d.x && y === -d.y) || (x === d.x && y === d.y)) return;
    setDir({ x, y });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (["arrowup", "w"].includes(k)) { e.preventDefault(); steer(0, -1); }
      else if (["arrowdown", "s"].includes(k)) { e.preventDefault(); steer(0, 1); }
      else if (["arrowleft", "a"].includes(k)) { e.preventDefault(); steer(-1, 0); }
      else if (["arrowright", "d"].includes(k)) { e.preventDefault(); steer(1, 0); }
      else if (k === " ") { e.preventDefault(); if (!running || dead) start(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steer, running, dead]);

  const theme = THEMES[themeIdx];
  const best = stats.perGameBest["snake"];

  return (
    <GameShell
      gameId="snake" score={score} best={typeof best === "number" ? best : null}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={start} result={result}
      onShareText={result ? `I scored ${score} in KamKhoj Snake. Can you beat it?` : undefined}
    >
      <div className="mb-2 flex gap-1.5">
        {THEMES.map((t, i) => (
          <button key={t.name} onClick={() => setThemeIdx(i)} className={`rounded-lg px-3 py-1 text-xs font-black ${i === themeIdx ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>
            {t.name}
          </button>
        ))}
        {!running && !dead && (
          <button onClick={start} className="ml-auto rounded-lg bg-emerald-600 px-4 py-1 text-xs font-black text-white">Start</button>
        )}
      </div>
      <div
        className="relative mx-auto aspect-square w-full max-w-[420px] touch-none select-none overflow-hidden rounded-xl border border-slate-200"
        style={{ background: theme.bg }}
        onTouchStart={(e) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchMove={(e) => {
          const s = touchRef.current;
          if (!s) return;
          const dx = e.touches[0].clientX - s.x;
          const dy = e.touches[0].clientY - s.y;
          if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
          if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 1 : -1, 0);
          else steer(0, dy > 0 ? 1 : -1);
          touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          e.preventDefault();
        }}
        role="application"
        aria-label="Snake board"
      >
        <div className="absolute" style={{ left: `${(food.x / COLS) * 100}%`, top: `${(food.y / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` }}>
          <div className="h-full w-full scale-[.72] rounded-full" style={{ background: theme.food }} />
        </div>
        {snake.map((s, i) => (
          <div key={i} className="absolute" style={{ left: `${(s.x / COLS) * 100}%`, top: `${(s.y / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` }}>
            <div className="h-full w-full scale-[.92] rounded-[30%]" style={{ background: i === 0 ? theme.head : theme.snake, opacity: i === 0 ? 1 : Math.max(0.55, 1 - i * 0.02) }} />
          </div>
        ))}
        {dead && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 text-4xl" aria-hidden>💀</div>
        )}
      </div>
      <div className="mx-auto mt-3 grid max-w-[420px] grid-cols-3 gap-1.5 sm:hidden" aria-label="Direction pad">
        <span />
        <PadBtn label="Up" onPress={() => steer(0, -1)}>▲</PadBtn>
        <span />
        <PadBtn label="Left" onPress={() => steer(-1, 0)}>◀</PadBtn>
        <PadBtn label="Down" onPress={() => steer(0, 1)}>▼</PadBtn>
        <PadBtn label="Right" onPress={() => steer(1, 0)}>▶</PadBtn>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Arrows / WASD / swipe to steer · speed rises as you eat</p>
    </GameShell>
  );
}

function PadBtn({ children, label, onPress }: { children: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <button aria-label={label} onTouchStart={(e) => { e.preventDefault(); onPress(); }} onClick={onPress} className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-[#102e67] active:bg-blue-50">
      {children}
    </button>
  );
}

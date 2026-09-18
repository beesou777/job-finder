"use client";
// Sliding Puzzle — 3×3/4×4/5×5, solvable-only shuffles, autosave, timer.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { slidingSolvable } from "@/lib/play/logic";

function solvedTiles(size: number): number[] {
  return [...Array.from({ length: size * size - 1 }, (_, i) => i + 1), 0];
}

function shuffledTiles(size: number): number[] {
  const goal = solvedTiles(size);
  for (let attempt = 0; attempt < 200; attempt++) {
    const arr = [...goal];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (slidingSolvable(arr) && arr.some((v, i) => v !== goal[i])) return arr;
  }
  // fallback: swap two non-blank tiles of the solved board (always solvable)
  const arr = [...goal];
  [arr[0], arr[1]] = [arr[1], arr[0]];
  return arr;
}

interface SavedSliding { size: number; tiles: number[]; moves: number; elapsed: number }

export default function SlidingGame() {
  const { recordResult, stats, saves, saveGame, clearSave, playSound } = usePlay();
  const [size, setSize] = useState(4);
  const [tiles, setTiles] = useState<number[]>(() => shuffledTiles(4));
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const s = saves["sliding"]?.state as SavedSliding | undefined;
    if (s && Array.isArray(s.tiles) && [3, 4, 5].includes(s.size) && s.tiles.length === s.size * s.size) {
      setSize(s.size);
      setTiles(s.tiles);
      setMoves(s.moves || 0);
      setElapsed(s.elapsed || 0);
      startRef.current = Date.now() - (s.elapsed || 0) * 1000;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (result) return;
    saveGame("sliding", `${size}×${size} · ${moves} moves`, { size, tiles, moves, elapsed } satisfies SavedSliding);
  }, [tiles, moves, elapsed, size, result, saveGame]);

  useEffect(() => {
    if (result || paused) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [result, paused, tiles]);

  const restart = useCallback((s: number) => {
    setSize(s);
    setTiles(shuffledTiles(s));
    setMoves(0);
    setElapsed(0);
    setPaused(false);
    setResult(null);
    startRef.current = Date.now();
    playSound("click");
  }, [playSound]);

  const move = (idx: number) => {
    if (paused || result) return;
    const blank = tiles.indexOf(0);
    const br = Math.floor(blank / size), bc = blank % size;
    const r = Math.floor(idx / size), c = idx % size;
    if (Math.abs(br - r) + Math.abs(bc - c) !== 1) return;
    const next = [...tiles];
    [next[blank], next[idx]] = [next[idx], next[blank]];
    setTiles(next);
    setMoves((m) => m + 1);
    playSound("flip");
    if (next.every((v, i) => v === (i === next.length - 1 ? 0 : i + 1))) {
      clearSave("sliding");
      const { xpGained } = recordResult({
        gameId: "sliding", score: Math.max(10, size * size * 40 - moves * 2 - elapsed), completed: true,
        durationMs: Date.now() - startRef.current, meta: { size, moves: moves + 1 },
      });
      playSound("success");
      setResult({ title: `${size}×${size} solved!`, subtitle: `${moves + 1} moves · ${fmt(elapsed)}`, xpGained });
    }
  };

  // arrow keys move a tile into the blank
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const blank = tiles.indexOf(0);
      const br = Math.floor(blank / size), bc = blank % size;
      let target: number | null = null;
      if (e.key === "ArrowUp" && br < size - 1) target = blank + size;
      if (e.key === "ArrowDown" && br > 0) target = blank - size;
      if (e.key === "ArrowLeft" && bc < size - 1) target = blank + 1;
      if (e.key === "ArrowRight" && bc > 0) target = blank - 1;
      if (target !== null) { e.preventDefault(); move(target); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, size, paused, result]);

  const best = stats.perGameBest["sliding"];

  return (
    <GameShell
      gameId="sliding" score={moves} best={typeof best === "number" ? best : null} timerLabel={fmt(elapsed)}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => restart(size)} result={result}
      onShareText={result ? `I solved a ${size}×${size} sliding puzzle in ${moves} moves on KamKhoj Play.` : undefined}
    >
      <div className="mb-3 flex gap-1.5">
        {[3, 4, 5].map((s) => (
          <button key={s} onClick={() => restart(s)} className={`rounded-lg px-4 py-1.5 text-xs font-black ${size === s ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{s}×{s}</button>
        ))}
        <span className="ml-auto text-xs font-bold text-slate-500">{moves} moves</span>
      </div>
      <div className="mx-auto grid w-full max-w-[400px] gap-1.5 rounded-2xl bg-[#dbe7f7] p-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }} role="grid" aria-label="Sliding puzzle">
        {tiles.map((v, i) => (
          <button
            key={i} role="gridcell" aria-label={v === 0 ? "Empty space" : `Tile ${v}`}
            onClick={() => move(i)}
            className={`flex aspect-square items-center justify-center rounded-xl font-mono text-2xl font-black ${v === 0 ? "bg-transparent" : v === i + 1 ? "bg-emerald-500 text-white" : "bg-white text-[#102e67] shadow-sm hover:bg-blue-50"}`}
          >
            {v === 0 ? "" : v}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Tap tiles next to the blank (or use arrows) · progress auto-saves</p>
    </GameShell>
  );
}

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, "0")}`;
}

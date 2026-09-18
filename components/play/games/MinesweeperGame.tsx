"use client";
// Minesweeper — safe first click, flood reveal, flags, touch flag-mode, custom.

import React, { useMemo, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { buildMinefield, countAdjacentMines, mineNeighbors } from "@/lib/play/logic";

type Diff = "beginner" | "intermediate" | "expert" | "custom";
const PRESETS: Record<Exclude<Diff, "custom">, { rows: number; cols: number; mines: number }> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 12, cols: 12, mines: 24 },
  expert: { rows: 14, cols: 18, mines: 45 },
};

export default function MinesweeperGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [diff, setDiff] = useState<Diff>("beginner");
  const [rows, setRows] = useState(9);
  const [cols, setCols] = useState(9);
  const [mineCount, setMineCount] = useState(10);
  const [mines, setMines] = useState<boolean[][] | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(0);
  const timer = useRef<number | null>(null);

  const start = (d: Diff, r = rows, c = cols, m = mineCount) => {
    setDiff(d);
    if (d !== "custom") {
      const p = PRESETS[d];
      r = p.rows; c = p.cols; m = p.mines;
    }
    setRows(r); setCols(c); setMineCount(Math.min(m, r * c - 10));
    setMines(null);
    setOpen(new Set());
    setFlags(new Set());
    setDead(false);
    setWon(false);
    setElapsed(0);
    setPaused(false);
    setResult(null);
    if (timer.current) window.clearInterval(timer.current);
    playSound("click");
  };

  const counts = useMemo(() => {
    if (!mines) return null;
    return mines.map((row, r) => row.map((_, c) => (mines[r][c] ? -1 : countAdjacentMines(mines, r, c))));
  }, [mines]);

  const key = (r: number, c: number) => `${r}-${c}`;

  const ensureTimer = () => {
    if (!timer.current) {
      startRef.current = Date.now() - elapsed * 1000;
      timer.current = window.setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    }
  };

  const flood = (field: boolean[][], fromR: number, fromC: number, cur: Set<string>): Set<string> => {
    const next = new Set(cur);
    const stack: Array<[number, number]> = [[fromR, fromC]];
    while (stack.length) {
      const [r, c] = stack.pop() as [number, number];
      const k = key(r, c);
      if (next.has(k) || field[r][c]) continue;
      next.add(k);
      if (countAdjacentMines(field, r, c) === 0) {
        for (const [nr, nc] of mineNeighbors(field.length, field[0].length, r, c)) {
          if (!next.has(key(nr, nc))) stack.push([nr, nc]);
        }
      }
    }
    return next;
  };

  const endWin = (opened: Set<string>) => {
    if (timer.current) { window.clearInterval(timer.current); timer.current = null; }
    setWon(true);
    const { xpGained } = recordResult({
      gameId: "minesweeper", score: Math.max(10, rows * cols * 4 - elapsed * 3), completed: true,
      durationMs: Date.now() - startRef.current, meta: { difficulty: diff },
    });
    playSound("success");
    setResult({ title: `Cleared in ${elapsed}s!`, subtitle: `${rows}×${cols} · ${mineCount} mines · ${diff}`, xpGained });
    void opened;
  };

  const reveal = (r: number, c: number) => {
    if (dead || won || paused || result) return;
    if (flags.has(key(r, c))) return;
    ensureTimer();
    let field = mines;
    if (!field) {
      field = buildMinefield(rows, cols, mineCount, r, c);
      setMines(field);
    }
    if (field[r][c]) {
      if (timer.current) { window.clearInterval(timer.current); timer.current = null; }
      setDead(true);
      const next = new Set(open);
      next.add(key(r, c));
      setOpen(next);
      const { xpGained } = recordResult({ gameId: "minesweeper", score: open.size, completed: false, durationMs: Date.now() - startRef.current, meta: { difficulty: diff } });
      playSound("gameover");
      setResult({ title: "Boom! Mine hit.", subtitle: `${open.size} cells cleared · try again`, xpGained });
      return;
    }
    const next = flood(field, r, c, open);
    setOpen(next);
    playSound("flip");
    const safe = rows * cols - mineCount;
    if (next.size >= safe) endWin(next);
  };

  const toggleFlag = (r: number, c: number) => {
    if (dead || won || paused || result || open.has(key(r, c))) return;
    setFlags((f) => {
      const n = new Set(f);
      if (n.has(key(r, c))) n.delete(key(r, c));
      else n.add(key(r, c));
      return n;
    });
    playSound("click");
  };

  const onCell = (r: number, c: number, e?: React.MouseEvent) => {
    if (e && e.button === 2) return;
    if (flagMode) toggleFlag(r, c);
    else reveal(r, c);
  };

  const best = stats.perGameBest["minesweeper"];

  return (
    <GameShell
      gameId="minesweeper" score={open.size} best={typeof best === "number" ? best : null}
      timerLabel={`${elapsed}s · 💣 ${Math.max(0, mineCount - flags.size)}`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => start(diff)} result={result}
      onShareText={result ? `Minesweeper (${diff}) on KamKhoj Play: ${result.title}` : undefined}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(["beginner", "intermediate", "expert"] as Diff[]).map((d) => (
          <button key={d} onClick={() => start(d)} className={`rounded-lg px-3 py-1 text-xs font-black capitalize ${diff === d ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{d}</button>
        ))}
        <button onClick={() => setFlagMode((f) => !f)} className={`rounded-lg px-3 py-1 text-xs font-black sm:hidden ${flagMode ? "bg-amber-400 text-[#102e67]" : "border border-slate-200 text-slate-500"}`}>
          🚩 Flag mode {flagMode ? "ON" : "OFF"}
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2 text-xs">
        <label className="font-bold text-slate-500">Rows <input type="number" min={6} max={16} value={rows} onChange={(e) => setRows(Math.max(6, Math.min(16, Number(e.target.value) || 9)))} className="w-14 rounded border border-slate-200 px-1 py-0.5" /></label>
        <label className="font-bold text-slate-500">Cols <input type="number" min={6} max={20} value={cols} onChange={(e) => setCols(Math.max(6, Math.min(20, Number(e.target.value) || 9)))} className="w-14 rounded border border-slate-200 px-1 py-0.5" /></label>
        <label className="font-bold text-slate-500">Mines <input type="number" min={5} max={80} value={mineCount} onChange={(e) => setMineCount(Number(e.target.value) || 10)} className="w-14 rounded border border-slate-200 px-1 py-0.5" /></label>
        <button onClick={() => start("custom")} className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-black text-white">Custom</button>
        <span className="ml-auto hidden font-bold text-slate-400 sm:inline">Right-click flags · long-press or flag-mode on touch</span>
      </div>
      <div className="overflow-x-auto">
        <div className="grid w-fit gap-px rounded-xl bg-slate-300 p-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }} role="grid" aria-label="Minefield">
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const k = key(r, c);
              const isOpen = open.has(k);
              const isFlag = flags.has(k);
              const n = counts?.[r]?.[c] ?? 0;
              const exploded = dead && mines?.[r]?.[c] && isOpen;
              return (
                <button
                  key={k} role="gridcell"
                  aria-label={isOpen ? (mines?.[r]?.[c] ? "Mine" : `${n || "empty"}`) : isFlag ? "Flagged" : "Hidden"}
                  onClick={(e) => onCell(r, c, e)}
                  onContextMenu={(e) => { e.preventDefault(); toggleFlag(r, c); }}
                  className={`flex h-8 w-8 items-center justify-center font-mono text-sm font-black sm:h-9 sm:w-9 ${isOpen ? (exploded ? "bg-red-500 text-white" : "bg-white text-slate-700") : "bg-[#9db9dd] text-white hover:bg-[#8aa9d4]"}`}
                >
                  {isOpen ? (mines?.[r]?.[c] ? "💣" : n > 0 ? <span style={{ color: numColor(n) }}>{n}</span> : "") : isFlag ? "🚩" : ""}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </GameShell>
  );
}

function numColor(n: number): string {
  return ["", "#1769e8", "#22a06b", "#e5484d", "#7c3aed", "#b07d2b", "#0e7a4c", "#102e67", "#64748b"][n] ?? "#102e67";
}

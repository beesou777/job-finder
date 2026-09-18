"use client";
// Sudoku — generator (solved board + clue removal), notes, mistake limit,
// timer/pause/erase, keyboard + touch, resume, completion detection.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { sudokuComplete, sudokuValid } from "@/lib/play/logic";

type Diff = "easy" | "medium" | "hard" | "expert";
const CLUES: Record<Diff, number> = { easy: 44, medium: 36, hard: 30, expert: 26 };

function shuffled<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillBoard(grid: number[][], rnd: () => number): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        for (const n of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], rnd)) {
          if (sudokuValid(grid, r, c, n)) {
            grid[r][c] = n;
            if (fillBoard(grid, rnd)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(diff: Diff): { puzzle: number[][]; solution: number[][] } {
  let seed = (Date.now() % 2147483646) + 1;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(solution, rnd);
  const puzzle = solution.map((r) => [...r]);
  const target = 81 - CLUES[diff];
  let removed = 0;
  let guard = 0;
  while (removed < target && guard++ < 400) {
    const r = Math.floor(rnd() * 9);
    const c = Math.floor(rnd() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return { puzzle, solution };
}

interface SavedSudoku { puzzle: number[][]; solution: number[][]; grid: number[][]; diff: Diff; mistakes: number; elapsed: number }

export default function SudokuGame() {
  const { recordResult, saves, saveGame, clearSave, playSound } = usePlay();
  const [diff, setDiff] = useState<Diff>("easy");
  const [puzzle, setPuzzle] = useState<number[][]>(() => generatePuzzle("easy").puzzle);
  const [solution, setSolution] = useState<number[][]>(() => generatePuzzle("easy").solution);
  const [grid, setGrid] = useState<number[][]>(() => puzzle.map((r) => [...r]));
  const [notes, setNotes] = useState<Set<string>>(new Set());
  const [notesMode, setNotesMode] = useState(false);
  const [sel, setSel] = useState<[number, number] | null>([0, 0]);
  const [mistakes, setMistakes] = useState(0);
  const [limit] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = React.useRef(Date.now());

  // restore
  useEffect(() => {
    const s = saves["sudoku"]?.state as SavedSudoku | undefined;
    if (s && Array.isArray(s.grid) && s.grid.length === 9) {
      setPuzzle(s.puzzle); setSolution(s.solution); setGrid(s.grid);
      setDiff(s.diff); setMistakes(s.mistakes || 0); setElapsed(s.elapsed || 0);
      startRef.current = Date.now() - (s.elapsed || 0) * 1000;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (result) return;
    saveGame("sudoku", `${diff} · ${mistakes} mistakes`, { puzzle, solution, grid, diff, mistakes, elapsed } satisfies SavedSudoku);
  }, [grid, mistakes, elapsed, diff, puzzle, solution, result, saveGame]);

  useEffect(() => {
    if (result || paused) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [result, paused, puzzle]);

  const newGame = useCallback((d: Diff) => {
    const g = generatePuzzle(d);
    setDiff(d);
    setPuzzle(g.puzzle);
    setSolution(g.solution);
    setGrid(g.puzzle.map((r) => [...r]));
    setNotes(new Set());
    setSel([0, 0]);
    setMistakes(0);
    setElapsed(0);
    setPaused(false);
    setResult(null);
    startRef.current = Date.now();
    playSound("click");
  }, [playSound]);

  const enter = useCallback((n: number) => {
    if (!sel || result || paused) return;
    const [r, c] = sel;
    if (puzzle[r][c] !== 0) return;
    if (notesMode) {
      const key = `${r}-${c}-${n}`;
      setNotes((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      return;
    }
    if (solution[r][c] === n) {
      const next = grid.map((row) => [...row]);
      // clear notes for this cell
      setNotes((prev) => {
        const nn = new Set(prev);
        for (let k = 1; k <= 9; k++) nn.delete(`${r}-${c}-${k}`);
        return nn;
      });
      next[r][c] = n;
      setGrid(next);
      playSound("flip");
      if (sudokuComplete(next)) {
        clearSave("sudoku");
        const { xpGained } = recordResult({
          gameId: "sudoku", score: Math.max(10, 1000 - elapsed * 2 - mistakes * 50), completed: true,
          durationMs: Date.now() - startRef.current, meta: { difficulty: diff, mistakes, sudokuSolved: 1 },
        });
        playSound("success");
        setResult({ title: "Puzzle solved!", subtitle: `${diff} · ${fmt(elapsed)} · ${mistakes} mistakes`, xpGained });
      }
    } else {
      const m = mistakes + 1;
      setMistakes(m);
      playSound("error");
      if (m >= limit) {
        clearSave("sudoku");
        const { xpGained } = recordResult({ gameId: "sudoku", score: 0, completed: false, durationMs: Date.now() - startRef.current, meta: { difficulty: diff, mistakes: m } });
        setResult({ title: "Out of mistakes", subtitle: "Three strikes — try a fresh board.", xpGained });
      }
    }
  }, [sel, result, paused, puzzle, notesMode, grid, solution, mistakes, limit, diff, elapsed, recordResult, clearSave, playSound]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (/^[1-9]$/.test(e.key)) enter(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        if (sel && puzzle[sel[0]][sel[1]] === 0) {
          const next = grid.map((row) => [...row]);
          next[sel[0]][sel[1]] = 0;
          setGrid(next);
        }
      } else if (e.key.toLowerCase() === "n") setNotesMode((v) => !v);
      else if (e.key.startsWith("Arrow") && sel) {
        e.preventDefault();
        const [r, c] = sel;
        if (e.key === "ArrowUp") setSel([Math.max(0, r - 1), c]);
        if (e.key === "ArrowDown") setSel([Math.min(8, r + 1), c]);
        if (e.key === "ArrowLeft") setSel([r, Math.max(0, c - 1)]);
        if (e.key === "ArrowRight") setSel([r, Math.min(8, c + 1)]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enter, sel, grid, puzzle]);

  const peers = useMemo(() => {
    if (!sel) return new Set<string>();
    const [r, c] = sel;
    const s = new Set<string>();
    for (let i = 0; i < 9; i++) { s.add(`${r}-${i}`); s.add(`${i}-${c}`); }
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) s.add(`${br + dr}-${bc + dc}`);
    return s;
  }, [sel]);

  return (
    <GameShell
      gameId="sudoku" timerLabel={fmt(elapsed)} paused={paused}
      onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => newGame(diff)} result={result}
      onShareText={result ? `I solved a ${diff} Sudoku in ${fmt(elapsed)} on KamKhoj Play.` : undefined}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {(["easy", "medium", "hard", "expert"] as Diff[]).map((d) => (
          <button key={d} onClick={() => newGame(d)} className={`rounded-lg px-3 py-1 text-xs font-black capitalize ${diff === d ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{d}</button>
        ))}
        <span className="ml-auto text-xs font-bold text-slate-500">Mistakes <b className={mistakes >= limit - 1 ? "text-red-600" : "text-[#102e67]"}>{mistakes}/{limit}</b></span>
      </div>
      <div className="mx-auto grid w-full max-w-[400px] grid-cols-9 gap-px overflow-hidden rounded-xl border-2 border-[#102e67] bg-[#102e67]" role="grid" aria-label="Sudoku board">
        {grid.map((row, r) =>
          row.map((v, c) => {
            const given = puzzle[r][c] !== 0;
            const isSel = sel?.[0] === r && sel?.[1] === c;
            const sameVal = v !== 0 && sel !== null && grid[sel[0]][sel[1]] === v;
            const cellNotes = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => notes.has(`${r}-${c}-${n}`));
            return (
              <button
                key={`${r}-${c}`} role="gridcell"
                aria-label={v ? `Row ${r + 1} column ${c + 1}: ${v}` : `Empty row ${r + 1} column ${c + 1}`}
                onClick={() => setSel([r, c])}
                className={`relative flex aspect-square items-center justify-center text-sm font-black sm:text-base ${
                  given ? "bg-[#eef3fb] text-[#102e67]" : "bg-white text-blue-700"
                } ${isSel ? "!bg-blue-600 !text-white" : sameVal ? "!bg-blue-100" : peers.has(`${r}-${c}`) ? "bg-[#f6faff]" : ""} ${(c + 1) % 3 === 0 && c < 8 ? "border-r-2 border-r-[#102e67]" : ""} ${(r + 1) % 3 === 0 && r < 8 ? "border-b-2 border-b-[#102e67]" : ""}`}
              >
                {v !== 0 ? v : cellNotes.length > 0 ? (
                  <span className="grid grid-cols-3 text-[7px] font-bold leading-none text-slate-400">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n}>{cellNotes.includes(n) ? n : ""}</span>)}
                  </span>
                ) : ""}
              </button>
            );
          }),
        )}
      </div>
      <div className="mx-auto mt-3 grid max-w-[400px] grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => enter(n)} className="flex h-11 items-center justify-center rounded-xl bg-[#f2f7ff] text-lg font-black text-[#102e67] active:bg-blue-200" aria-label={`Enter ${n}`}>{n}</button>
        ))}
        <button onClick={() => setNotesMode((v) => !v)} className={`col-span-2 h-11 rounded-xl text-xs font-black ${notesMode ? "bg-amber-400 text-[#102e67]" : "border border-slate-200 text-slate-500"}`}>
          ✎ Notes {notesMode ? "ON" : "OFF"} (N)
        </button>
        <button
          onClick={() => { if (sel && puzzle[sel[0]][sel[1]] === 0) { const next = grid.map((row) => [...row]); next[sel[0]][sel[1]] = 0; setGrid(next); } }}
          className="col-span-3 h-11 rounded-xl border border-slate-200 text-xs font-black text-slate-500"
        >
          Erase
        </button>
      </div>
    </GameShell>
  );
}

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, "0")}`;
}

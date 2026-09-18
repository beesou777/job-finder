"use client";
// Merge 2048 — keyboard + swipe, undo-once, resume, win/game-over detection.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { canMove2048, move2048, type Board2048, type Move2048 } from "@/lib/play/logic";

const N = 4;

function emptyBoard(): Board2048 {
  return Array.from({ length: N }, () => Array(N).fill(0));
}

function spawn(board: Board2048, rnd: () => number = Math.random): Board2048 {
  const empties: Array<[number, number]> = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (!v) empties.push([r, c]); }));
  if (!empties.length) return board;
  const [r, c] = empties[Math.floor(rnd() * empties.length)];
  const next = board.map((row) => [...row]);
  next[r][c] = rnd() < 0.9 ? 2 : 4;
  return next;
}

function maxTile(b: Board2048): number {
  return Math.max(...b.flat());
}

interface Saved2048 { board: Board2048; score: number; moves: number; won: boolean }

export default function MergeGame() {
  const { recordResult, stats, saves, saveGame, clearSave, playSound } = usePlay();
  const [board, setBoard] = useState<Board2048>(() => spawn(spawn(emptyBoard())));
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [undoLeft, setUndoLeft] = useState(1);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const prevRef = useRef<{ board: Board2048; score: number; moves: number } | null>(null);
  const startRef = useRef(Date.now());
  const reported = useRef(false);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const stateRef = useRef({ board, score, moves });
  stateRef.current = { board, score, moves };

  // restore unfinished run
  useEffect(() => {
    const saved = saves["merge"]?.state as Saved2048 | undefined;
    if (saved && Array.isArray(saved.board) && saved.board.length === 4) {
      setBoard(saved.board);
      setScore(saved.score || 0);
      setMoves(saved.moves || 0);
      setWon(!!saved.won);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autosave
  useEffect(() => {
    if (over) return;
    saveGame("merge", `${score} pts · ${moves} moves`, { board, score, moves, won } satisfies Saved2048);
  }, [board, score, moves, won, over, saveGame]);

  const finish = useCallback((finalScore: number, finalMoves: number, tile: number, didWin: boolean) => {
    if (reported.current) return;
    reported.current = true;
    clearSave("merge");
    const { xpGained } = recordResult({
      gameId: "merge", score: finalScore, completed: didWin || tile >= 512,
      durationMs: Date.now() - startRef.current,
      meta: { maxTile: tile, moves: finalMoves },
    });
    playSound(didWin ? "success" : "gameover");
    setResult({
      title: didWin ? `You reached ${tile}!` : `Game over — ${finalScore} pts`,
      subtitle: `Best tile ${tile} · ${finalMoves} moves`,
      xpGained,
    });
  }, [recordResult, clearSave, playSound]);

  const doMove = useCallback((dir: Move2048) => {
    if (paused || over || result) return;
    const st = stateRef.current;
    const r = move2048(st.board, dir);
    if (!r.moved) return;
    prevRef.current = { board: st.board, score: st.score, moves: st.moves };
    const withSpawn = spawn(r.board);
    const ns = st.score + r.gained;
    const nm = st.moves + 1;
    setBoard(withSpawn);
    setScore(ns);
    setMoves(nm);
    playSound("flip");
    const tile = maxTile(withSpawn);
    if (tile >= 2048 && !won) {
      setWon(true);
      finish(ns, nm, tile, true);
      return;
    }
    if (!canMove2048(withSpawn)) {
      setOver(true);
      finish(ns, nm, tile, false);
    }
  }, [paused, over, result, won, finish, playSound]);

  const undo = () => {
    if (undoLeft <= 0 || !prevRef.current || result) return;
    setBoard(prevRef.current.board);
    setScore(prevRef.current.score);
    setMoves(prevRef.current.moves);
    prevRef.current = null;
    setUndoLeft(0);
    playSound("click");
  };

  const restart = () => {
    reported.current = false;
    prevRef.current = null;
    setBoard(spawn(spawn(emptyBoard())));
    setScore(0);
    setMoves(0);
    setWon(false);
    setOver(false);
    setPaused(false);
    setResult(null);
    setUndoLeft(1);
    startRef.current = Date.now();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") { e.preventDefault(); doMove("up"); }
      else if (k === "arrowdown" || k === "s") { e.preventDefault(); doMove("down"); }
      else if (k === "arrowleft" || k === "a") { e.preventDefault(); doMove("left"); }
      else if (k === "arrowright" || k === "d") { e.preventDefault(); doMove("right"); }
      else if (k === "u") undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doMove]);

  const best = stats.perGameBest["merge"];
  const tileColors: Record<string, string> = {
    "2": "bg-[#eef3fb] text-[#33507e]", "4": "bg-[#dde9fa] text-[#1d3f7a]",
    "8": "bg-[#ffc98a] text-[#7a3c00]", "16": "bg-[#ffab63] text-white",
    "32": "bg-[#ff8a5c] text-white", "64": "bg-[#f96a3b] text-white",
    "128": "bg-[#f6d365] text-[#7a4a00]", "256": "bg-[#f3b93c] text-white",
    "512": "bg-[#e9a13b] text-white", "1024": "bg-[#3b82f6] text-white", "2048": "bg-[#7c3aed] text-white",
  };

  return (
    <GameShell
      gameId="merge" score={score} best={typeof best === "number" ? best : null}
      timerLabel={`${moves} moves`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={restart} result={result}
      onShareText={result ? `I scored ${score} in KamKhoj Merge 2048 (best tile ${maxTile(board)}).` : undefined}
    >
      <div className="mb-2 flex items-center gap-2">
        <button onClick={undo} disabled={undoLeft <= 0 || !prevRef.current} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500 disabled:opacity-40">
          Undo ({undoLeft} left · U)
        </button>
        <span className="text-xs text-slate-400">Best tile: {maxTile(board)}</span>
      </div>
      <div
        className="mx-auto grid w-full max-w-[400px] touch-none select-none grid-cols-4 gap-2 rounded-2xl bg-[#dbe7f7] p-2"
        onTouchStart={(e) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchMove={(e) => {
          const s = touchRef.current;
          if (!s) return;
          const dx = e.touches[0].clientX - s.x;
          const dy = e.touches[0].clientY - s.y;
          if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
          doMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
          touchRef.current = null;
          e.preventDefault();
        }}
        role="application"
        aria-label="2048 board"
      >
        {board.flat().map((v, i) => (
          <div key={i} className={`flex aspect-square items-center justify-center rounded-xl text-xl font-black tabular-nums transition-all sm:text-2xl ${v ? (tileColors[String(v)] ?? "bg-[#102e67] text-white") : "bg-white/70 text-transparent"}`}>
            {v || ""}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Arrows / WASD / swipe · unfinished runs resume automatically</p>
    </GameShell>
  );
}

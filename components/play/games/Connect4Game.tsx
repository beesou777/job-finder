"use client";
// Connect Four — PvC (3 levels, async AI) + local 2P, full win detection.

import React, { useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { CF_COLS, CF_ROWS, connectFourDrop, connectFourWinner, type CFCell } from "@/lib/play/logic";

type Opp = "easy" | "medium" | "hard" | "2p";

function fresh(): CFCell[][] {
  return Array.from({ length: CF_ROWS }, () => Array(CF_COLS).fill(0) as CFCell[]);
}

// cheap heuristic AI: win > block > center-preferring random, deeper on hard
function aiColumn(board: CFCell[][], ai: CFCell, level: Opp): number {
  const empt = (c: number) => board[0][c] === 0;
  const open = Array.from({ length: CF_COLS }, (_, c) => c).filter(empt);
  if (!open.length) return -1;
  const foe: CFCell = ai === 1 ? 2 : 1;
  const tryWin = (p: CFCell): number => {
    for (const c of open) {
      const copy = board.map((r) => [...r]) as CFCell[][];
      connectFourDrop(copy, c, p);
      if (connectFourWinner(copy) === p) return c;
    }
    return -1;
  };
  const win = tryWin(ai);
  if (win >= 0) return win;
  const block = tryWin(foe);
  if (block >= 0 && (level === "medium" || level === "hard" || Math.random() < 0.5)) return block;
  if (level === "hard") {
    // prefer center columns
    const scored = open.map((c) => ({ c, s: 3 - Math.abs(3 - c) + Math.random() }));
    scored.sort((a, b) => b.s - a.s);
    return scored[0].c;
  }
  return open[Math.floor(Math.random() * open.length)];
}

export default function Connect4Game() {
  const { recordResult, playSound } = usePlay();
  const [opp, setOpp] = useState<Opp>("medium");
  const [board, setBoard] = useState<CFCell[][]>(fresh);
  const [turn, setTurn] = useState<CFCell>(1);
  const [winner, setWinner] = useState<CFCell | null>(null);
  const [draw, setDraw] = useState(false);
  const [paused, setPaused] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const [tally, setTally] = useState({ you: 0, opp: 0, draw: 0 });
  const startRef = useRef(Date.now());

  const reset = (o: Opp = opp) => {
    setOpp(o);
    setBoard(fresh());
    setTurn(1);
    setWinner(null);
    setDraw(false);
    setPaused(false);
    setThinking(false);
    setResult(null);
    startRef.current = Date.now();
  };

  // AI turn — deferred so the UI never freezes
  useEffect(() => {
    if (opp === "2p" || winner || draw || paused || result || turn !== 2) return;
    setThinking(true);
    const id = window.setTimeout(() => {
      setBoard((b) => {
        const c = aiColumn(b, 2, opp);
        if (c < 0) return b;
        const next = b.map((r) => [...r]) as CFCell[][];
        connectFourDrop(next, c, 2);
        return next;
      });
      setTurn(1);
      setThinking(false);
    }, 380);
    return () => window.clearTimeout(id);
  }, [turn, opp, winner, draw, paused, result, board]);

  // settle
  useEffect(() => {
    const w = connectFourWinner(board);
    if (w) {
      setWinner(w);
      const youWon = opp === "2p" ? true : w === 1;
      const { xpGained } = recordResult({ gameId: "connect4", score: w === 1 ? 3 : 1, completed: true, durationMs: Date.now() - startRef.current, meta: {} });
      playSound(youWon ? "success" : "gameover");
      setTally((t) => ({ ...t, ...(w === 1 ? { you: t.you + 1 } : { opp: t.opp + 1 }) }));
      setResult({ title: w === 1 ? (opp === "2p" ? "Red wins!" : "You win!") : opp === "2p" ? "Yellow wins!" : "Computer wins", xpGained });
    } else if (board.every((r) => r.every((v) => v !== 0))) {
      setDraw(true);
      const { xpGained } = recordResult({ gameId: "connect4", score: 1, completed: true, durationMs: Date.now() - startRef.current, meta: {} });
      setTally((t) => ({ ...t, draw: t.draw + 1 }));
      setResult({ title: "Draw — board full", xpGained });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const drop = (c: number) => {
    if (winner || draw || paused || result || thinking) return;
    if (opp !== "2p" && turn !== 1) return;
    if (board[0][c] !== 0) return;
    playSound("flip");
    const next = board.map((r) => [...r]) as CFCell[][];
    if (!connectFourDrop(next, c, turn)) return;
    setBoard(next);
    setTurn(turn === 1 ? 2 : 1);
  };

  return (
    <GameShell
      gameId="connect4" score={tally.you - tally.opp}
      timerLabel={thinking ? "thinking…" : turn === 1 ? "🔴 to move" : "🟡 to move"}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => reset()} result={result}
      onShareText={result ? `Connect Four on KamKhoj Play: ${result.title}` : undefined}
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["easy", "medium", "hard", "2p"] as Opp[]).map((o) => (
          <button key={o} onClick={() => reset(o)} className={`rounded-lg px-3 py-1 text-xs font-black capitalize ${opp === o ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>
            {o === "2p" ? "2 players" : o}
          </button>
        ))}
        <span className="ml-auto text-xs font-bold text-slate-500">You {tally.you} · Opp {tally.opp} · Draw {tally.draw}</span>
      </div>
      <div className="mx-auto w-full max-w-[440px] rounded-2xl bg-[#1769e8] p-2 shadow-inner" role="grid" aria-label="Connect four board">
        {board.map((row, r) => (
          <div key={r} className="grid grid-cols-7 gap-1.5" role="row">
            {row.map((v, c) => (
              <button
                key={c} role="gridcell" aria-label={`Column ${c + 1}${v === 1 ? ", red" : v === 2 ? ", yellow" : ", empty"}`}
                onClick={() => drop(c)}
                className="flex aspect-square items-center justify-center rounded-full bg-[#0d3f9e]/60 p-[8%]"
              >
                <span className={`h-full w-full rounded-full ${v === 1 ? "bg-red-500 shadow" : v === 2 ? "bg-amber-300 shadow" : "bg-white/95 hover:bg-blue-50"}`} />
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Tap a column to drop · connect 4 horizontally, vertically or diagonally</p>
    </GameShell>
  );
}

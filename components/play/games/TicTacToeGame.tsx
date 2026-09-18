"use client";
// Tic-Tac-Toe — PvC (easy/medium/impossible minimax) + local 2P + match stats.

import React, { useEffect, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { tictactoeBestMove, tictactoeWinner, type TTTCell } from "@/lib/play/logic";

type Opp = "easy" | "medium" | "impossible" | "2p";

export default function TicTacToeGame() {
  const { recordResult, playSound } = usePlay();
  const [opp, setOpp] = useState<Opp>("impossible");
  const [board, setBoard] = useState<TTTCell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [wins, setWins] = useState({ X: 0, O: 0, draw: 0 });
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = React.useRef(Date.now());

  const winner = tictactoeWinner(board);

  const reset = (o: Opp = opp) => {
    setOpp(o);
    setBoard(Array(9).fill(null));
    setTurn("X");
    setPaused(false);
    setResult(null);
    startRef.current = Date.now();
  };

  // AI move (async-ish so UI never blocks; minimax on 3x3 is trivial anyway)
  useEffect(() => {
    if (opp === "2p" || winner || paused || result) return;
    if (turn !== "O") return;
    const id = window.setTimeout(() => {
      setBoard((b) => {
        if (tictactoeWinner(b)) return b;
        const next = [...b];
        let move = -1;
        if (opp === "easy") {
          const empt = next.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
          move = empt[Math.floor(Math.random() * empt.length)] ?? -1;
        } else if (opp === "medium") {
          move = Math.random() < 0.55 ? tictactoeBestMove(next, "O") : (() => {
            const empt = next.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
            return empt[Math.floor(Math.random() * empt.length)] ?? -1;
          })();
        } else {
          move = tictactoeBestMove(next, "O");
        }
        if (move >= 0) next[move] = "O";
        return next;
      });
      setTurn("X");
    }, 320);
    return () => window.clearTimeout(id);
  }, [turn, opp, winner, paused, result]);

  // settle finished boards
  useEffect(() => {
    if (!winner || result) return;
    setWins((w) => ({ ...w, [winner === "X" ? "X" : winner === "O" ? "O" : "draw"]: (w as Record<string, number>)[winner === "X" ? "X" : winner === "O" ? "O" : "draw"] + 1 }));
    const youWin = opp === "2p" ? true : winner === "X";
    const { xpGained } = recordResult({
      gameId: "tictactoe", score: winner === "draw" ? 1 : 3, completed: true,
      durationMs: Date.now() - startRef.current, meta: { outcome: winner === "draw" ? "draw" : winner === "X" ? "x" : "o" },
    });
    playSound(winner === "draw" ? "flip" : youWin ? "success" : "gameover");
    setResult({
      title: winner === "draw" ? "Draw!" : winner === "X" ? (opp === "2p" ? "X wins!" : "You win!") : opp === "2p" ? "O wins!" : "Computer wins",
      subtitle: `X ${wins.X + (winner === "X" ? 1 : 0)} · O ${wins.O + (winner === "O" ? 1 : 0)} · Draws ${wins.draw + (winner === "draw" ? 1 : 0)}`,
      xpGained,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner]);

  const play = (i: number) => {
    if (board[i] || winner || paused || result) return;
    if (opp !== "2p" && turn !== "X") return;
    playSound("flip");
    const next = [...board];
    next[i] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
  };

  return (
    <GameShell
      gameId="tictactoe" score={wins.X - wins.O}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => reset()} result={result}
      onShareText={result ? `Tic-Tac-Toe on KamKhoj Play: ${result.title}` : undefined}
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["easy", "medium", "impossible", "2p"] as Opp[]).map((o) => (
          <button key={o} onClick={() => reset(o)} className={`rounded-lg px-3 py-1 text-xs font-black capitalize ${opp === o ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>
            {o === "2p" ? "2 players" : o}
          </button>
        ))}
        <span className="ml-auto text-xs font-bold text-slate-500">X {wins.X} · O {wins.O} · Draw {wins.draw}</span>
      </div>
      <p className="mb-2 text-center text-sm font-bold text-slate-500" aria-live="polite">
        {winner ? "Game over" : opp === "2p" ? `Turn: ${turn}` : turn === "X" ? "Your turn (X)" : "Computer thinking…"}
      </p>
      <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-2" role="grid" aria-label="Tic-tac-toe board">
        {board.map((v, i) => (
          <button
            key={i} role="gridcell" aria-label={v ? `${v}` : `Empty square ${i + 1}`}
            onClick={() => play(i)}
            className={`flex aspect-square items-center justify-center rounded-2xl border-2 font-mono text-5xl font-black transition ${v === "X" ? "border-blue-200 bg-blue-50 text-blue-700" : v === "O" ? "border-amber-200 bg-amber-50 text-amber-600" : "border-slate-200 bg-white hover:border-blue-300"}`}
          >
            {v}
          </button>
        ))}
      </div>
    </GameShell>
  );
}

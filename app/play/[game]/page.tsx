"use client";
// Dynamic game route — lazy-loads the heavy game bundle only when opened.

import React, { Suspense, lazy, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GAME_MAP } from "@/lib/play/registry";
import { PlayErrorBoundary } from "@/components/play/PlayErrorBoundary";

const LOADERS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  reaction: lazy(() => import("@/components/play/games/ReactionGame")),
  typing: lazy(() => import("@/components/play/games/TypingGame")),
  snake: lazy(() => import("@/components/play/games/SnakeGame")),
  merge: lazy(() => import("@/components/play/games/MergeGame")),
  memory: lazy(() => import("@/components/play/games/MemoryGame")),
  sudoku: lazy(() => import("@/components/play/games/SudokuGame")),
  math: lazy(() => import("@/components/play/games/MathGame")),
  scramble: lazy(() => import("@/components/play/games/ScrambleGame")),
  hangman: lazy(() => import("@/components/play/games/HangmanGame")),
  color: lazy(() => import("@/components/play/games/ColorGame")),
  aim: lazy(() => import("@/components/play/games/AimGame")),
  sequence: lazy(() => import("@/components/play/games/SequenceGame")),
  "number-memory": lazy(() => import("@/components/play/games/NumberMemoryGame")),
  "visual-memory": lazy(() => import("@/components/play/games/VisualMemoryGame")),
  nepal: lazy(() => import("@/components/play/games/NepalGame")),
  quiz: lazy(() => import("@/components/play/games/QuizGame")),
  tictactoe: lazy(() => import("@/components/play/games/TicTacToeGame")),
  connect4: lazy(() => import("@/components/play/games/Connect4Game")),
  minesweeper: lazy(() => import("@/components/play/games/MinesweeperGame")),
  sliding: lazy(() => import("@/components/play/games/SlidingGame")),
};

export default function GamePage() {
  const params = useParams();
  const gameId = Array.isArray(params?.game) ? params.game[0] : (params?.game as string);
  const meta = GAME_MAP[gameId];
  const Game = useMemo(() => (gameId ? LOADERS[gameId] : undefined), [gameId]);

  if (!meta || !Game) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-4xl" aria-hidden>🎮</p>
        <h1 className="mt-2 text-xl font-black text-[#102e67]">Game not found</h1>
        <p className="mt-1 text-sm text-slate-500">That game doesn&apos;t exist. Here are 20 that do:</p>
        <Link href="/play" className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white">
          Browse all games
        </Link>
      </div>
    );
  }

  return (
    <PlayErrorBoundary name={gameId} key={gameId}>
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-16 text-center" role="status">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-hidden />
            <p className="mt-3 text-sm font-bold text-slate-500">Loading {meta.title}…</p>
          </div>
        }
      >
        <Game />
      </Suspense>
    </PlayErrorBoundary>
  );
}

// Note: metadata for dynamic game pages is handled by the parent layout + per-game
// <title> via GameShell headers to keep this route client-rendered & offline-friendly.
export type { Metadata };

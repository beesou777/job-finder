"use client";
// Nepal Challenge — standout 10-question run over bundled Nepal facts.

import React, { useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { NEPAL_QUESTIONS } from "@/lib/play/data";
import { QuizRunner } from "./QuizRunner";

const CATS = ["All", "Districts", "Provinces", "Cities", "Geography", "Landmarks", "Culture", "General"];

export default function NepalGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [cat, setCat] = useState("All");
  const [runId, setRunId] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(Date.now());

  const pool = cat === "All" ? NEPAL_QUESTIONS : NEPAL_QUESTIONS.filter((q) => q.category === cat);

  const start = (c: string) => {
    setCat(c);
    setRunId((r) => r + 1);
    setResult(null);
    setPaused(false);
    startRef.current = Date.now();
    playSound("click");
  };

  const finish = (correct: number, total: number) => {
    const { xpGained } = recordResult({
      gameId: "nepal", score: correct, completed: true, durationMs: Date.now() - startRef.current,
      meta: { correct, total },
    });
    playSound(correct >= 7 ? "success" : "gameover");
    setResult({
      title: `${correct}/${total} correct`,
      subtitle: correct >= 9 ? "Nepal Scholar!" : correct >= 5 ? "Solid Nepal knowledge." : "Explore the categories and retry.",
      xpGained,
    });
  };

  const best = stats.perGameBest["nepal"];

  return (
    <GameShell
      gameId="nepal" score={typeof best === "number" ? best : undefined} best={typeof best === "number" ? best : null}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => start(cat)} result={result}
      onShareText={result ? `I scored ${result.title} in the KamKhoj Nepal Challenge.` : undefined}
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-2xl" aria-hidden>🏔️</span>
        {CATS.map((c) => (
          <button key={c} onClick={() => start(c)} className={`rounded-lg px-3 py-1 text-xs font-black ${cat === c ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{c}</button>
        ))}
      </div>
      {result ? null : (
        <QuizRunner key={`${cat}-${runId}`} questions={pool} total={10} onFinish={finish} />
      )}
    </GameShell>
  );
}

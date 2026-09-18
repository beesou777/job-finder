"use client";
// Number Memory — a number flashes, hides, you type it back. Length ramps.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";

function makeNumber(digits: number): string {
  let s = `${1 + Math.floor(Math.random() * 9)}`;
  for (let i = 1; i < digits; i++) s += Math.floor(Math.random() * 10);
  return s;
}

type Phase = "idle" | "show" | "enter" | "done";

export default function NumberMemoryGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [digits, setDigits] = useState(3);
  const [number, setNumber] = useState("407");
  const [phase, setPhase] = useState<Phase>("idle");
  const [guess, setGuess] = useState("");
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const startRef = useRef(Date.now());
  const timer = useRef<number | null>(null);

  const showTime = Math.min(6000, 900 + digits * 450);

  const startLevel = useCallback((d: number) => {
    if (timer.current) window.clearTimeout(timer.current);
    setDigits(d);
    setNumber(makeNumber(d));
    setGuess("");
    setFeedback(null);
    setPhase("show");
    timer.current = window.setTimeout(() => setPhase("enter"), showTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    setResult(null);
    setPaused(false);
    startRef.current = Date.now();
    playSound("click");
    startLevel(3);
  };

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const submit = () => {
    if (phase !== "enter") return;
    if (guess.trim() === number) {
      playSound("success");
      setFeedback("Correct!");
      window.setTimeout(() => startLevel(digits + 1), 600);
    } else {
      if (timer.current) window.clearTimeout(timer.current);
      playSound("gameover");
      const reached = digits;
      const { xpGained } = recordResult({
        gameId: "number-memory", score: reached, completed: reached > 3,
        durationMs: Date.now() - startRef.current, meta: { digits: reached - 1 >= 3 ? reached - 1 : reached },
      });
      // record best as highest *remembered* (previous level)
      setPhase("done");
      setResult({
        title: `You remembered ${Math.max(3, reached - 1)} digits`,
        subtitle: `The number was ${number}.`,
        xpGained,
      });
    }
  };

  const best = stats.perGameBest["number-memory"];

  return (
    <GameShell
      gameId="number-memory" score={digits} best={typeof best === "number" ? best : null} timerLabel={`${digits} digits`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={start} result={result}
      onShareText={result ? `I remembered ${digits} digits on KamKhoj Number Memory.` : undefined}
    >
      {phase === "idle" && !result ? (
        <button onClick={start} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Start remembering</button>
      ) : !result ? (
        <div className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-6 text-center">
          {phase === "show" ? (
            <>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-slate-400">Memorize · {Math.round(showTime / 1000)}s</p>
              <p className="mt-2 font-mono text-5xl font-black tracking-[.2em] text-[#102e67]" aria-label={`Memorize ${number}`}>{number}</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-slate-400">What was the {digits}-digit number?</p>
              <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mx-auto mt-3 flex max-w-xs gap-2">
                <input
                  value={guess} onChange={(e) => setGuess(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))}
                  inputMode="numeric" autoFocus aria-label="Type the number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center font-mono text-2xl font-black tracking-widest outline-none focus:border-blue-400"
                  placeholder="?"
                />
                <button className="rounded-xl bg-[#102e67] px-5 font-black text-white">↵</button>
              </form>
            </>
          )}
          {feedback && <p className="mt-2 text-sm font-bold text-emerald-600">{feedback}</p>}
        </div>
      ) : null}
    </GameShell>
  );
}

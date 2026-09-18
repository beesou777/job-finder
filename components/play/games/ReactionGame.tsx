"use client";
// Reaction Lab — classic / 5-round average / sequence / precision modes.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { Sparkline } from "../charts";

type Mode = "classic" | "average" | "sequence" | "precision";
type Phase = "menu" | "waiting" | "ready" | "early" | "done";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function ReactionGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [mode, setMode] = useState<Mode>("classic");
  const [phase, setPhase] = useState<Phase>("menu");
  const [paused, setPaused] = useState(false);
  const [trials, setTrials] = useState<number[]>([]);
  const [seqTargets, setSeqTargets] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [seqHit, setSeqHit] = useState(0);
  const [seqStart, setSeqStart] = useState(0);
  const [message, setMessage] = useState("Pick a mode to begin.");
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const timer = useRef<number | null>(null);
  const t0 = useRef(0);
  const startWall = useRef(0);
  const attempts: number[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kkplay.reaction.history") || "[]") as number[];
    } catch { return []; }
  }, []);
  const [history, setHistory] = useState<number[]>(attempts);

  const clearTimer = () => {
    if (timer.current) { window.clearTimeout(timer.current); timer.current = null; }
  };
  useEffect(() => clearTimer, []);

  const pushHistory = (ms: number) => {
    setHistory((h) => {
      const next = [...h, Math.round(ms)].slice(-20);
      try { localStorage.setItem("kkplay.reaction.history", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const finishClassic = useCallback((ms: number, allTrials: number[]) => {
    pushHistory(ms);
    const best = Math.min(...allTrials);
    const avg = allTrials.reduce((a, b) => a + b, 0) / allTrials.length;
    const { xpGained } = recordResult({
      gameId: "reaction", score: Math.round(best), completed: true,
      durationMs: Date.now() - startWall.current, meta: { bestMs: Math.round(best), avgMs: Math.round(avg) },
    });
    playSound("success");
    setResult({ title: `${Math.round(best)} ms`, subtitle: allTrials.length > 1 ? `Average ${Math.round(avg)} ms over ${allTrials.length} trials` : "Valid reaction trial", xpGained });
    setPhase("done");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordResult]);

  const beginTrial = useCallback((roundIdx: number) => {
    clearTimer();
    setPhase("waiting");
    setMessage(mode === "average" ? `Round ${roundIdx + 1} of 5 — wait for green…` : "Wait for green…");
    const delay = mode === "precision" ? rand(1200, 2600) : rand(900, 3200);
    timer.current = window.setTimeout(() => {
      t0.current = performance.now();
      setPhase("ready");
      setMessage("TAP NOW!");
      playSound("pop");
    }, delay);
  }, [mode, playSound]);

  const start = (m: Mode) => {
    setMode(m);
    setResult(null);
    setTrials([]);
    setRound(0);
    setPaused(false);
    startWall.current = Date.now();
    playSound("click");
    if (m === "sequence") {
      const pts = Array.from({ length: 5 }, (_, i) => ({ x: rand(6, 88), y: rand(12, 76), id: i }));
      setSeqTargets(pts);
      setSeqHit(0);
      setPhase("waiting");
      // reveal one at a time
      let i = 0;
      setMessage("Target 1 — tap it!");
      const step = () => {
        t0.current = performance.now();
        setSeqHit(i);
        setMessage(`Target ${i + 1} of 5 — tap it!`);
      };
      step();
      setSeqStart(Date.now());
      void step;
    } else {
      beginTrial(0);
    }
  };

  const tapPad = () => {
    if (paused || result) return;
    if (mode === "sequence") {
      const ms = performance.now() - t0.current;
      if (phase !== "waiting") return;
      const next = seqHit + 1;
      pushHistory(ms);
      playSound("pop");
      if (next >= 5) {
        const total = Date.now() - seqStart;
        const { xpGained } = recordResult({ gameId: "reaction", score: Math.round(total / 5), completed: true, durationMs: total, meta: { bestMs: Math.round(ms), avgMs: Math.round(total / 5) } });
        setResult({ title: `Sequence complete`, subtitle: `Average ${Math.round(total / 5)} ms per target`, xpGained });
        setPhase("done");
      } else {
        setSeqHit(next);
        t0.current = performance.now();
        setMessage(`Target ${next + 1} of 5 — tap it!`);
      }
      return;
    }
    if (phase === "waiting") {
      clearTimer();
      setPhase("early");
      setMessage("Too early! Wait for green. Tap to retry.");
      playSound("error");
      return;
    }
    if (phase === "early") {
      beginTrial(round);
      return;
    }
    if (phase === "ready") {
      const ms = performance.now() - t0.current;
      // discard absurd trials (>1500ms counts as lapse, still recorded)
      const nextTrials = [...trials, ms];
      setTrials(nextTrials);
      if (mode === "average" && nextTrials.length < 5) {
        setRound(nextTrials.length);
        playSound("flip");
        setMessage(`Round ${nextTrials.length} done: ${Math.round(ms)} ms`);
        window.setTimeout(() => beginTrial(nextTrials.length), 700);
      } else {
        finishClassic(ms, nextTrials);
      }
    }
  };

  const best = stats.perGameBest["reaction"];
  const sorted = [...history].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  const avgHist = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;

  const padColor = phase === "ready" ? "bg-emerald-500" : phase === "early" ? "bg-red-500" : phase === "waiting" ? "bg-[#102e67]" : "bg-blue-600";

  return (
    <GameShell
      gameId="reaction"
      score={trials.length ? Math.round(trials[trials.length - 1]) : undefined}
      best={typeof best === "number" ? best : null}
      paused={paused}
      onPause={() => { clearTimer(); setPaused(true); }}
      onResume={() => { setPaused(false); if (phase === "waiting") beginTrial(round); }}
      onRestart={() => start(mode)}
      result={result}
      onShareText={result ? `My best reaction in KamKhoj Reaction Lab is ${best ?? "?"}ms. Think you can beat it?` : undefined}
    >
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Reaction modes">
        {(["classic", "average", "sequence", "precision"] as Mode[]).map((m) => (
          <button
            key={m} role="tab" aria-selected={mode === m}
            onClick={() => start(m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-black capitalize ${mode === m ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500 hover:border-blue-300"}`}
          >
            {m === "average" ? "5-round avg" : m}
          </button>
        ))}
      </div>
      <button
        onClick={tapPad}
        disabled={phase === "menu" || phase === "done"}
        className={`relative flex h-56 w-full touch-manipulation select-none flex-col items-center justify-center overflow-hidden rounded-2xl text-white transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 sm:h-64 ${padColor} ${phase === "menu" || phase === "done" ? "opacity-90" : "cursor-pointer active:scale-[.995]"}`}
        aria-live="polite"
        aria-label={message}
      >
        {mode === "sequence" && phase !== "menu" && phase !== "done" && seqTargets[seqHit] && (
          <span
            className="absolute h-14 w-14 rounded-full bg-amber-300 shadow-[0_0_30px_rgba(252,211,77,.9)]"
            style={{ left: `${seqTargets[seqHit].x}%`, top: `${seqTargets[seqHit].y}%` }}
          />
        )}
        {mode === "precision" && phase === "ready" && (
          <span className="absolute h-8 w-8 rounded-full border-4 border-white bg-amber-300" style={{ left: `${30 + ((round * 37) % 40)}%`, top: "38%" }} />
        )}
        <span className="px-4 text-center text-lg font-black sm:text-xl">{message}</span>
        {trials.length > 0 && mode === "average" && (
          <span className="mt-2 text-xs font-bold opacity-80">Trials: {trials.map((t) => `${Math.round(t)}ms`).join(" · ")}</span>
        )}
      </button>
      {phase === "menu" && (
        <button onClick={() => start("classic")} className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700">
          Start classic trial (Space)
        </button>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Mini label="Best" value={typeof best === "number" ? `${best}ms` : "—"} />
        <Mini label="Average" value={avgHist !== null ? `${avgHist}ms` : "—"} />
        <Mini label="Median" value={median !== null ? `${median}ms` : "—"} />
        <Mini label="Trials" value={`${history.length}`} />
      </div>
      <div className="mt-3 rounded-xl border border-slate-100 p-3">
        <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Last 20 attempts</p>
        <Sparkline values={history} width={320} height={44} />
      </div>
    </GameShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-[#f8fbff] p-2.5 text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-base font-black tabular-nums text-[#102e67]">{value}</p>
    </div>
  );
}

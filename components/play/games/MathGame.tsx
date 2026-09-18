"use client";
// Math Rush — operations × (60s | survival | zen) with progressive difficulty.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";

type Op = "add" | "sub" | "mul" | "div" | "mixed";
type Mode = "60s" | "survival" | "zen";

interface Q { a: number; b: number; op: "+" | "−" | "×" | "÷"; answer: number }

function makeQ(op: Op, level: number, rnd: () => number = Math.random): Q {
  const pickOp = (): "+" | "−" | "×" | "÷" => {
    if (op !== "mixed") return op === "add" ? "+" : op === "sub" ? "−" : op === "mul" ? "×" : "÷";
    return (["+", "−", "×", "÷"] as const)[Math.floor(rnd() * 4)];
  };
  const o = pickOp();
  const r = (n: number) => Math.floor(rnd() * n);
  const mag = Math.min(6, 1 + Math.floor(level / 4)); // grows with streak
  if (o === "+") {
    const a = 2 + r(10 * mag);
    const b = 2 + r(10 * mag);
    return { a, b, op: o, answer: a + b };
  }
  if (o === "−") {
    const a = 4 + r(12 * mag);
    const b = 1 + r(a);
    return { a, b, op: o, answer: a - b };
  }
  if (o === "×") {
    const a = 2 + r(4 + mag * 2);
    const b = 2 + r(4 + mag * 2);
    return { a, b, op: o, answer: a * b };
  }
  const b = 2 + r(6 + mag); // integer division guaranteed
  const answer = 1 + r(6 + mag);
  return { a: b * answer, b, op: o, answer };
}

export default function MathGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [op, setOp] = useState<Op>("mixed");
  const [mode, setMode] = useState<Mode>("60s");
  const [q, setQ] = useState<Q>(() => makeQ("mixed", 0));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [lives, setLives] = useState(3);
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const times = useRef<number[]>([]);
  const qAt = useRef(Date.now());
  const startRef = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const start = useCallback((o: Op, m: Mode) => {
    setOp(o); setMode(m);
    setQ(makeQ(o, 0));
    setInput(""); setScore(0); setCorrect(0); setWrong(0);
    setStreak(0); setLongest(0); setLives(3);
    setLeft(60); setRunning(true); setPaused(false); setResult(null);
    times.current = [];
    startRef.current = Date.now();
    qAt.current = Date.now();
    window.setTimeout(() => inputRef.current?.focus(), 50);
    playSound("click");
  }, [playSound]);

  const finish = useCallback((reason: string) => {
    setRunning(false);
    const dur = Date.now() - startRef.current;
    const avgMs = times.current.length ? Math.round(times.current.reduce((a, b) => a + b, 0) / times.current.length) : 0;
    const { xpGained } = recordResult({
      gameId: "math", score, completed: true, durationMs: dur,
      meta: { correct, wrong, streak: longest, avgMs },
    });
    playSound(score >= 10 ? "success" : "gameover");
    setResult({ title: `${score} points`, subtitle: `${correct} correct · ${wrong} wrong · best streak ×${longest} · avg ${avgMs}ms · ${reason}`, xpGained });
  }, [score, correct, wrong, longest, recordResult, playSound]);

  useEffect(() => {
    if (!running || paused || result || mode !== "60s") return;
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { window.setTimeout(() => finish("time up"), 0); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, paused, result, mode, finish]);

  const submit = (raw: string) => {
    if (!running || paused || result) return;
    const v = Number(raw.trim());
    if (!Number.isFinite(v) || raw.trim() === "") return;
    const dt = Date.now() - qAt.current;
    if (v === q.answer) {
      times.current.push(dt);
      const ns = streak + 1;
      setStreak(ns);
      setLongest((l) => Math.max(l, ns));
      setCorrect((c) => c + 1);
      setScore((s) => s + 1 + Math.floor(ns / 5)); // streak bonus
      setFlash("ok");
      playSound("pop");
      setQ(makeQ(op, correct + 1));
      qAt.current = Date.now();
    } else {
      setWrong((w) => w + 1);
      setStreak(0);
      setFlash("bad");
      playSound("error");
      if (mode === "survival") {
        const nl = lives - 1;
        setLives(nl);
        if (nl <= 0) { finish("no lives left"); return; }
      }
      setQ(makeQ(op, correct));
      qAt.current = Date.now();
    }
    setInput("");
    window.setTimeout(() => setFlash(null), 180);
  };

  const best = stats.perGameBest["math"];

  return (
    <GameShell
      gameId="math" score={score} best={typeof best === "number" ? best : null}
      timerLabel={mode === "60s" ? `${left}s` : mode === "survival" ? `❤ ${lives}` : `streak ×${streak}`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => start(op, mode)} result={result}
      onShareText={result ? `I scored ${score} in KamKhoj Math Rush (${op}).` : undefined}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(["add", "sub", "mul", "div", "mixed"] as Op[]).map((o) => (
          <button key={o} onClick={() => start(o, mode)} className={`rounded-lg px-3 py-1 text-xs font-black capitalize ${op === o ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>
            {o === "add" ? "+ Add" : o === "sub" ? "− Sub" : o === "mul" ? "× Mult" : o === "div" ? "÷ Div" : "Mixed"}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["60s", "survival", "zen"] as Mode[]).map((m) => (
          <button key={m} onClick={() => start(m === "60s" ? op : op, m)} className={`rounded-lg px-3 py-1 text-xs font-bold ${mode === m ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>
            {m === "60s" ? "60 seconds" : m === "survival" ? "Survival (3 lives)" : "Zen (no timer)"}
          </button>
        ))}
      </div>
      {!running && !result ? (
        <button onClick={() => start(op, mode)} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white">Start Math Rush</button>
      ) : !result ? (
        <div className={`rounded-2xl border-2 p-6 text-center transition-colors ${flash === "ok" ? "border-emerald-400 bg-emerald-50" : flash === "bad" ? "border-red-300 bg-red-50" : "border-slate-100 bg-[#f8fbff]"}`}>
          <p className="font-mono text-5xl font-black tabular-nums text-[#102e67]">{q.a} {q.op} {q.b} = ?</p>
          <form onSubmit={(e) => { e.preventDefault(); submit(input); }} className="mx-auto mt-4 flex max-w-xs gap-2">
            <input
              ref={inputRef} value={input} onChange={(e) => setInput(e.target.value.replace(/[^0-9-]/g, ""))}
              inputMode="numeric" autoFocus aria-label="Your answer"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center font-mono text-2xl font-black outline-none focus:border-blue-400" placeholder="?"
            />
            <button type="submit" className="rounded-xl bg-[#102e67] px-5 font-black text-white">↵</button>
          </form>
          <div className="mx-auto mt-3 grid max-w-xs grid-cols-3 gap-1.5">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "⌫", "↵"].map((k) => (
              <button
                key={k} aria-label={`Key ${k}`}
                onClick={() => {
                  if (k === "⌫") setInput((v) => v.slice(0, -1));
                  else if (k === "↵") submit(input);
                  else setInput((v) => (v + k).slice(0, 6));
                  inputRef.current?.focus();
                }}
                className="flex h-11 items-center justify-center rounded-lg bg-white font-mono text-lg font-black text-[#102e67] shadow-sm active:bg-blue-100"
              >
                {k}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs font-bold text-slate-400">Streak ×{streak} · best ×{longest} · {correct}✓ {wrong}✗</p>
        </div>
      ) : null}
    </GameShell>
  );
}

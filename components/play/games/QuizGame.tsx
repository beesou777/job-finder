"use client";
// Quiz Arena — reusable engine: 8 packs × (10 | 20 | survival | timed).

import React, { useEffect, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { QUIZ_QUESTIONS } from "@/lib/play/data";

const CATS = ["All", "Science", "Technology", "World", "History", "Entertainment", "Sports", "Geography", "General Knowledge"];
type Mode = "10" | "20" | "survival" | "timed";

export default function QuizGame() {
  const { recordResult, playSound } = usePlay();
  const [cat, setCat] = useState("All");
  const [mode, setMode] = useState<Mode>("10");
  const [order, setOrder] = useState(() => shuffled(QUIZ_QUESTIONS).slice(0, 10));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [left, setLeft] = useState(90);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const startRef = useRef(Date.now());
  const total = mode === "20" ? 20 : 10;

  function shuffled<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const start = (c: string, m: Mode) => {
    const pool = c === "All" ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter((q) => q.category === c);
    const n = m === "20" ? 20 : m === "survival" ? pool.length : m === "timed" ? pool.length : 10;
    setCat(c); setMode(m);
    setOrder(shuffled(pool).slice(0, Math.max(1, n)));
    setPos(0); setPicked(null); setCorrect(0); setWrong(0);
    setLeft(90); setOver(false); setPaused(false); setResult(null);
    startRef.current = Date.now();
    playSound("click");
  };

  const finish = (c: number, answered: number) => {
    setOver(true);
    const { xpGained } = recordResult({
      gameId: "quiz", score: c, completed: true, durationMs: Date.now() - startRef.current,
      meta: { correct: c, total: answered },
    });
    playSound(c >= Math.ceil(answered * 0.7) ? "success" : "gameover");
    setResult({ title: `${c}/${answered} correct`, subtitle: `${cat} pack · ${mode} mode`, xpGained });
  };

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (mode !== "timed" || over || paused || result) return;
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { window.setTimeout(() => finishRef.current(correct, Math.max(1, pos + (picked !== null ? 1 : 0))), 0); return 0; }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, over, paused, result]);

  const choose = (i: number) => {
    if (picked !== null || over || paused || result) return;
    const q = order[pos];
    if (!q) return;
    setPicked(i);
    const ok = i === q.answer;
    playSound(ok ? "pop" : "error");
    const nc = correct + (ok ? 1 : 0);
    const nw = wrong + (ok ? 0 : 1);
    if (mode === "survival" && !ok) {
      window.setTimeout(() => finish(nc, pos + 1), 650);
      setCorrect(nc);
      return;
    }
    window.setTimeout(() => {
      setCorrect(nc);
      setWrong(nw);
      if (pos + 1 >= order.length) finish(nc, order.length);
      else { setPos(pos + 1); setPicked(null); }
    }, 600);
  };

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const n = ["1", "2", "3", "4"].indexOf(e.key);
      if (n >= 0) choose(n);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const q = order[pos];

  return (
    <GameShell
      gameId="quiz" score={correct}
      timerLabel={mode === "timed" ? `${left}s` : mode === "survival" ? `❤ survive` : `${Math.min(pos + 1, order.length)}/${order.length}`}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => start(cat, mode)} result={result}
      onShareText={result ? `I scored ${result.title} in KamKhoj Quiz Arena (${cat}).` : undefined}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button key={c} onClick={() => start(c, mode)} className={`rounded-lg px-2.5 py-1 text-[11px] font-black ${cat === c ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{c}</button>
        ))}
      </div>
      <div className="mb-3 flex gap-1.5">
        {(["10", "20", "survival", "timed"] as Mode[]).map((m) => (
          <button key={m} onClick={() => start(cat, m)} className={`rounded-lg px-3 py-1 text-xs font-bold ${mode === m ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>
            {m === "10" ? "10 Qs" : m === "20" ? "20 Qs" : m === "survival" ? "Survival" : "Timed 90s"}
          </button>
        ))}
      </div>
      {q && !over && (
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">{q.category}</span>
            <span className="ml-auto text-xs font-bold tabular-nums text-slate-400">{pos + 1}/{order.length}</span>
          </div>
          <p className="text-lg font-extrabold text-[#102e67]">{q.question}</p>
          <div className="mt-3 grid gap-2">
            {q.choices.map((c, i) => {
              const isAnswer = i === q.answer;
              const isPicked = picked === i;
              let cls = "border-slate-200 bg-white hover:border-blue-300";
              if (picked !== null && isAnswer) cls = "border-emerald-400 bg-emerald-50";
              else if (isPicked) cls = "border-red-300 bg-red-50";
              return (
                <button key={i} onClick={() => choose(i)} disabled={picked !== null} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-bold text-slate-700 ${cls}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-black text-slate-500">{i + 1}</span>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameShell>
  );
}

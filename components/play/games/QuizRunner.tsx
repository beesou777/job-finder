"use client";
// Shared quiz runner (Quiz Arena + Nepal Challenge share the pattern).

import React, { useState } from "react";

export interface RunQuestion {
  id: string;
  category: string;
  type: string;
  question: string;
  choices: string[];
  answer: number;
}

export function QuizRunner({
  questions,
  total,
  onFinish,
  accent = "bg-blue-600",
}: {
  questions: RunQuestion[];
  total: number;
  onFinish: (correct: number, total: number, answers: boolean[]) => void;
  accent?: string;
}) {
  const [order] = useState(() => {
    const arr = [...questions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, total);
  });
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [correct, setCorrect] = useState(0);

  // survival handled by parent via total + early exit; here simple linear run
  const q = order[pos];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    const nc = correct + (ok ? 1 : 0);
    setCorrect(nc);
    const na = [...answers, ok];
    setAnswers(na);
    window.setTimeout(() => {
      if (pos + 1 >= order.length) onFinish(nc, order.length, na);
      else {
        setPos(pos + 1);
        setPicked(null);
      }
    }, 650);
  };

  if (!q) return <p className="text-sm text-slate-500">No questions available.</p>;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">{q.category}</span>
        <span className="ml-auto text-xs font-bold tabular-nums text-slate-400">{pos + 1}/{order.length}</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-blue-500 transition-all" style={{ width: `${((pos) / order.length) * 100}%` }} />
      </div>
      <p className="text-lg font-extrabold leading-snug text-[#102e67]">{q.question}</p>
      <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Answers">
        {q.choices.map((c, i) => {
          const isAnswer = i === q.answer;
          const isPicked = picked === i;
          let cls = "border-slate-200 bg-white hover:border-blue-300";
          if (picked !== null && isAnswer) cls = "border-emerald-400 bg-emerald-50 text-emerald-900";
          else if (isPicked) cls = "border-red-300 bg-red-50 text-red-900";
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-bold text-slate-700 transition ${cls}`}
              aria-label={`Answer ${i + 1}: ${c}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black ${picked !== null && isAnswer ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                {i + 1}
              </span>
              {c}
            </button>
          );
        })}
      </div>
      {/* keyboard 1-4 */}
      <KeyHandler onKey={(n) => { if (n < q.choices.length) choose(n); }} />
    </div>
  );
}

function KeyHandler({ onKey }: { onKey: (n: number) => void }) {
  React.useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const n = ["1", "2", "3", "4"].indexOf(e.key);
      if (n >= 0) onKey(n);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });
  return null;
}

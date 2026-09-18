"use client";
// Typing Arena — time/word modes, live char feedback, WPM/acc/consistency.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";
import { TYPING_QUOTES, TYPING_WORDS } from "@/lib/play/data";
import { typingAccuracy, typingWpm } from "@/lib/play/logic";
import { Sparkline } from "../charts";

type Mode = "15s" | "30s" | "60s" | "120s" | "w25" | "w50" | "w100";

function buildText(mode: Mode, seed: number): string {
  let rnd = seed;
  const pick = () => {
    rnd = (rnd * 1103515245 + 12345) & 0x7fffffff;
    return TYPING_WORDS[rnd % TYPING_WORDS.length];
  };
  if (mode === "15s" || mode === "30s" || mode === "60s" || mode === "120s" || mode === "w25" || mode === "w50" || mode === "w100") {
    const count = mode === "w25" ? 25 : mode === "w50" ? 50 : mode === "w100" ? 100 : 60;
    return Array.from({ length: count }, pick).join(" ");
  }
  return TYPING_QUOTES[seed % TYPING_QUOTES.length];
}

const MODE_SECONDS: Partial<Record<Mode, number>> = { "15s": 15, "30s": 30, "60s": 60, "120s": 120 };

export default function TypingGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [mode, setMode] = useState<Mode>("30s");
  const [text, setText] = useState(() => buildText("30s", Date.now() % 100000));
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [left, setLeft] = useState(30);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const [runStats, setRunStats] = useState({ wpm: 0, raw: 0, acc: 100, correct: 0, incorrect: 0, extra: 0, missed: 0, consistency: 0 });
  const [history, setHistory] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("kkplay.typing.history") || "[]") as number[]; } catch { return []; }
  });
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wpmSamples = useRef<number[]>([]);
  // Refs mirror the latest values so the countdown interval never sees stale state.
  const typedRef = useRef("");
  const textRef = useRef("");
  const finishedRef = useRef(false);
  const finishRef = useRef<() => void>(() => undefined);

  const reset = useCallback((m: Mode) => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setMode(m);
    const next = buildText(m, Math.floor(Math.random() * 100000));
    setText(next);
    textRef.current = next;
    setTyped("");
    typedRef.current = "";
    finishedRef.current = false;
    setStarted(false);
    setFinished(false);
    setResult(null);
    setPaused(false);
    setLeft(MODE_SECONDS[m] ?? 60);
    wpmSamples.current = [];
  }, []);

  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);

  // Keep textRef in sync for the initial mount text as well.
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) window.clearInterval(timerRef.current);
    const finalTyped = typedRef.current;
    const passage = textRef.current;
    const secs = Math.max(1, (Date.now() - startRef.current) / 1000);
    let correct = 0, incorrect = 0;
    for (let i = 0; i < finalTyped.length; i++) {
      if (i < passage.length && finalTyped[i] === passage[i]) correct++;
      else incorrect++;
    }
    const extra = Math.max(0, finalTyped.length - passage.length);
    const missed = Math.max(0, passage.length - finalTyped.length);
    const wpm = typingWpm(correct, secs);
    const raw = typingWpm(finalTyped.length, secs);
    const acc = typingAccuracy(correct, incorrect);
    const s = wpmSamples.current;
    const consistency = s.length > 2 ? Math.max(0, Math.round(100 - (stddev(s) / Math.max(1, avg(s))) * 100)) : 100;
    setRunStats({ wpm, raw, acc, correct, incorrect, extra, missed, consistency });
    setFinished(true);
    const { xpGained } = recordResult({
      gameId: "typing", score: wpm, completed: true, durationMs: Math.round(secs * 1000),
      meta: { wpm, accuracy: acc, correct, incorrect },
    });
    playSound("success");
    setHistory((h) => {
      const n = [...h, wpm].slice(-20);
      try { localStorage.setItem("kkplay.typing.history", JSON.stringify(n)); } catch { /* ignore */ }
      return n;
    });
    setResult({ title: `${wpm} WPM`, subtitle: `${acc}% accuracy · ${correct} correct · ${incorrect} wrong`, xpGained });
  }, [recordResult, playSound]);

  // countdown — always invokes the latest finish via ref (no stale closures)
  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  useEffect(() => {
    if (!started || finished || paused) return;
    const limit = MODE_SECONDS[mode];
    if (!limit) return;
    timerRef.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.setTimeout(() => finishRef.current(), 0);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, paused, mode]);

  const onChange = (v: string) => {
    if (finished || paused) return;
    if (!started) {
      setStarted(true);
      startRef.current = Date.now();
    }
    // paste prevention: reject jumps longer than 2 chars beyond previous
    if (v.length > typed.length + 3) {
      playSound("error");
      return;
    }
    setTyped(v.slice(0, text.length + 20));
    typedRef.current = v.slice(0, text.length + 20);
    const secs = Math.max(1, (Date.now() - (startRef.current || Date.now())) / 1000);
    let correct = 0;
    for (let i = 0; i < v.length && i < text.length; i++) if (v[i] === text[i]) correct++;
    wpmSamples.current.push(typingWpm(correct, secs));
    if (MODE_SECONDS[mode] === undefined && v.length >= text.length) finish();
  };

  const chars = useMemo(() => {
    return text.split("").map((ch, i) => {
      let cls = "text-slate-400";
      if (i < typed.length) cls = typed[i] === ch ? "text-emerald-600" : "bg-red-100 text-red-600 rounded";
      if (i === typed.length) cls += " caret";
      return { ch, cls, i };
    });
  }, [text, typed]);

  const best = stats.perGameBest["typing"];
  const isWord = mode.startsWith("w");

  return (
    <GameShell
      gameId="typing"
      score={started ? typingWpm(typed.split("").filter((c, i) => typed[i] === text[i]).length, Math.max(1, (Date.now() - startRef.current) / 1000)) : undefined}
      best={typeof best === "number" ? best : null}
      timerLabel={isWord ? `${Math.min(typed.length, text.length)}/${text.length}` : `${left}s`}
      paused={paused}
      onPause={() => setPaused(true)}
      onResume={() => setPaused(false)}
      onRestart={() => reset(mode)}
      result={result}
      onShareText={result ? `I typed ${runStats.wpm} WPM (${runStats.acc}% acc) on KamKhoj Typing Arena.` : undefined}
    >
      <style>{`.caret{position:relative}.caret::after{content:"";position:absolute;left:-1px;top:2px;bottom:2px;width:2px;background:#1769e8;animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}`}</style>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(Object.keys({ "15s": 1, "30s": 1, "60s": 1, "120s": 1, w25: 1, w50: 1, w100: 1 }) as Mode[]).map((m) => (
          <button key={m} onClick={() => reset(m)} className={`rounded-lg px-3 py-1.5 text-xs font-black ${mode === m ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500 hover:border-blue-300"}`}>
            {m === "w25" ? "25 words" : m === "w50" ? "50 words" : m === "w100" ? "100 words" : m}
          </button>
        ))}
      </div>
      <button
        className="block w-full cursor-text rounded-xl border border-slate-200 bg-[#fbfdff] p-4 text-left font-mono text-lg leading-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onClick={() => inputRef.current?.focus()}
        aria-label="Typing passage. Activate then type."
      >
        <span aria-hidden>
          {chars.map(({ ch, cls, i }) => (
            <span key={i} className={cls}>{ch}</span>
          ))}
        </span>
        <span className="sr-only">{text}</span>
      </button>
      <input
        ref={inputRef}
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        disabled={finished}
        autoCapitalize="off"
        autoCorrect="off"
        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-base outline-none focus:border-blue-400"
        placeholder={started ? "Keep typing…" : "Click here and start typing…"}
        aria-label="Type the passage here"
      />
      {(finished || started) && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[["WPM", `${runStats.wpm}`], ["Raw", `${runStats.raw}`], ["Acc", `${runStats.acc}%`], ["Correct", `${runStats.correct}`], ["Wrong", `${runStats.incorrect}`], ["Consistency", `${runStats.consistency}%`]].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-[#f8fbff] p-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{k}</p>
              <p className="text-sm font-black tabular-nums text-[#102e67]">{v}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 rounded-xl border border-slate-100 p-3">
        <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">WPM history</p>
        <Sparkline values={history} width={320} height={44} />
      </div>
    </GameShell>
  );
}

function avg(a: number[]): number { return a.reduce((x, y) => x + y, 0) / Math.max(1, a.length); }
function stddev(a: number[]): number {
  const m = avg(a);
  return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / Math.max(1, a.length));
}

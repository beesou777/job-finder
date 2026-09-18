"use client";
// Memory Match — difficulties, 5 themes, combo scoring, smooth flips.

import React, { useCallback, useEffect, useState } from "react";
import { GameShell } from "../GameShell";
import { usePlay } from "../PlayProvider";

const DIFFS = {
  easy: { pairs: 6, cols: 3, label: "Easy 4×3" },
  medium: { pairs: 8, cols: 4, label: "Medium 4×4" },
  hard: { pairs: 12, cols: 6, label: "Hard 6×4" },
  extreme: { pairs: 18, cols: 6, label: "Extreme 6×6" },
} as const;
type Diff = keyof typeof DIFFS;

const THEMES: Record<string, string[]> = {
  Emoji: ["😀", "🚀", "🌙", "🔥", "🐯", "🍕", "⚽", "🎧", "🌈", "🐸", "🍩", "🌵", "🦄", "🎯", "🐝", "🍉", "🎸", "🐬"],
  Animals: ["🐯", "🦁", "🐼", "🦊", "🐸", "🐵", "🦅", "🐢", "🐬", "🦋", "🐝", "🦄", "🐙", "🦉", "🦀", "🐳", "🦜", "🐘"],
  Food: ["🍕", "🍔", "🍩", "🍉", "🍇", "🥑", "🍜", "🧁", "🍪", "🌮", "🍣", "🥞", "🍒", "🥕", "🍿", "🧀", "🍰", "🥐"],
  Technology: ["💻", "📱", "⌨️", "🖱️", "🔋", "📡", "💾", "🖨️", "🎮", "🤖", "🛰️", "🔌", "💡", "📷", "🎧", "⏱️", "🧲", "🔭"],
  Nepal: ["🏔️", "🛕", "🦏", "🪁", "🥟", "🐅", "🪔", "⛰️", "🏞️", "🎋", "🐐", "🛶", "🏕️", "🌾", "🦚", "🐒", "🪕", "🏵️"],
};

function shuffledDeck(pairs: number, faces: string[], seed: number): string[] {
  const picked = faces.slice(0, pairs);
  const deck = [...picked, ...picked];
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryGame() {
  const { recordResult, stats, playSound } = usePlay();
  const [diff, setDiff] = useState<Diff>("medium");
  const [theme, setTheme] = useState("Emoji");
  const [deck, setDeck] = useState<string[]>(() => shuffledDeck(8, THEMES["Emoji"], 42));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{ title: string; subtitle?: string; xpGained?: number } | null>(null);
  const [lock, setLock] = useState(false);
  const startRef = React.useRef(Date.now());

  const start = useCallback((d: Diff, t: string) => {
    setDiff(d);
    setTheme(t);
    setDeck(shuffledDeck(DIFFS[d].pairs, THEMES[t], Math.floor(Math.random() * 1e9)));
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setMistakes(0);
    setCombo(0);
    setBestCombo(0);
    setElapsed(0);
    setPaused(false);
    setResult(null);
    setLock(false);
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (result || paused) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [result, paused, deck]);

  const flip = (idx: number) => {
    if (lock || paused || result || open.includes(idx) || matched.has(idx)) return;
    playSound("flip");
    const next = [...open, idx];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a] === deck[b]) {
        const c = combo + 1;
        setCombo(c);
        setBestCombo((bc) => Math.max(bc, c));
        setMatched((m) => {
          const nm = new Set(m);
          nm.add(a); nm.add(b);
          if (nm.size === deck.length) {
            const dur = Date.now() - startRef.current;
            const score = Math.max(10, deck.length * 50 - moves * 8 - mistakes * 15 + bestCombo * 10);
            const { xpGained } = recordResult({
              gameId: "memory", score, completed: true, durationMs: dur,
              meta: { moves: moves + 1, mistakes, combo: Math.max(bestCombo, c) },
            });
            playSound("success");
            window.setTimeout(() => setResult({
              title: "Board cleared!",
              subtitle: `${moves + 1} moves · ${mistakes} mistakes · best combo ×${Math.max(bestCombo, c)} · ${elapsed}s`,
              xpGained,
            }), 450);
          }
          return nm;
        });
        setOpen([]);
        playSound("pop");
      } else {
        setMistakes((m) => m + 1);
        setCombo(0);
        setLock(true);
        window.setTimeout(() => { setOpen([]); setLock(false); }, 620);
      }
    }
  };

  const best = stats.perGameBest["memory"];
  const cols = DIFFS[diff].cols;
  const mm = `${Math.floor(elapsed / 60)}:${`${elapsed % 60}`.padStart(2, "0")}`;

  return (
    <GameShell
      gameId="memory" score={matched.size / 2} best={typeof best === "number" ? best : null} timerLabel={mm}
      paused={paused} onPause={() => setPaused(true)} onResume={() => setPaused(false)}
      onRestart={() => start(diff, theme)} result={result}
      onShareText={result ? `I cleared Memory Match (${diff}) in ${moves} moves on KamKhoj Play.` : undefined}
    >
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(Object.keys(DIFFS) as Diff[]).map((d) => (
          <button key={d} onClick={() => start(d, theme)} className={`rounded-lg px-3 py-1 text-xs font-black capitalize ${diff === d ? "bg-[#102e67] text-white" : "border border-slate-200 text-slate-500"}`}>{DIFFS[d].label}</button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {Object.keys(THEMES).map((t) => (
          <button key={t} onClick={() => start(diff, t)} className={`rounded-lg px-3 py-1 text-xs font-bold ${theme === t ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>{t}</button>
        ))}
      </div>
      <div className="mb-2 flex gap-2 text-xs font-bold text-slate-500">
        <span>Moves <b className="tabular-nums text-[#102e67]">{moves}</b></span>
        <span>Mistakes <b className="tabular-nums text-[#102e67]">{mistakes}</b></span>
        <span>Combo <b className="tabular-nums text-[#102e67]">×{combo}</b></span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }} role="grid" aria-label="Memory board">
        {deck.map((face, i) => {
          const faceUp = open.includes(i) || matched.has(i);
          const gone = matched.has(i);
          return (
            <button
              key={i} role="gridcell" aria-label={faceUp ? `Card ${face}` : "Face-down card"}
              onClick={() => flip(i)}
              className={`flex aspect-square items-center justify-center rounded-xl text-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-3xl ${faceUp ? "bg-white shadow-inner" : "bg-[#102e67] hover:bg-[#1a3c7a]"} ${gone ? "opacity-40" : ""}`}
              style={{ transform: faceUp ? "rotateY(0deg)" : "rotateY(8deg)" }}
            >
              {faceUp ? face : <span className="text-white/40">?</span>}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}

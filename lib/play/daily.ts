// KamKhoj Play — deterministic seeded RNG + daily challenge generator.
// Same calendar date => same challenges for every visitor, no backend.

import type { DailyChallenge } from "./types";

export function hashDate(dateKey: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 — tiny deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ChallengeTemplate {
  gameId: string;
  title: (p: number) => string;
  detail: (p: number) => string;
  metric: string;
  param: (rnd: () => number) => number;
  xp: number;
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    gameId: "math",
    title: (p) => `Score ${p} in Math Rush`,
    detail: (p) => `Earn ${p} points in any 60-second Math Rush run today.`,
    metric: "math_score",
    param: (rnd) => 8 + Math.floor(rnd() * 10), // 8..17
    xp: 40,
  },
  {
    gameId: "reaction",
    title: (p) => `React in under ${p}ms`,
    detail: () => `Post a valid Classic reaction trial under the target time.`,
    metric: "reaction_best",
    param: (rnd) => 220 + Math.floor(rnd() * 5) * 10, // 220..260
    xp: 40,
  },
  {
    gameId: "memory",
    title: (p) => `Win Memory in ≤ ${p} moves`,
    detail: (p) => `Finish a Memory Match game (any difficulty) within ${p} moves.`,
    metric: "memory_moves",
    param: (rnd) => 26 + Math.floor(rnd() * 5) * 2, // 26..34
    xp: 40,
  },
  {
    gameId: "typing",
    title: (p) => `Type ${p} WPM`,
    detail: (p) => `Reach ${p} WPM in any Typing Arena result today.`,
    metric: "typing_wpm",
    param: (rnd) => 30 + Math.floor(rnd() * 5) * 5, // 30..50
    xp: 40,
  },
  {
    gameId: "scramble",
    title: (p) => `Solve ${p} scrambles`,
    detail: (p) => `Solve ${p} Word Scramble words in one day.`,
    metric: "scramble_solves",
    param: (rnd) => 3 + Math.floor(rnd() * 4), // 3..6
    xp: 35,
  },
  {
    gameId: "nepal",
    title: (p) => `Score ${p} in Nepal Challenge`,
    detail: (p) => `Score at least ${p} in one Nepal Challenge run.`,
    metric: "nepal_score",
    param: (rnd) => 5 + Math.floor(rnd() * 4), // 5..8
    xp: 40,
  },
  {
    gameId: "snake",
    title: (p) => `Score ${p} in Snake`,
    detail: (p) => `Eat your way to ${p} points in Snake today.`,
    metric: "snake_score",
    param: (rnd) => 60 + Math.floor(rnd() * 5) * 20, // 60..140
    xp: 35,
  },
  {
    gameId: "aim",
    title: (p) => `Hit ${p} targets`,
    detail: (p) => `Hit ${p} targets in one Aim Trainer run.`,
    metric: "aim_hits",
    param: (rnd) => 15 + Math.floor(rnd() * 4) * 5, // 15..30
    xp: 35,
  },
];

export function getDailyChallenges(dateKey: string): DailyChallenge[] {
  const rnd = mulberry32(hashDate(dateKey));
  const pool = [...TEMPLATES];
  // deterministic shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3).map((t, idx) => {
    const p = t.param(rnd);
    return {
      id: `${dateKey}-${idx}-${t.gameId}`,
      date: dateKey,
      gameId: t.gameId,
      title: t.title(p),
      detail: t.detail(p),
      target: p,
      metric: t.metric,
      xp: t.xp,
    };
  });
}

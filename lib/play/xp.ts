// KamKhoj Play — XP / level curve + streak helpers (pure, tested).

/** XP needed to go from `level` to `level+1` (level starts at 1). */
export function xpForNext(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return Math.floor(80 * Math.pow(l, 1.35) + 40 * l);
}

/** Total cumulative XP required to *reach* `level`. Level 1 needs 0. */
export function totalXpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  let total = 0;
  for (let i = 1; i < l; i++) total += xpForNext(i);
  return total;
}

export function levelFromXp(xp: number): number {
  const safe = Math.max(0, Math.floor(xp || 0));
  let level = 1;
  let remaining = safe;
  // guard: nobody should need more than 500 iterations
  for (let i = 0; i < 500; i++) {
    const need = xpForNext(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
  }
  return level;
}

export function levelProgress(xp: number): { level: number; into: number; need: number } {
  const level = levelFromXp(xp);
  const base = totalXpForLevel(level);
  const need = xpForNext(level);
  return { level, into: Math.max(0, Math.floor(xp) - base), need };
}

/** XP earned for a session: base + score component, capped to avoid exploits. */
export function xpForSession(score: number, completed: boolean, durationMs: number): number {
  const base = 8;
  const scorePart = Math.min(60, Math.floor(Math.max(0, score) / 10));
  const timePart = Math.min(20, Math.floor(Math.max(0, durationMs) / 30000));
  return base + scorePart + timePart + (completed ? 12 : 0);
}

function parseDay(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y || 1970, (m || 1) - 1, d || 1);
}

/** Update a sorted playDates list + streak counters given today. Pure helper. */
export function updateStreak(
  playDates: string[],
  today: string,
  prev: { currentStreak: number; longestStreak: number },
): { playDates: string[]; currentStreak: number; longestStreak: number } {
  const set = new Set(playDates);
  set.add(today);
  const sorted = [...set].sort();
  const capped = sorted.slice(-60);
  // current streak: count back consecutive days from today
  let streak = 0;
  let cursor = parseDay(today);
  const lookup = new Set(capped);
  for (;;) {
    const d = new Date(cursor);
    const key = `${d.getUTCFullYear()}-${`${d.getUTCMonth() + 1}`.padStart(2, "0")}-${`${d.getUTCDate()}`.padStart(2, "0")}`;
    if (lookup.has(key)) {
      streak += 1;
      cursor -= 86400000;
    } else break;
    if (streak > 3650) break;
  }
  return {
    playDates: capped,
    currentStreak: streak,
    longestStreak: Math.max(prev.longestStreak, streak),
  };
}

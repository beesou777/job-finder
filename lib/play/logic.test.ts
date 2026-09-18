// KamKhoj Play — pure-logic tests (vitest). Run: yarn test:play
import { describe, expect, it } from "vitest";
import {
  buildMinefield,
  canMove2048,
  connectFourDrop,
  connectFourWinner,
  countAdjacentMines,
  move2048,
  scrambleWord,
  slidingSolvable,
  snakeHitsSelf,
  snakeHitsWall,
  sudokuComplete,
  sudokuValid,
  tictactoeBestMove,
  tictactoeWinner,
  typingAccuracy,
  typingWpm,
  type CFCell,
} from "./logic";
import { evaluateAchievements } from "./achievements";
import { getDailyChallenges, hashDate, mulberry32 } from "./daily";
import { levelFromXp, totalXpForLevel, updateStreak, xpForNext, xpForSession } from "./xp";

describe("2048", () => {
  it("merges a row left once per pair", () => {
    const r = move2048([[2, 2, 4, 4], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], "left");
    expect(r.board[0]).toEqual([4, 8, 0, 0]);
    expect(r.gained).toBe(12);
    expect(r.moved).toBe(true);
  });
  it("does not double-merge [2,2,2,0] into [8,0,0,0]", () => {
    const r = move2048([[2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], "left");
    expect(r.board[0]).toEqual([4, 2, 0, 0]);
  });
  it("detects dead boards", () => {
    expect(canMove2048([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]])).toBe(false);
    expect(canMove2048([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 0], [4, 2, 4, 2]])).toBe(true);
  });
});

describe("tic-tac-toe", () => {
  it("detects rows, diagonals, draws", () => {
    expect(tictactoeWinner(["X", "X", "X", null, null, null, null, null, null])).toBe("X");
    expect(tictactoeWinner(["O", null, null, null, "O", null, null, null, "O"])).toBe("O");
    expect(tictactoeWinner(["X", "O", "X", "X", "O", "O", "O", "X", "X"])).toBe("draw");
    expect(tictactoeWinner(Array(9).fill(null))).toBe(null);
  });
  it("minimax never misses an immediate win and blocks threats", () => {
    // O can win at index 2
    expect(tictactoeBestMove(["O", "O", null, "X", "X", null, null, null, null], "O")).toBe(2);
    // O must block X at index 2 (blocking holds the draw here)
    expect(tictactoeBestMove(["X", "X", null, null, "O", null, null, null, null], "O")).toBe(2);
    // Empty board: optimal first move is the centre
    expect(tictactoeBestMove(Array(9).fill(null), "X")).toBe(4);
  });
});

describe("connect four", () => {
  it("detects horizontal, vertical and both diagonals", () => {
    const h: CFCell[][] = Array.from({ length: 6 }, () => Array(7).fill(0) as CFCell[]);
    h[5][0] = 1; h[5][1] = 1; h[5][2] = 1; h[5][3] = 1;
    expect(connectFourWinner(h)).toBe(1);
    const v: CFCell[][] = Array.from({ length: 6 }, () => Array(7).fill(0) as CFCell[]);
    v[2][0] = 2; v[3][0] = 2; v[4][0] = 2; v[5][0] = 2;
    expect(connectFourWinner(v)).toBe(2);
    const d: CFCell[][] = Array.from({ length: 6 }, () => Array(7).fill(0) as CFCell[]);
    d[2][0] = 1; d[3][1] = 1; d[4][2] = 1; d[5][3] = 1;
    expect(connectFourWinner(d)).toBe(1);
    const a: CFCell[][] = Array.from({ length: 6 }, () => Array(7).fill(0) as CFCell[]);
    a[2][3] = 2; a[3][2] = 2; a[4][1] = 2; a[5][0] = 2;
    expect(connectFourWinner(a)).toBe(2);
  });
  it("drops stack from the bottom", () => {
    const b: CFCell[][] = Array.from({ length: 6 }, () => Array(7).fill(0) as CFCell[]);
    expect(connectFourDrop(b, 3, 1)).toEqual({ row: 5 });
    expect(connectFourDrop(b, 3, 2)).toEqual({ row: 4 });
  });
});

describe("minesweeper", () => {
  it("keeps first click and neighbours mine-free", () => {
    const f = buildMinefield(9, 9, 10, 4, 4, mulberry32(7));
    expect(f[4][4]).toBe(false);
    expect(f.flat().filter(Boolean).length).toBe(10);
  });
  it("counts adjacent mines", () => {
    const f = [[true, false], [false, false]];
    expect(countAdjacentMines(f, 1, 1)).toBe(1);
    expect(countAdjacentMines(f, 0, 1)).toBe(1);
  });
});

describe("sudoku", () => {
  const solved = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  it("accepts a valid solved board", () => {
    expect(sudokuComplete(solved)).toBe(true);
  });
  it("rejects duplicates", () => {
    const bad = solved.map((r) => [...r]);
    bad[0][0] = 3; // duplicates the 3 at [0][1]
    expect(sudokuValid(bad, 0, 0, 3)).toBe(false);
    expect(sudokuComplete(bad)).toBe(false);
  });
});

describe("sliding puzzle", () => {
  it("marks solved boards solvable and detects parity", () => {
    expect(slidingSolvable([1, 2, 3, 4, 5, 6, 7, 8, 0])).toBe(true);
    expect(slidingSolvable([2, 1, 3, 4, 5, 6, 7, 8, 0])).toBe(false);
  });
});

describe("snake", () => {
  it("detects walls and self collisions", () => {
    expect(snakeHitsWall({ x: -1, y: 0 }, 20, 20)).toBe(true);
    expect(snakeHitsWall({ x: 5, y: 5 }, 20, 20)).toBe(false);
    const body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    expect(snakeHitsSelf(body, { x: 4, y: 5 }, false)).toBe(true);
    // moving into the tail tip is legal when not growing
    expect(snakeHitsSelf([{ x: 5, y: 5 }, { x: 4, y: 5 }], { x: 4, y: 5 }, false)).toBe(false);
    expect(snakeHitsSelf([{ x: 5, y: 5 }, { x: 4, y: 5 }], { x: 4, y: 5 }, true)).toBe(true);
  });
});

describe("typing", () => {
  it("computes wpm and accuracy", () => {
    expect(typingWpm(300, 60)).toBe(60);
    expect(typingWpm(0, 0)).toBe(0);
    expect(typingAccuracy(90, 10)).toBe(90);
    expect(typingAccuracy(0, 0)).toBe(100);
  });
});

describe("scramble", () => {
  it("never returns the original word for multi-letter input", () => {
    for (let i = 0; i < 50; i++) {
      expect(scrambleWord("EVEREST", mulberry32(i))).not.toBe("EVEREST");
    }
  });
});

describe("xp + streaks", () => {
  it("level curve is monotonic and consistent", () => {
    expect(xpForNext(1)).toBeGreaterThan(0);
    expect(totalXpForLevel(1)).toBe(0);
    expect(levelFromXp(0)).toBe(1);
    const l5 = totalXpForLevel(5);
    expect(levelFromXp(l5)).toBe(5);
    expect(levelFromXp(l5 - 1)).toBe(4);
  });
  it("rewards completion and caps score farming", () => {
    const a = xpForSession(10, true, 60000);
    const b = xpForSession(10, false, 60000);
    expect(a).toBeGreaterThan(b);
    expect(xpForSession(100000, true, 3600000)).toBeLessThan(150);
  });
  it("counts consecutive-day streaks", () => {
    const r = updateStreak(["2026-09-16", "2026-09-17"], "2026-09-18", { currentStreak: 2, longestStreak: 2 });
    expect(r.currentStreak).toBe(3);
    expect(r.longestStreak).toBe(3);
    const gap = updateStreak(["2026-09-10"], "2026-09-18", { currentStreak: 5, longestStreak: 5 });
    expect(gap.currentStreak).toBe(1);
    expect(gap.longestStreak).toBe(5);
  });
});

describe("daily challenges", () => {
  it("is deterministic per date and varies across dates", () => {
    expect(hashDate("2026-09-18")).toBe(hashDate("2026-09-18"));
    const a = getDailyChallenges("2026-09-18");
    const b = getDailyChallenges("2026-09-18");
    expect(a).toEqual(b);
    expect(a).toHaveLength(3);
    const c = getDailyChallenges("2026-09-19");
    expect(JSON.stringify(a) === JSON.stringify(c)).toBe(false);
  });
});

describe("achievements engine", () => {
  const baseStats = {
    xp: 0, totalPlayMs: 0, sessions: 0, completed: 0,
    perGamePlays: {}, perGameBest: {}, favorites: [],
    recentGameIds: [], lastPlayedAt: {}, playDates: [],
    currentStreak: 0, longestStreak: 0,
  };
  it("unlocks first-game and reaction tiers from a result", () => {
    const out = evaluateAchievements({
      stats: { ...baseStats, completed: 1, perGameBest: { reaction: 240 } },
      result: { gameId: "reaction", score: 240, completed: true, durationMs: 5000, meta: { bestMs: 240 } },
      distinctGames: 1, hour: 12, unlockedIds: new Set(),
    });
    expect(out["first-game"].unlocked).toBe(true);
    expect(out["reaction-250"].unlocked).toBe(true);
    expect(out["reaction-180"].unlocked).toBe(false);
  });
});

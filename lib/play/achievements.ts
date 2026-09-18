// KamKhoj Play — 44-achievement catalogue + reusable evaluation engine.
// Games never hardcode achievement logic: they report a GameResult + meta,
// and `evaluateAchievements` maps that onto catalogue progress.

import type {
  AchievementCategory,
  AchievementDef,
  GameResult,
  PlayStats,
} from "./types";

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-game", title: "First Game", description: "Finish your first game session.", icon: "play", category: "getting-started", rarity: "common", xp: 10, target: 1 },
  { id: "explorer-5", title: "Explorer", description: "Play 5 different games.", icon: "compass", category: "getting-started", rarity: "uncommon", xp: 25, target: 5 },
  { id: "explorer-10", title: "World Traveler", description: "Play 10 different games.", icon: "globe", category: "getting-started", rarity: "rare", xp: 50, target: 10 },
  { id: "explorer-all", title: "Completionist Explorer", description: "Play all 20 games.", icon: "map", category: "getting-started", rarity: "epic", xp: 100, target: 20 },
  { id: "sessions-10", title: "Warming Up", description: "Complete 10 game sessions.", icon: "zap", category: "getting-started", rarity: "common", xp: 10, target: 10 },
  { id: "sessions-50", title: "Regular", description: "Complete 50 game sessions.", icon: "flame", category: "mastery", rarity: "uncommon", xp: 25, target: 50 },
  { id: "sessions-150", title: "KamKhoj Veteran", description: "Complete 150 game sessions.", icon: "medal", category: "mastery", rarity: "epic", xp: 100, target: 150 },
  { id: "xp-1000", title: "Rising Star", description: "Earn 1,000 total XP.", icon: "star", category: "mastery", rarity: "uncommon", xp: 25, target: 1000 },
  { id: "xp-5000", title: "Play Master", description: "Earn 5,000 total XP.", icon: "crown", category: "mastery", rarity: "epic", xp: 100, target: 5000 },
  { id: "xp-15000", title: "Living Legend", description: "Earn 15,000 total XP.", icon: "trophy", category: "mastery", rarity: "legendary", xp: 200, target: 15000, hidden: true },
  // reflex
  { id: "reaction-first", title: "Lightning Reflexes", description: "Post any valid reaction trial under 400ms.", icon: "zap", category: "reflex", rarity: "common", xp: 10, target: 400 },
  { id: "reaction-250", title: "Speed Demon", description: "Post a reaction trial under 250ms.", icon: "timer", category: "reflex", rarity: "rare", xp: 50, target: 250 },
  { id: "reaction-180", title: "Superhuman", description: "Post a reaction trial under 180ms.", icon: "rocket", category: "reflex", rarity: "legendary", xp: 200, target: 180, hidden: true },
  { id: "aim-20", title: "Sharpshooter", description: "Hit 20 targets in one Aim Trainer run.", icon: "crosshair", category: "reflex", rarity: "uncommon", xp: 25, target: 20 },
  { id: "aim-accurate", title: "Steady Hand", description: "Finish Aim Trainer with 90%+ accuracy (10+ shots).", icon: "target", category: "reflex", rarity: "rare", xp: 50, target: 90 },
  { id: "color-15", title: "Mind Bender", description: "Score 15 in one Color Clash run.", icon: "palette", category: "reflex", rarity: "uncommon", xp: 25, target: 15 },
  { id: "color-30", title: "Stroop Master", description: "Score 30 in one Color Clash run.", icon: "brain", category: "reflex", rarity: "epic", xp: 100, target: 30 },
  // typing
  { id: "typing-first", title: "First Words", description: "Finish your first typing test.", icon: "keyboard", category: "typing", rarity: "common", xp: 10, target: 1 },
  { id: "typing-40", title: "Touch Typist", description: "Reach 40 WPM.", icon: "keyboard", category: "typing", rarity: "common", xp: 10, target: 40 },
  { id: "typing-60", title: "Swift Keys", description: "Reach 60 WPM.", icon: "wind", category: "typing", rarity: "uncommon", xp: 25, target: 60 },
  { id: "typing-80", title: "Keyboard Warrior", description: "Reach 80 WPM.", icon: "swords", category: "typing", rarity: "rare", xp: 50, target: 80 },
  { id: "typing-100", title: "Speed Demon Typist", description: "Reach 100 WPM.", icon: "rocket", category: "typing", rarity: "legendary", xp: 200, target: 100, hidden: true },
  { id: "typing-accurate", title: "Perfectionist", description: "Finish a typing test with 98%+ accuracy.", icon: "check", category: "typing", rarity: "rare", xp: 50, target: 98 },
  // memory
  { id: "memory-first", title: "First Recall", description: "Win a Memory Match game.", icon: "layers", category: "memory", rarity: "common", xp: 10, target: 1 },
  { id: "memory-perfect", title: "Perfect Memory", description: "Win Memory Match with ≤ 20% mistakes.", icon: "sparkles", category: "memory", rarity: "rare", xp: 50, target: 1 },
  { id: "sequence-7", title: "Echo", description: "Reach round 7 in Sequence Memory.", icon: "repeat", category: "memory", rarity: "uncommon", xp: 25, target: 7 },
  { id: "sequence-12", title: "Human Recorder", description: "Reach round 12 in Sequence Memory.", icon: "audio", category: "memory", rarity: "epic", xp: 100, target: 12 },
  { id: "number-7", title: "Seven Digits", description: "Remember a 7-digit number.", icon: "hash", category: "memory", rarity: "uncommon", xp: 25, target: 7 },
  { id: "number-10", title: "Phonebook Brain", description: "Remember a 10-digit number.", icon: "brain", category: "memory", rarity: "epic", xp: 100, target: 10 },
  { id: "visual-5", title: "Eagle Eye", description: "Reach level 5 in Visual Memory.", icon: "eye", category: "memory", rarity: "uncommon", xp: 25, target: 5 },
  { id: "visual-8", title: "Photographic", description: "Reach level 8 in Visual Memory.", icon: "camera", category: "memory", rarity: "epic", xp: 100, target: 8 },
  // puzzle
  { id: "merge-512", title: "Getting There", description: "Reach the 512 tile.", icon: "grid", category: "puzzle", rarity: "common", xp: 10, target: 512 },
  { id: "merge-2048", title: "Puzzle Master", description: "Reach the 2048 tile.", icon: "crown", category: "puzzle", rarity: "legendary", xp: 200, target: 2048, hidden: true },
  { id: "sudoku-first", title: "Logic Starter", description: "Complete any Sudoku.", icon: "grid", category: "puzzle", rarity: "uncommon", xp: 25, target: 1 },
  { id: "sudoku-hard", title: "Logic Master", description: "Complete a Hard or Expert Sudoku.", icon: "brain", category: "puzzle", rarity: "epic", xp: 100, target: 1 },
  { id: "mines-first", title: "Mine Sweeper", description: "Win a Minesweeper game.", icon: "flag", category: "puzzle", rarity: "uncommon", xp: 25, target: 1 },
  { id: "sliding-first", title: "Slider", description: "Solve a Sliding Puzzle.", icon: "puzzle", category: "puzzle", rarity: "uncommon", xp: 25, target: 1 },
  { id: "snake-100", title: "Snake Charmer", description: "Score 100 in Snake.", icon: "snake", category: "puzzle", rarity: "uncommon", xp: 25, target: 100 },
  { id: "snake-300", title: "Serpent King", description: "Score 300 in Snake.", icon: "crown", category: "puzzle", rarity: "epic", xp: 100, target: 300 },
  // knowledge
  { id: "quiz-7", title: "Quiz Whiz", description: "Score 7/10 in Quiz Arena.", icon: "help", category: "knowledge", rarity: "common", xp: 10, target: 7 },
  { id: "quiz-perfect", title: "Know It All", description: "Score a perfect 10/10 quiz.", icon: "graduation", category: "knowledge", rarity: "rare", xp: 50, target: 10 },
  { id: "nepal-5", title: "Nepal Explorer", description: "Score 5 in Nepal Challenge.", icon: "mountain", category: "knowledge", rarity: "common", xp: 10, target: 5 },
  { id: "nepal-9", title: "Nepal Scholar", description: "Score 9+ in Nepal Challenge.", icon: "flag", category: "knowledge", rarity: "rare", xp: 50, target: 9 },
  { id: "hangman-clean", title: "Word Survivor", description: "Win Hangman with ≤ 1 wrong guess.", icon: "type", category: "knowledge", rarity: "uncommon", xp: 25, target: 1 },
  // streak / special
  { id: "streak-3", title: "On a Roll", description: "Reach a 3-day play streak.", icon: "flame", category: "streak", rarity: "uncommon", xp: 25, target: 3 },
  { id: "streak-7", title: "Seven Day Streak", description: "Play 7 days in a row.", icon: "calendar", category: "streak", rarity: "epic", xp: 100, target: 7 },
  { id: "streak-30", title: "Unstoppable Month", description: "Play 30 days in a row.", icon: "infinity", category: "streak", rarity: "legendary", xp: 200, target: 30, hidden: true },
  { id: "night-owl", title: "Night Owl", description: "Play between midnight and 5 AM.", icon: "moon", category: "streak", rarity: "uncommon", xp: 25, target: 1, hidden: true },
  { id: "early-bird", title: "Early Bird", description: "Play between 5 AM and 8 AM.", icon: "sun", category: "streak", rarity: "uncommon", xp: 25, target: 1, hidden: true },
  { id: "daily-first", title: "Daily Challenger", description: "Complete a daily challenge.", icon: "calendar-check", category: "streak", rarity: "common", xp: 10, target: 1 },
];

export interface EvalContext {
  stats: PlayStats;
  result: GameResult | null;
  distinctGames: number;
  hour: number;
  unlockedIds: Set<string>;
}

function num(meta: GameResult["meta"], key: string): number {
  const v = meta?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/**
 * Compute `{ progress, unlocked }` for every achievement given a snapshot.
 * Pure + deterministic; safe to call after every session.
 */
export function evaluateAchievements(ctx: EvalContext): Record<string, { progress: number; unlocked: boolean }> {
  const { stats, result, distinctGames, hour } = ctx;
  const m = result?.meta ?? {};
  const gid = result?.gameId ?? "";
  const out: Record<string, { progress: number; unlocked: boolean }> = {};
  const set = (id: string, progress: number, unlocked: boolean) => {
    out[id] = { progress: Math.min(progress, targetOf(id)), unlocked };
  };
  const targetOf = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)?.target ?? 1;

  // getting started / mastery
  set("first-game", stats.completed, stats.completed >= 1);
  set("explorer-5", distinctGames, distinctGames >= 5);
  set("explorer-10", distinctGames, distinctGames >= 10);
  set("explorer-all", distinctGames, distinctGames >= 20);
  set("sessions-10", stats.completed, stats.completed >= 10);
  set("sessions-50", stats.completed, stats.completed >= 50);
  set("sessions-150", stats.completed, stats.completed >= 150);
  set("xp-1000", stats.xp, stats.xp >= 1000);
  set("xp-5000", stats.xp, stats.xp >= 5000);
  set("xp-15000", stats.xp, stats.xp >= 15000);

  const bestReaction = num(m, "bestMs") || (gid === "reaction" ? result?.score ?? 0 : 0);
  const reactionValid = gid === "reaction" && result && result.completed;
  set("reaction-first", reactionValid && bestReaction > 0 && bestReaction <= 400 ? 400 : stats.perGameBest["reaction"] ? Math.min(400, stats.perGameBest["reaction"]) : 0, (stats.perGameBest["reaction"] ?? Infinity) <= 400);
  set("reaction-250", (stats.perGameBest["reaction"] ?? Infinity) <= 250 ? 250 : reactionValid && bestReaction <= 250 ? 250 : 0, (stats.perGameBest["reaction"] ?? Infinity) <= 250);
  set("reaction-180", (stats.perGameBest["reaction"] ?? Infinity) <= 180 ? 180 : 0, (stats.perGameBest["reaction"] ?? Infinity) <= 180);

  const aimHits = gid === "aim" ? num(m, "hits") : 0;
  set("aim-20", Math.max(aimHits >= 20 ? 20 : 0, (stats.perGameBest["aim"] ?? 0) >= 20 ? 20 : 0), (stats.perGameBest["aim"] ?? 0) >= 20);
  const aimAcc = gid === "aim" ? num(m, "accuracy") : 0;
  const aimShots = gid === "aim" ? num(m, "shots") : 0;
  set("aim-accurate", aimAcc >= 90 && aimShots >= 10 ? 90 : 0, aimAcc >= 90 && aimShots >= 10);

  const colorScore = gid === "color" ? (result?.score ?? 0) : 0;
  set("color-15", Math.max(colorScore, stats.perGameBest["color"] ?? 0), (stats.perGameBest["color"] ?? 0) >= 15);
  set("color-30", Math.max(colorScore, stats.perGameBest["color"] ?? 0), (stats.perGameBest["color"] ?? 0) >= 30);

  const wpm = gid === "typing" ? num(m, "wpm") : 0;
  const bestWpm = stats.perGameBest["typing"] ?? 0;
  set("typing-first", (stats.perGamePlays["typing"] ?? 0) > 0 ? 1 : 0, (stats.perGamePlays["typing"] ?? 0) > 0);
  set("typing-40", Math.max(wpm, bestWpm), bestWpm >= 40);
  set("typing-60", Math.max(wpm, bestWpm), bestWpm >= 60);
  set("typing-80", Math.max(wpm, bestWpm), bestWpm >= 80);
  set("typing-100", Math.max(wpm, bestWpm), bestWpm >= 100);
  const acc = gid === "typing" ? num(m, "accuracy") : 0;
  set("typing-accurate", acc >= 98 ? 98 : 0, acc >= 98);

  const memWin = gid === "memory" && result?.completed === true;
  set("memory-first", memWin || (stats.perGameBest["memory"] ?? 0) > 0 ? 1 : 0, memWin || (stats.perGameBest["memory"] ?? 0) > 0);
  const mistakes = gid === "memory" ? num(m, "mistakes") : 99;
  const moves = gid === "memory" ? num(m, "moves") : 99;
  set("memory-perfect", memWin && mistakes <= Math.max(1, moves * 0.2) ? 1 : 0, memWin && mistakes <= Math.max(1, moves * 0.2));

  const seqRound = gid === "sequence" ? num(m, "round") : 0;
  set("sequence-7", Math.max(seqRound, stats.perGameBest["sequence"] ?? 0), (stats.perGameBest["sequence"] ?? 0) >= 7);
  set("sequence-12", Math.max(seqRound, stats.perGameBest["sequence"] ?? 0), (stats.perGameBest["sequence"] ?? 0) >= 12);

  const digits = gid === "number-memory" ? num(m, "digits") : 0;
  set("number-7", Math.max(digits, stats.perGameBest["number-memory"] ?? 0), (stats.perGameBest["number-memory"] ?? 0) >= 7);
  set("number-10", Math.max(digits, stats.perGameBest["number-memory"] ?? 0), (stats.perGameBest["number-memory"] ?? 0) >= 10);

  const visLevel = gid === "visual-memory" ? num(m, "level") : 0;
  set("visual-5", Math.max(visLevel, stats.perGameBest["visual-memory"] ?? 0), (stats.perGameBest["visual-memory"] ?? 0) >= 5);
  set("visual-8", Math.max(visLevel, stats.perGameBest["visual-memory"] ?? 0), (stats.perGameBest["visual-memory"] ?? 0) >= 8);

  const tile = gid === "merge" ? num(m, "maxTile") : 0;
  set("merge-512", Math.max(tile, stats.perGameBest["merge"] ?? 0), (stats.perGameBest["merge"] ?? 0) >= 512);
  set("merge-2048", Math.max(tile, stats.perGameBest["merge"] ?? 0), (stats.perGameBest["merge"] ?? 0) >= 2048);

  set("sudoku-first", gid === "sudoku" && result?.completed ? 1 : stats.perGamePlays["sudoku_completed"] ? 1 : 0, (gid === "sudoku" && !!result?.completed) || (stats.perGamePlays["sudoku_completed"] ?? 0) > 0);
  const sudokuDiff = gid === "sudoku" ? String(result?.meta?.["difficulty"] ?? "") : "";
  set("sudoku-hard", (sudokuDiff === "hard" || sudokuDiff === "expert") && !!result?.completed ? 1 : 0, (sudokuDiff === "hard" || sudokuDiff === "expert") && !!result?.completed);

  set("mines-first", gid === "minesweeper" && !!result?.completed ? 1 : 0, gid === "minesweeper" && !!result?.completed);
  set("sliding-first", gid === "sliding" && !!result?.completed ? 1 : 0, gid === "sliding" && !!result?.completed);

  const snakeScore = gid === "snake" ? (result?.score ?? 0) : 0;
  set("snake-100", Math.max(snakeScore, stats.perGameBest["snake"] ?? 0), (stats.perGameBest["snake"] ?? 0) >= 100);
  set("snake-300", Math.max(snakeScore, stats.perGameBest["snake"] ?? 0), (stats.perGameBest["snake"] ?? 0) >= 300);

  const quizScore = gid === "quiz" ? num(m, "correct") : 0;
  const quizTotal = gid === "quiz" ? num(m, "total") : 0;
  set("quiz-7", quizTotal >= 10 && quizScore >= 7 ? 7 : 0, quizTotal >= 10 && quizScore >= 7);
  set("quiz-perfect", quizTotal >= 10 && quizScore >= 10 ? 10 : 0, quizTotal >= 10 && quizScore >= 10);

  const nepalScore = gid === "nepal" ? (result?.score ?? 0) : 0;
  set("nepal-5", Math.max(nepalScore, stats.perGameBest["nepal"] ?? 0), (stats.perGameBest["nepal"] ?? 0) >= 5);
  set("nepal-9", Math.max(nepalScore, stats.perGameBest["nepal"] ?? 0), (stats.perGameBest["nepal"] ?? 0) >= 9);

  const hangWrong = gid === "hangman" ? num(m, "wrong") : 99;
  set("hangman-clean", gid === "hangman" && !!result?.completed && hangWrong <= 1 ? 1 : 0, gid === "hangman" && !!result?.completed && hangWrong <= 1);

  set("streak-3", stats.currentStreak, stats.currentStreak >= 3);
  set("streak-7", stats.longestStreak, stats.longestStreak >= 7);
  set("streak-30", stats.longestStreak, stats.longestStreak >= 30);
  set("night-owl", hour >= 0 && hour < 5 ? 1 : 0, hour >= 0 && hour < 5);
  set("early-bird", hour >= 5 && hour < 8 ? 1 : 0, hour >= 5 && hour < 8);
  set("daily-first", num(m, "dailyDone") === 1 ? 1 : stats.perGamePlays["daily_done"] ? 1 : 0, num(m, "dailyDone") === 1 || (stats.perGamePlays["daily_done"] ?? 0) > 0);

  return out;
}

export function rarityXp(id: string): number {
  return ACHIEVEMENTS.find((a) => a.id === id)?.xp ?? 10;
}

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export type { AchievementCategory };

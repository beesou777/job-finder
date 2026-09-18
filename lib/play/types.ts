// KamKhoj Play — shared TypeScript types (frontend-only, no backend).
// Pure types; no runtime code here so game logic stays testable.

export type PlayThemeId = "default" | "midnight" | "arcade" | "calm";

export type GameCategory =
  | "quick"
  | "puzzle"
  | "memory"
  | "reflex"
  | "typing"
  | "knowledge"
  | "classic"
  | "nepal";

export type GameStatus = "idle" | "playing" | "paused" | "finished";

export interface GameMeta {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: GameCategory[];
  /** minutes, rough */
  minutes: number;
  instructions: string[];
  controls: string[];
  supportsResume: boolean;
}

export interface PlayerProfile {
  playerId: string;
  nickname: string;
  avatar: string;
  theme: PlayThemeId;
  sound: boolean;
  volume: number; // 0..1
  reducedMotion: boolean;
  createdAt: number;
}

export interface PlayStats {
  xp: number;
  totalPlayMs: number;
  sessions: number;
  completed: number;
  perGamePlays: Record<string, number>;
  perGameBest: Record<string, number>;
  favorites: string[];
  recentGameIds: string[];
  lastPlayedAt: Record<string, number>;
  playDates: string[]; // YYYY-MM-DD, capped
  currentStreak: number;
  longestStreak: number;
}

export interface GameSession {
  id: string;
  gameId: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  score: number;
  completed: boolean;
  meta?: Record<string, number | string | boolean>;
}

export type AchievementRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type AchievementCategory =
  | "getting-started"
  | "reflex"
  | "puzzle"
  | "memory"
  | "typing"
  | "knowledge"
  | "streak"
  | "mastery";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon key used by UI map
  category: AchievementCategory;
  rarity: AchievementRarity;
  xp: number;
  target: number;
  hidden?: boolean;
}

export interface AchievementState {
  progress: number;
  unlockedAt: number | null;
}

export interface GameResult {
  gameId: string;
  score: number;
  completed: boolean;
  durationMs: number;
  meta?: Record<string, number | string | boolean>;
}

export interface DailyChallenge {
  id: string;
  date: string;
  gameId: string;
  title: string;
  detail: string;
  target: number;
  metric: string;
  xp: number;
}

export interface PersistedSave {
  gameId: string;
  updatedAt: number;
  label: string;
  state: unknown;
}

export const XP_RARITY: Record<AchievementRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 200,
};

export const GAME_IDS = [
  "reaction",
  "typing",
  "snake",
  "merge",
  "memory",
  "sudoku",
  "math",
  "scramble",
  "hangman",
  "color",
  "aim",
  "sequence",
  "number-memory",
  "visual-memory",
  "nepal",
  "quiz",
  "tictactoe",
  "connect4",
  "minesweeper",
  "sliding",
] as const;

export type GameId = (typeof GAME_IDS)[number];

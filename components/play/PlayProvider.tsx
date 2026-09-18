"use client";
// KamKhoj Play — central client state: profile, stats, achievements, sessions,
// saves, daily completion, favorites. Versioned localStorage via lib/play/storage.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AchievementState,
  GameResult,
  GameSession,
  PersistedSave,
  PlayerProfile,
  PlayStats,
} from "@/lib/play/types";
import {
  loadStored,
  makeId,
  makePlayerId,
  removeStored,
  saveStored,
  todayKey,
} from "@/lib/play/storage";
import { evaluateAchievements, ACHIEVEMENTS } from "@/lib/play/achievements";
import { getDailyChallenges } from "@/lib/play/daily";
import { levelFromXp, updateStreak, xpForSession } from "@/lib/play/xp";
import { soundManager } from "@/lib/play/sound";

export interface Toast {
  id: string;
  title: string;
  body: string;
  kind: "achievement" | "level" | "daily" | "info";
}

interface PlayContextValue {
  ready: boolean;
  profile: PlayerProfile;
  stats: PlayStats;
  achievements: Record<string, AchievementState>;
  sessions: GameSession[];
  saves: Record<string, PersistedSave>;
  dailyDone: Record<string, string[]>; // date -> challenge ids
  toasts: Toast[];
  level: number;
  dismissToast: (id: string) => void;
  updateProfile: (patch: Partial<PlayerProfile>) => void;
  toggleFavorite: (gameId: string) => void;
  recordResult: (result: GameResult) => { xpGained: number; newUnlocks: string[]; leveledUp: boolean };
  saveGame: (gameId: string, label: string, state: unknown) => void;
  clearSave: (gameId: string) => void;
  completeDaily: (date: string, challengeId: string, gameId?: string) => void;
  exportData: () => string;
  importData: (json: string) => { ok: boolean; error?: string };
  resetStats: () => void;
  resetSaves: () => void;
  resetAll: () => void;
  playSound: (name: "click" | "success" | "error" | "achievement" | "gameover" | "levelup" | "flip" | "pop") => void;
}

const PlayContext = createContext<PlayContextValue | null>(null);

const AVATARS = ["🐯", "🦁", "🐼", "🦊", "🐸", "🐵", "🦄", "🐝", "🦅", "🐢", "🦋", "🐬"];

export { AVATARS };

function defaultProfile(): PlayerProfile {
  return {
    playerId: makePlayerId(),
    nickname: "Player",
    avatar: "🐯",
    theme: "default",
    sound: true,
    volume: 0.5,
    reducedMotion: false,
    createdAt: Date.now(),
  };
}

function defaultStats(): PlayStats {
  return {
    xp: 0,
    totalPlayMs: 0,
    sessions: 0,
    completed: 0,
    perGamePlays: {},
    perGameBest: {},
    favorites: [],
    recentGameIds: [],
    lastPlayedAt: {},
    playDates: [],
    currentStreak: 0,
    longestStreak: 0,
  };
}

const MAX_SESSIONS = 200;

export function PlayProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<PlayerProfile>(defaultProfile);
  const [stats, setStats] = useState<PlayStats>(defaultStats);
  const [achievements, setAchievements] = useState<Record<string, AchievementState>>({});
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [saves, setSaves] = useState<Record<string, PersistedSave>>({});
  const [dailyDone, setDailyDone] = useState<Record<string, string[]>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const hydrated = useRef(false);

  // hydrate once
  useEffect(() => {
    setProfile(loadStored("profile", defaultProfile()));
    setStats(loadStored("stats", defaultStats()));
    setAchievements(loadStored("achievements", {}));
    setSessions(loadStored("sessions", []));
    setSaves(loadStored("saves", {}));
    setDailyDone(loadStored("daily", {}));
    hydrated.current = true;
    setReady(true);
  }, []);

  // persist (debounced lightly by effect batching)
  useEffect(() => {
    if (!hydrated.current) return;
    saveStored("profile", profile);
    soundManager.configure({ enabled: profile.sound, volume: profile.volume });
    try {
      document.documentElement.dataset.playTheme = profile.theme;
    } catch { /* noop */ }
  }, [profile]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStored("stats", stats);
  }, [stats]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStored("achievements", achievements);
  }, [achievements]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStored("sessions", sessions.slice(0, MAX_SESSIONS));
  }, [sessions]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStored("saves", saves);
  }, [saves]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStored("daily", dailyDone);
  }, [dailyDone]);

  // reduced motion: reflect OS preference initially
  useEffect(() => {
    try {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        setProfile((p) => (p.reducedMotion ? p : { ...p, reducedMotion: true }));
      }
    } catch { /* noop */ }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = makeId("toast");
    setToasts((t) => [...t.slice(-3), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 5200);
  }, []);

  const updateProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const toggleFavorite = useCallback((gameId: string) => {
    setStats((s) => {
      const has = s.favorites.includes(gameId);
      return { ...s, favorites: has ? s.favorites.filter((f) => f !== gameId) : [...s.favorites, gameId] };
    });
  }, []);

  const recordResult = useCallback(
    (result: GameResult) => {
      const now = Date.now();
      const hour = new Date().getHours();
      const today = todayKey();
      const xpGained = xpForSession(result.score, result.completed, result.durationMs);
      const prevLevel = levelFromXp(stats.xp);
      const newUnlocks: string[] = [];

      const session: GameSession = {
        id: makeId("sess"),
        gameId: result.gameId,
        startedAt: now - Math.max(0, result.durationMs),
        endedAt: now,
        durationMs: Math.max(0, result.durationMs),
        score: result.score,
        completed: result.completed,
        meta: result.meta,
      };

      // best tracking: lower-is-better for reaction only
      const lowerBetter = result.gameId === "reaction";
      setStats((s) => {
        const perGamePlays = { ...s.perGamePlays, [result.gameId]: (s.perGamePlays[result.gameId] ?? 0) + 1 };
        if (result.meta?.["sudokuSolved"] === 1 && result.gameId === "sudoku") {
          perGamePlays["sudoku_completed"] = (perGamePlays["sudoku_completed"] ?? 0) + 1;
        }
        if (result.meta?.["dailyDone"] === 1) {
          perGamePlays["daily_done"] = (perGamePlays["daily_done"] ?? 0) + 1;
        }
        const prevBest = s.perGameBest[result.gameId];
        let nextBest = prevBest;
        if (result.completed || result.score > 0) {
          nextBest = prevBest === undefined ? result.score : lowerBetter ? Math.min(prevBest, result.score) : Math.max(prevBest, result.score);
        }
        const streak = updateStreak(s.playDates, today, s);
        const recent = [result.gameId, ...s.recentGameIds.filter((g) => g !== result.gameId)].slice(0, 8);
        return {
          ...s,
          xp: s.xp + xpGained,
          totalPlayMs: s.totalPlayMs + session.durationMs,
          sessions: s.sessions + 1,
          completed: s.completed + (result.completed ? 1 : 0),
          perGamePlays,
          perGameBest: nextBest === undefined ? s.perGameBest : { ...s.perGameBest, [result.gameId]: nextBest },
          recentGameIds: recent,
          lastPlayedAt: { ...s.lastPlayedAt, [result.gameId]: now },
          ...streak,
        };
      });
      setSessions((prev) => [session, ...prev].slice(0, MAX_SESSIONS));

      // evaluate achievements against the *projected* snapshot
      setStats((s) => {
        const distinct = new Set([...Object.keys(s.perGamePlays).filter((k) => !k.includes("_") && (s.perGamePlays[k] ?? 0) > 0), result.gameId]).size;
        const evaled = evaluateAchievements({
          stats: s,
          result,
          distinctGames: distinct,
          hour,
          unlockedIds: new Set(Object.keys(achievements).filter((k) => achievements[k]?.unlockedAt)),
        });
        setAchievements((prev) => {
          const next = { ...prev };
          for (const def of ACHIEVEMENTS) {
            const e = evaled[def.id];
            if (!e) continue;
            const cur = next[def.id];
            if (e.unlocked && !cur?.unlockedAt) {
              next[def.id] = { progress: def.target, unlockedAt: now };
              newUnlocks.push(def.id);
            } else if (!cur?.unlockedAt && e.progress > (cur?.progress ?? 0)) {
              next[def.id] = { progress: e.progress, unlockedAt: null };
            }
          }
          return next;
        });
        return s;
      });

      const leveledUp = levelFromXp(stats.xp + xpGained) > prevLevel;
      if (leveledUp) {
        soundManager.play("levelup");
        pushToast({ title: `Level ${levelFromXp(stats.xp + xpGained)} reached`, body: "Your XP keeps climbing. Nice work.", kind: "level" });
      }
      // unlock toasts (deferred so state settles)
      window.setTimeout(() => {
        for (const id of newUnlocks) {
          const def = ACHIEVEMENTS.find((a) => a.id === id);
          if (!def) continue;
          soundManager.play("achievement");
          pushToast({ title: `Achievement: ${def.title}`, body: `${def.description} (+${def.xp} XP)`, kind: "achievement" });
          setStats((s) => ({ ...s, xp: s.xp + def.xp }));
        }
      }, 60);

      // daily auto-check: did this result satisfy one of today's challenges?
      try {
        const challenges = getDailyChallenges(today);
        const metricOf: Record<string, number> = {};
        const meta = result.meta ?? {};
        if (result.gameId === "math") metricOf["math_score"] = result.score;
        if (result.gameId === "reaction" && typeof meta["bestMs"] === "number") metricOf["reaction_best"] = meta["bestMs"] as number;
        if (result.gameId === "memory" && result.completed && typeof meta["moves"] === "number") metricOf["memory_moves"] = meta["moves"] as number;
        if (result.gameId === "typing" && typeof meta["wpm"] === "number") metricOf["typing_wpm"] = meta["wpm"] as number;
        if (result.gameId === "nepal") metricOf["nepal_score"] = result.score;
        if (result.gameId === "snake") metricOf["snake_score"] = result.score;
        if (result.gameId === "aim" && typeof meta["hits"] === "number") metricOf["aim_hits"] = meta["hits"] as number;
        if (result.gameId === "scramble" && typeof meta["solves"] === "number") metricOf["scramble_solves"] = meta["solves"] as number;
        for (const c of challenges) {
          const v = metricOf[c.metric];
          if (v === undefined) continue;
          const pass = c.metric === "reaction_best" || c.metric === "memory_moves" ? v > 0 && v <= c.target : v >= c.target;
          if (pass) {
            setDailyDone((prev) => {
              const cur = prev[today] ?? [];
              if (cur.includes(c.id)) return prev;
              soundManager.play("success");
              pushToast({ title: "Daily challenge complete", body: `${c.title} (+${c.xp} XP)`, kind: "daily" });
              setStats((s) => ({ ...s, xp: s.xp + c.xp }));
              return { ...prev, [today]: [...cur, c.id] };
            });
          }
        }
      } catch { /* never break gameplay */ }

      return { xpGained, newUnlocks, leveledUp };
    },
    [stats.xp, achievements, pushToast],
  );

  const saveGame = useCallback((gameId: string, label: string, state: unknown) => {
    setSaves((prev) => ({ ...prev, [gameId]: { gameId, updatedAt: Date.now(), label, state } }));
  }, []);

  const clearSave = useCallback((gameId: string) => {
    setSaves((prev) => {
      const next = { ...prev };
      delete next[gameId];
      return next;
    });
  }, []);

  const completeDaily = useCallback(
    (date: string, challengeId: string) => {
      setDailyDone((prev) => {
        if ((prev[date] ?? []).includes(challengeId)) return prev;
        return { ...prev, [date]: [...(prev[date] ?? []), challengeId] };
      });
    },
    [],
  );

  const exportData = useCallback(() => {
    return JSON.stringify(
      { app: "kamkhoj-play", v: 1, exportedAt: Date.now(), profile, stats, achievements, sessions: sessions.slice(0, 200), saves, dailyDone },
      null,
      2,
    );
  }, [profile, stats, achievements, sessions, saves, dailyDone]);

  const importData = useCallback(
    (json: string) => {
      try {
        const parsed = JSON.parse(json) as Record<string, unknown>;
        if (!parsed || typeof parsed !== "object") return { ok: false, error: "That file is not valid JSON." };
        if ((parsed as { app?: string }).app !== "kamkhoj-play") return { ok: false, error: "This file is not a KamKhoj Play export." };
        const prof = (parsed as { profile?: unknown }).profile as PlayerProfile;
        if (!prof || typeof prof.nickname !== "string" || typeof prof.playerId !== "string") {
          return { ok: false, error: "Export is missing a valid player profile." };
        }
        const st = (parsed as { stats?: unknown }).stats as PlayStats;
        if (!st || typeof st.xp !== "number") return { ok: false, error: "Export is missing valid statistics." };
        setProfile({ ...defaultProfile(), ...prof, playerId: String(prof.playerId).slice(0, 40) });
        setStats({ ...defaultStats(), ...st });
        const ach = (parsed as { achievements?: unknown }).achievements;
        if (ach && typeof ach === "object") setAchievements(ach as Record<string, AchievementState>);
        const sess = (parsed as { sessions?: unknown }).sessions;
        if (Array.isArray(sess)) setSessions(sess.slice(0, 200) as GameSession[]);
        const sv = (parsed as { saves?: unknown }).saves;
        if (sv && typeof sv === "object") setSaves(sv as Record<string, PersistedSave>);
        const dd = (parsed as { dailyDone?: unknown }).dailyDone;
        if (dd && typeof dd === "object") setDailyDone(dd as Record<string, string[]>);
        return { ok: true };
      } catch {
        return { ok: false, error: "Could not parse that file. Please choose a valid export." };
      }
    },
    [],
  );

  const resetStats = useCallback(() => {
    setStats(defaultStats());
    setAchievements({});
    setSessions([]);
    setDailyDone({});
    removeStored("stats");
    removeStored("achievements");
    removeStored("sessions");
    removeStored("daily");
  }, []);

  const resetSaves = useCallback(() => {
    setSaves({});
    removeStored("saves");
  }, []);

  const resetAll = useCallback(() => {
    const fresh = defaultProfile();
    setProfile({ ...fresh, playerId: profile.playerId });
    setStats(defaultStats());
    setAchievements({});
    setSessions([]);
    setSaves({});
    setDailyDone({});
  }, [profile.playerId]);

  const playSound = useCallback(
    (name: "click" | "success" | "error" | "achievement" | "gameover" | "levelup" | "flip" | "pop") => {
      soundManager.configure({ enabled: profile.sound, volume: profile.volume });
      soundManager.play(name);
    },
    [profile.sound, profile.volume],
  );

  const value = useMemo<PlayContextValue>(
    () => ({
      ready, profile, stats, achievements, sessions, saves, dailyDone, toasts,
      level: levelFromXp(stats.xp),
      dismissToast, updateProfile, toggleFavorite, recordResult, saveGame,
      clearSave, completeDaily, exportData, importData, resetStats, resetSaves, resetAll, playSound,
    }),
    [ready, profile, stats, achievements, sessions, saves, dailyDone, toasts, dismissToast, updateProfile, toggleFavorite, recordResult, saveGame, clearSave, completeDaily, exportData, importData, resetStats, resetSaves, resetAll, playSound],
  );

  return <PlayContext.Provider value={value}>{children}</PlayContext.Provider>;
}

export function usePlay(): PlayContextValue {
  const ctx = useContext(PlayContext);
  if (!ctx) throw new Error("usePlay must be used inside <PlayProvider>");
  return ctx;
}

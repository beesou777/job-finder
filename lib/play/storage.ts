// KamKhoj Play — versioned, crash-safe browser persistence layer.
// All Play storage goes through here; no raw localStorage calls elsewhere.

const PREFIX = "kkplay";
const VERSION = 1;

export interface Envelope<T> {
  v: number;
  data: T;
}

function storageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const k = "__kkplay_probe__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadStored<T>(key: string, fallback: T): T {
  try {
    if (!storageAvailable()) return fallback;
    const raw = window.localStorage.getItem(`${PREFIX}.v${VERSION}.${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (!parsed || typeof parsed !== "object" || !("data" in parsed)) return fallback;
    if ((parsed as { v?: number }).v !== VERSION) return fallback;
    return (parsed.data ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function saveStored<T>(key: string, data: T): boolean {
  try {
    if (!storageAvailable()) return false;
    const env: Envelope<T> = { v: VERSION, data };
    window.localStorage.setItem(`${PREFIX}.v${VERSION}.${key}`, JSON.stringify(env));
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: string): void {
  try {
    if (!storageAvailable()) return;
    window.localStorage.removeItem(`${PREFIX}.v${VERSION}.${key}`);
  } catch {
    // ignore
  }
}

export function storageKeys(): string[] {
  return [
    "profile",
    "stats",
    "achievements",
    "sessions",
    "saves",
    "daily",
    "records",
    "prefs",
  ];
}

export function clearAllPlayData(): void {
  for (const k of storageKeys()) removeStored(k);
}

export function makeId(prefix: string): string {
  try {
    const rnd = Math.floor(Math.random() * 0xffffffff).toString(36);
    return `${prefix}_${Date.now().toString(36)}${rnd}`.slice(0, 24);
  } catch {
    return `${prefix}_${Date.now()}`;
  }
}

export function makePlayerId(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  try {
    const buf = new Uint32Array(6);
    crypto.getRandomValues(buf);
    for (let i = 0; i < 6; i++) s += chars[buf[i] % chars.length];
  } catch {
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `player_${s}`;
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

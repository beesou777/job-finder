// KamKhoj Play — Web Audio sound manager (no assets, lazy AudioContext).
// Respects autoplay policies: context resumes on first user gesture.

export type PlaySoundName =
  | "click"
  | "success"
  | "error"
  | "achievement"
  | "gameover"
  | "levelup"
  | "flip"
  | "pop";

let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.5;

function audio(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (!enabled) return null;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType,
  gain: number,
): void {
  const ac = audio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + startAt;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain * volume), t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch {
    // never crash a game over audio
  }
}

const SEQUENCES: Record<PlaySoundName, Array<[number, number, number, OscillatorType, number]>> = {
  click: [[520, 0, 0.07, "sine", 0.25]],
  flip: [[340, 0, 0.08, "triangle", 0.25]],
  pop: [[660, 0, 0.09, "square", 0.12]],
  success: [
    [523, 0, 0.12, "sine", 0.3],
    [659, 0.09, 0.12, "sine", 0.3],
    [784, 0.18, 0.2, "sine", 0.3],
  ],
  error: [[196, 0, 0.22, "sawtooth", 0.14]],
  achievement: [
    [523, 0, 0.12, "triangle", 0.3],
    [659, 0.1, 0.12, "triangle", 0.3],
    [784, 0.2, 0.12, "triangle", 0.3],
    [1046, 0.3, 0.28, "triangle", 0.32],
  ],
  gameover: [
    [392, 0, 0.16, "triangle", 0.25],
    [330, 0.14, 0.16, "triangle", 0.25],
    [262, 0.28, 0.3, "triangle", 0.25],
  ],
  levelup: [
    [440, 0, 0.1, "square", 0.1],
    [554, 0.09, 0.1, "square", 0.1],
    [659, 0.18, 0.1, "square", 0.1],
    [880, 0.27, 0.24, "square", 0.12],
  ],
};

export const soundManager = {
  configure(opts: { enabled: boolean; volume: number }): void {
    enabled = opts.enabled;
    volume = Math.min(1, Math.max(0, opts.volume));
  },
  play(name: PlaySoundName): void {
    if (!enabled) return;
    const seq = SEQUENCES[name];
    if (!seq) return;
    for (const [f, at, dur, type, g] of seq) tone(f, at, dur, type, g);
  },
  dispose(): void {
    try {
      if (ctx) void ctx.close().catch(() => undefined);
    } catch {
      // ignore
    }
    ctx = null;
  },
};

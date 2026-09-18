"use client";
// Play settings — identity, theme, sound, motion, data import/export, danger zone.

import React, { useRef, useState } from "react";
import { usePlay, AVATARS } from "@/components/play/PlayProvider";
import type { PlayThemeId } from "@/lib/play/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    profile, updateProfile, exportData, importData,
    resetStats, resetSaves, resetAll, playSound,
  } = usePlay();
  const [name, setName] = useState(profile.nickname);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"stats" | "saves" | "all" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // keep local name in sync if profile loads late
  React.useEffect(() => setName(profile.nickname), [profile.nickname]);

  const saveName = () => {
    const clean = name.trim().slice(0, 24) || "Player";
    updateProfile({ nickname: clean });
    playSound("success");
    setMsg(`Nickname saved as “${clean}”.`);
  };

  const download = () => {
    try {
      const blob = new Blob([exportData()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kamkhoj-play-${profile.playerId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Export downloaded. Keep it safe to transfer progress between browsers.");
    } catch {
      setMsg("Export failed — your browser blocked the download.");
    }
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    const text = await f.text();
    const r = importData(text);
    setMsg(r.ok ? "Import successful — welcome back!" : r.error ?? "Import failed.");
    if (r.ok) playSound("success");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <h1 className="text-2xl font-black tracking-tight text-[#102e67]">Play settings</h1>
      <p className="text-sm text-slate-500">Player ID <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{profile.playerId}</code> (local only — not an account).</p>
      {msg && <p className="mt-3 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800" role="status">{msg}</p>}

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#102e67]">Identity</h2>
        <label className="mt-3 block text-xs font-black uppercase tracking-widest text-slate-400" htmlFor="nickname">Nickname</label>
        <div className="mt-1 flex gap-2">
          <input id="nickname" value={name} onChange={(e) => setName(e.target.value)} maxLength={24}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400" />
          <button onClick={saveName} className="shrink-0 rounded-xl bg-[#102e67] px-4 text-sm font-black text-white">Save</button>
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-400">Avatar</p>
        <div className="mt-1 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {AVATARS.map((a) => (
            <button key={a} onClick={() => { updateProfile({ avatar: a }); playSound("pop"); }}
              aria-label={`Avatar ${a}`} aria-pressed={profile.avatar === a}
              className={cn("flex h-11 items-center justify-center rounded-xl border-2 text-2xl", profile.avatar === a ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-blue-200")}>
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#102e67]">Look & feel</h2>
        <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">Play theme</p>
        <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["default", "midnight", "arcade", "calm"] as PlayThemeId[]).map((t) => (
            <button key={t} onClick={() => updateProfile({ theme: t })}
              className={cn("rounded-xl border-2 px-3 py-2.5 text-left", profile.theme === t ? "border-blue-500 bg-blue-50" : "border-slate-100")}
              aria-pressed={profile.theme === t}>
              <span className="block text-sm font-black capitalize text-[#102e67]">{t}</span>
              <span className="mt-1 flex gap-1" aria-hidden>
                <i className={cn("h-4 w-4 rounded", t === "midnight" ? "bg-[#0a1428]" : t === "arcade" ? "bg-[#101018]" : t === "calm" ? "bg-[#dfe8d8]" : "bg-[#dbe7f7]")} />
                <i className="h-4 w-4 rounded bg-blue-500" />
                <i className="h-4 w-4 rounded bg-white ring-1 ring-slate-200" />
              </span>
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={profile.reducedMotion} onChange={(e) => updateProfile({ reducedMotion: e.target.checked })} className="h-5 w-5 accent-blue-600" />
          <span className="text-sm font-bold text-slate-600">Reduce motion <span className="font-normal text-slate-400">(calmer animations)</span></span>
        </label>
      </section>

      <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#102e67]">Sound</h2>
        <label className="mt-2 flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={profile.sound} onChange={(e) => { updateProfile({ sound: e.target.checked }); }} className="h-5 w-5 accent-blue-600" />
          <span className="text-sm font-bold text-slate-600">Sound effects</span>
        </label>
        <label className="mt-3 block text-xs font-black uppercase tracking-widest text-slate-400" htmlFor="vol">Effects volume: {Math.round(profile.volume * 100)}%</label>
        <div className="flex items-center gap-2">
          <input id="vol" type="range" min={0} max={100} value={Math.round(profile.volume * 100)}
            onChange={(e) => updateProfile({ volume: Number(e.target.value) / 100 })} className="w-full accent-blue-600" />
          <button onClick={() => playSound("pop")} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500">Test</button>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#102e67]">Transfer progress</h2>
        <p className="mt-1 text-[13px] text-slate-500">Export your profile, XP, achievements and saves as JSON, then import it in another browser. No cloud involved.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={download} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Export JSON</button>
          <button onClick={() => fileRef.current?.click()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Import JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" aria-label="Import file"
            onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-red-200 bg-red-50/50 p-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-red-800">Danger zone</h2>
        {!confirm ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <DangerBtn label="Reset statistics" onClick={() => setConfirm("stats")} />
            <DangerBtn label="Delete saved games" onClick={() => setConfirm("saves")} />
            <DangerBtn label="Delete ALL Play data" onClick={() => setConfirm("all")} />
          </div>
        ) : (
          <div className="mt-2 rounded-xl bg-white p-3">
            <p className="text-sm font-bold text-slate-600">
              {confirm === "stats" && "Delete XP, sessions, achievements and streaks? Saved games stay."}
              {confirm === "saves" && "Delete unfinished runs (2048, Sudoku, Sliding)? Statistics stay."}
              {confirm === "all" && "Delete EVERYTHING — profile, XP, achievements, saves, history? This cannot be undone."}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  if (confirm === "stats") resetStats();
                  if (confirm === "saves") resetSaves();
                  if (confirm === "all") resetAll();
                  setMsg("Done. Fresh start!");
                  setConfirm(null);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white"
              >
                Yes, delete
              </button>
              <button onClick={() => setConfirm(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DangerBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
      {label}
    </button>
  );
}

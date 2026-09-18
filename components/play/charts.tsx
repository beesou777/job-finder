"use client";
// KamKhoj Play — tiny SVG charts (no chart dependency): sparkline + XP ring.

import React from "react";

export function Sparkline({ values, width = 120, height = 36, stroke = "#1769e8" }: { values: number[]; width?: number; height?: number; stroke?: string }) {
  if (!values.length) {
    return <div className="text-xs text-slate-400">No data yet</div>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * (width - 4) + 2;
    const y = height - 3 - ((v - min) / span) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Performance trend">
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const [cx, cy] = p.split(",");
        return <circle key={i} cx={cx} cy={cy} r={2} fill={stroke} />;
      })}
    </svg>
  );
}

export function XpBar({ into, need, level }: { into: number; need: number; level: number }) {
  const pct = Math.min(100, Math.max(0, (into / Math.max(1, need)) * 100));
  return (
    <div aria-label={`Level ${level}, ${into} of ${need} XP`}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-blue-700">Level {level}</span>
        <span className="text-[11px] font-bold tabular-nums text-slate-500">{into}/{need} XP</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-[.12em] text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-black tabular-nums text-[#102e67]">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

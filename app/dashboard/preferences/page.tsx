"use client";
import Link from "next/link";
import { KeyboardEvent, useEffect, useState } from "react";
type Pref = {
  preferredRole: string;
  preferredKeywords: string[];
  preferredLocation: string;
  preferredJobType: string;
  preferredWorkMode: string;
  emailAlerts: boolean;
};
export default function Preferences() {
  const [p, setP] = useState<Pref>({
    preferredRole: "",
    preferredKeywords: [],
    preferredLocation: "",
    preferredJobType: "",
    preferredWorkMode: "",
    emailAlerts: true,
  });
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch("/api/me/preferences")
      .then((r) => r.json())
      .then(
        (d) =>
          d.preferences &&
          setP({
            ...d.preferences,
            preferredKeywords: d.preferences.preferredKeywords || [],
          }),
      );
  }, []);
  function add(raw: string) {
    const value = raw.trim().replace(/,$/, "");
    if (value && !p.preferredKeywords.some((x) => x.toLowerCase() === value.toLowerCase()))
      setP({ ...p, preferredKeywords: [...p.preferredKeywords, value] });
    setInput("");
  }
  function key(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    }
  }
  function remove(value: string) {
    setP({
      ...p,
      preferredKeywords: p.preferredKeywords.filter((x) => x !== value),
    });
  }
  async function save() {
    await fetch("/api/me/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    setSaved(true);
  }
  return (
    <main className="mx-auto max-w-3xl p-5 md:p-10">
      <h1 className="mt-8 text-4xl font-black text-white">What should we look for?</h1>
      <p className="mt-2 text-zinc-500">
        Add several roles or skills. We’ll match them across job titles, categories, companies,
        descriptions, and requirements.
      </p>
      <div className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-[#171715] p-6">
        <label className="block text-sm text-zinc-300">
          Roles and keywords
          <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 focus-within:border-primary">
            {p.preferredKeywords.map((x) => (
              <button
                type="button"
                key={x}
                onClick={() => setInput(x)}
                className="group rounded-lg bg-primary/15 px-3 py-1.5 text-sm text-primary"
              >
                {x}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(x);
                  }}
                  className="ml-2 text-primary/60 group-hover:text-primary"
                >
                  ×
                </span>
              </button>
            ))}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={key}
              onBlur={() => input && add(input)}
              placeholder={
                p.preferredKeywords.length
                  ? "Add another role or skill…"
                  : "e.g. frontend developer"
              }
              className="min-w-[180px] flex-1 bg-transparent px-2 py-1 text-white outline-none placeholder:text-zinc-600"
            />
          </div>
          <span className="mt-2 block text-xs text-zinc-600">
            Press Enter or comma after each keyword. Click a chip to edit it.
          </span>
        </label>
        <Field
          label="Location"
          value={p.preferredLocation}
          onChange={(v) => setP({ ...p, preferredLocation: v })}
          placeholder="Kathmandu, Remote…"
        />
        <Select
          label="Job type"
          value={p.preferredJobType}
          onChange={(v) => setP({ ...p, preferredJobType: v })}
          options={["", "full-time", "part-time", "contract", "internship"]}
        />
        <Select
          label="Work mode"
          value={p.preferredWorkMode}
          onChange={(v) => setP({ ...p, preferredWorkMode: v })}
          options={["", "remote", "hybrid", "onsite"]}
        />
        <button onClick={save} className="rounded-xl bg-primary px-5 py-3 font-bold text-zinc-950">
          {saved ? "Saved" : "Save preferences"}
        </button>
      </div>
    </main>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm text-zinc-300">
      {label}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-600"
      />
    </label>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-sm text-zinc-300">
      {label}
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o || "Any"}
          </option>
        ))}
      </select>
    </label>
  );
}

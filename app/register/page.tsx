"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "Could not create account");
      return;
    }
    router.push("/login?registered=1");
  }
  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your preferences and get a more personal job search."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm text-zinc-300">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Password <span className="text-zinc-500">(8+ characters)</span>
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="w-full rounded-xl bg-primary py-3 font-bold text-zinc-950">
          Create account
        </button>
        <p className="text-center text-sm text-zinc-400">
          Already registered?{" "}
          <Link className="text-primary" href="/login">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

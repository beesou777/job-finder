"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Loader2, LockKeyhole, Mail } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Could not create account");
        setIsLoading(false);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your KamKhoj account."
      subtitle="Build your profile, save preferences, and discover opportunities that fit your experience."
    >
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-semibold text-[#334f7d]">
          Email
          <span className="relative mt-2 block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#404443]" />
            <input
              required
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-xl border border-[#cfdcd8] bg-[#f4f8f7] pl-11 pr-4 text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </span>
        </label>
        <label className="block text-sm font-semibold text-[#334f7d]">
          Password <span className="font-normal text-[#7183a3]">(8+ characters)</span>
          <span className="relative mt-2 block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#404443]" />
            <input
              required
              minLength={8}
              type="password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 w-full rounded-xl border border-[#cfdcd8] bg-[#f4f8f7] pl-11 pr-4 text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </span>
        </label>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            "Create account"
          )}
        </button>
        <p className="text-center text-sm text-[#617493]">
          Already registered?{" "}
          <Link className="font-bold text-primary hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

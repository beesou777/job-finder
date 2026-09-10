"use client";
import Link from "next/link";
import { useSession } from "@/lib/auth-context";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { Loader2, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back to KamKhoj."
      subtitle="Continue your search, review matched opportunities, and keep your career profile up to date."
    >
      <form onSubmit={submit} className="space-y-5">
        <Input label="Email" type="email" value={email} onChange={setEmail} disabled={isLoading} />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          disabled={isLoading}
        />
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
              <span>Logging in...</span>
            </>
          ) : (
            "Log in"
          )}
        </button>
        <p className="text-center text-sm text-[#617493]">
          New here?{" "}
          <Link className="font-bold text-primary hover:underline" href="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function Input({
  label,
  type,
  value,
  onChange,
  disabled,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const Icon = type === "email" ? Mail : LockKeyhole;

  return (
    <label className="block text-sm font-semibold text-[#334f7d]">
      {label}
      <span className="relative mt-2 block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#404443]" />
        <input
          required
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-full rounded-xl border border-[#cfdcd8] bg-[#f4f8f7] pl-11 pr-4 text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </span>
    </label>
  );
}

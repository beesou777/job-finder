"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-context";
import { Bookmark, LayoutDashboard, LogOut, MessageSquare, Settings, Sparkles } from "lucide-react";
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "";
  const { data: session } = useSession();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden border-r border-white/10 bg-[#0b0b0a] p-5 md:flex md:flex-col">
        <Link href="/" className="px-3 text-2xl font-black text-white">
          kam<span className="text-primary">khoj</span>
        </Link>
        <p className="mb-10 mt-1 px-3 text-[10px] font-bold uppercase tracking-[.25em] text-zinc-600">
          My workspace
        </p>
        <nav className="space-y-1">
          <Item href="/dashboard" active={path === "/dashboard"} icon={<LayoutDashboard />}>
            Overview
          </Item>
          <Item
            href="/dashboard/matches"
            active={path.startsWith("/dashboard/matches")}
            icon={<Sparkles className="text-primary" />}
          >
            AI Job Matches
          </Item>
          <Item
            href="/dashboard/saved"
            active={path.startsWith("/dashboard/saved")}
            icon={<Bookmark />}
          >
            Saved jobs
          </Item>
          <Item
            href="/dashboard/interview-practice"
            active={path.startsWith("/dashboard/interview-practice")}
            icon={<MessageSquare />}
          >
            Interview practice
          </Item>
          <Item
            href="/dashboard/preferences"
            active={path.startsWith("/dashboard/preferences")}
            icon={<Settings />}
          >
            Preferences
          </Item>
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="truncate px-3 text-xs text-zinc-500">{session?.user?.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top header navigation */}
        <header className="sticky top-0 z-40 flex flex-col gap-2 border-b border-white/10 bg-[#0b0b0a]/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-black text-white">
              kam<span className="text-primary">khoj</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
            >
              <LogOut className="h-3 w-3" />
              Log out
            </button>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            <Link
              href="/dashboard"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                path === "/dashboard"
                  ? "bg-primary/15 text-primary"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/dashboard/matches"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                path.startsWith("/dashboard/matches")
                  ? "bg-primary/15 text-primary"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3 text-primary" />
              Matches
            </Link>
            <Link
              href="/dashboard/saved"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                path.startsWith("/dashboard/saved")
                  ? "bg-primary/15 text-primary"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Saved
            </Link>
            <Link
              href="/dashboard/preferences"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                path.startsWith("/dashboard/preferences")
                  ? "bg-primary/15 text-primary"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Preferences
            </Link>
            <Link
              href="/dashboard/interview-practice"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                path.startsWith("/dashboard/interview-practice")
                  ? "bg-primary/15 text-primary"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Interview
            </Link>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
function Item({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
        active ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

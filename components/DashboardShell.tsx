"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bookmark, LayoutDashboard, LogOut, MessageSquare, Settings } from "lucide-react";
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
      <div className="min-w-0 flex-1">{children}</div>
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

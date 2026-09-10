"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X, UserRound } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/linkedin-jobs", label: "LinkedIn Jobs" },
    { href: "/internships", label: "Internships" },
    { href: "/remote-jobs", label: "Remote" },
  ];

  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 px-2 py-2 backdrop-blur md:px-5">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 text-xl font-black tracking-tight text-[#112d62]"
          >
            <span>
              <span>kam</span>
              <span className="text-accent">khoj</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                      active ? "text-primary" : "text-slate-600 hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href={session ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              <UserRound className="h-4 w-4" />
              {session ? "Dashboard" : "Log in"}
            </Link>
            <Link
              href="/dashboard/interview-practice"
              className="rounded-lg bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-accent"
            >
              Interview practice
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-zinc-200 transition-colors hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-md px-4 py-3 text-base font-bold transition-all ${
                      active ? "text-primary" : "text-zinc-200 hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="px-4 pt-2">
                <Link
                  href="/dashboard/interview-practice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-white"
                >
                  Interview practice
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

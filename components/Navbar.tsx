"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  BookOpenText,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Compass,
  GraduationCap,
  Home,
  Linkedin,
  Menu,
  MessageSquareText,
  UserRound,
  X,
} from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const previousPathname = useRef(pathname);
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/linkedin-jobs", label: "LinkedIn Jobs" },
    { href: "/internships", label: "Internships" },
    { href: "/remote-jobs", label: "Remote" },
  ];

  const mobileNavLinks = [
    {
      href: "/jobs",
      label: "Jobs",
      description: "Find your next opportunity",
      icon: BriefcaseBusiness,
    },
    {
      href: "/linkedin-jobs",
      label: "LinkedIn Jobs",
      description: "Explore public LinkedIn leads",
      icon: Linkedin,
    },
    {
      href: "/internships",
      label: "Internships",
      description: "Kickstart your career",
      icon: GraduationCap,
    },
    { href: "/remote-jobs", label: "Remote", description: "Work from anywhere", icon: Home },
    {
      href: "/dashboard/interview-practice",
      label: "Interview Practice",
      description: "Prepare with focused practice",
      icon: MessageSquareText,
    }
  ];

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      setMobileMenuOpen(false);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dce8f7] text-[#102e67] transition-colors active:bg-[#eff7ff] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] h-dvh w-screen md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
            >
              <button
                className="absolute inset-0 bg-[#071a38]/45"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative flex h-dvh w-[88%] max-w-[360px] flex-col overflow-y-auto overscroll-contain bg-white shadow-[18px_0_60px_rgba(7,26,56,0.18)]">
                <div className="flex items-start justify-between border-b border-[#e5edf7] px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
                  <Link href="/" className="text-2xl font-black tracking-tight text-[#102e67]">
                    kam<span className="text-primary">khoj</span>
                    <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.22em] text-[#7183a3]">
                      Jobs for a brighter Nepal
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f6fb] text-[#102e67]"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-4 py-4">
                  <Link
                    href="/jobs"
                    className="mb-3 flex items-center gap-3 rounded-xl bg-[#eff7ff] px-3.5 py-3.5 text-[#102e67]"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary">
                      <Compass className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black">Find jobs, build your career</span>
                      <span className="mt-0.5 block text-[11px] text-[#617493]">
                        Openings, tools and resources in one place.
                      </span>
                    </span>
                  </Link>

                  <nav>
                    {mobileNavLinks.map((link) => {
                      const Icon = link.icon;
                      const active = pathname?.startsWith(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex min-h-14 items-center gap-3 border-b border-[#edf2f8] px-2 py-2.5 ${active ? "text-primary" : "text-[#102e67]"}`}
                        >
                          <Icon className="h-5 w-5 shrink-0 text-[#17549d]" strokeWidth={2.1} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold">{link.label}</span>
                            <span className="block truncate text-[11px] text-[#7183a3]">
                              {link.description}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#8ca1bf]" />
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="mt-auto border-t border-[#e5edf7] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8ca1bf]">
                    Account
                  </p>
                  <Link
                    href={session ? "/dashboard" : "/login"}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-white"
                  >
                    <UserRound className="h-4 w-4" />{" "}
                    {session ? "Open dashboard" : "Log in or create account"}
                  </Link>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/internships", label: "Internships" },
    { href: "/remote-jobs", label: "Remote" },
    { href: "/blog", label: "Blog" },
    { href: "/how-kamkhoj-works", label: "How it works" },
  ];

  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-950 px-2 py-3 md:px-5">
      <div className="mx-auto max-w-[1840px] rounded-2xl border border-white/5 bg-zinc-950/95 px-4 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link 
            href="/" 
            className="flex shrink-0 items-center gap-3 text-xl font-black tracking-tight text-white"
          >
            <span>kamkhoj</span>
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
                      active
                        ? "bg-white/10 text-primary"
                        : "text-zinc-300 hover:bg-white/10 hover:text-white"
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
              href="/jobs"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:border-primary hover:bg-primary hover:text-zinc-950"
              aria-label="Search jobs"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/post-job"
              className="rounded-full border border-primary bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-zinc-950 transition-colors hover:bg-white"
            >
              Hiring resources
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-zinc-200 transition-colors hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
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
                      active
                        ? "bg-white/10 text-primary"
                        : "text-zinc-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="px-4 pt-2">
                <Link
                  href="/post-job"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-white"
                >
                  Hiring resources
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


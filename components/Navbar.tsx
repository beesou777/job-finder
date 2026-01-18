"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    {
      href: "/jobs",
      label: "Jobs",
    },
    {
      href: "/internships",
      label: "Internships",
    },
    {
      href: "/remote-jobs",
      label: "Remote",
    },
    {
      href: "/linkedin-jobs",
      label: "LinkedIn",
    },
    {
      href: "/blog",
      label: "Blog",
    },
    {
      href: "/post-job",
      label: "Post a Job",
    },
  ];

  const supportLink = {
    href: "/about",
    label: "Buy Me a Coffee",
  };

  const isJobsPage = pathname?.startsWith("/jobs");
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left */}
          <Link 
            href="/" 
            className="text-2xl font-black text-gray-900 shrink-0"
          >
            kamkhoj
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 font-bold text-[15px] transition-all rounded-lg whitespace-nowrap ${
                      active
                        ? "text-[#0A66C2] bg-[#0A66C2]/5"
                        : "text-gray-600 hover:text-[#0A66C2] hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Support Button - Right */}
          <div className="hidden md:flex items-center shrink-0">
            <Link
              href={supportLink.href}
              className="px-6 py-2.5 font-bold text-sm text-[#0A66C2] border-2 border-[#0A66C2] rounded-full hover:bg-[#0A66C2] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {supportLink.label}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
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
          <div className="md:hidden py-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 font-bold text-base rounded-xl transition-all ${
                      active
                        ? "text-[#0A66C2] bg-[#0A66C2]/5"
                        : "text-gray-700 hover:text-[#0A66C2] hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="px-4 pt-2">
                <Link
                  href={supportLink.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 flex items-center justify-center font-bold text-base text-[#0A66C2] border-2 border-[#0A66C2] rounded-xl hover:bg-[#0A66C2] hover:text-white transition-all"
                >
                  {supportLink.label}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/internships", label: "Internships" },
  { href: "/remote-jobs", label: "Remote" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/post-job", label: "Post a job" },
  { href: "/contact", label: "Contact" },
];

const searchLinks = [
  { href: "/jobs-in-nepal", label: "Jobs in Nepal" },
  { href: "/jobs-in-kathmandu", label: "Kathmandu jobs" },
  { href: "/it-jobs-nepal", label: "IT jobs" },
  { href: "/banking-jobs-nepal", label: "Banking jobs" },
];

const legalLinks = [
  { href: "/how-kamkhoj-works", label: "How it works" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-white">
      <div className="px-4 py-10 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-medium text-zinc-200">Ready to search smarter?</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              KamKhoj keeps the job search focused: discover public listings,
              compare the important details, and continue at the original source.
            </p>
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-5 py-3 text-sm font-black text-zinc-950 transition-colors hover:bg-white"
          >
            Browse jobs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 border-y border-white/10 py-12">
          <Link
            href="/"
            className="block w-fit text-6xl font-black tracking-[-0.05em] text-white md:text-8xl lg:text-9xl"
          >
            kamkhoj
          </Link>
        </div>

        <div className="grid gap-8 py-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <p className="max-w-sm text-sm leading-6 text-zinc-400">
              Nepal job discovery for vacancies, internships, remote roles, and
              practical career routes. Applications continue at the original source.
            </p>
          </div>

          <FooterGroup title="Explore" links={footerLinks} />
          <FooterGroup title="Popular" links={searchLinks} />
          <FooterGroup title="Trust" links={legalLinks} muted />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} KamKhoj</p>
          <p>Built for job seekers in Nepal</p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
  muted = false,
}: {
  title: string;
  links: { href: string; label: string }[];
  muted?: boolean;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              muted ? "text-zinc-500 hover:text-white" : "font-bold text-zinc-300 hover:text-primary"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

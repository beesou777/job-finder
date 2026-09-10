"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const exploreLinks = [
  { href: "/jobs", label: "Jobs" },
  { href: "/internships", label: "Internships" },
  { href: "/remote-jobs", label: "Remote" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/post-job", label: "Post a job" },
  { href: "/contact", label: "Contact" },
  { href: "/tools/salary-calculator-nepal", label: "Salary calculator" },
  { href: "/dashboard/interview-practice", label: "Interview practice" },
];

// const popularLinks = [
//   { href: "/jobs-in-nepal", label: "Jobs in Nepal" },
//   { href: "/jobs-in-kathmandu", label: "Kathmandu jobs" },
//   { href: "/it-jobs-nepal", label: "IT jobs" },
//   { href: "/banking-jobs-nepal", label: "Banking jobs" },
//   { href: "/jobs/category/government", label: "Government jobs" },
//   { href: "/jobs/category/healthcare", label: "Healthcare jobs" },
//   { href: "/jobs/category/teaching", label: "Teaching jobs" },
//   { href: "/jobs/category/engineering", label: "Engineering jobs" },
// ];

const trustLinks = [
  { href: "/how-kamkhoj-works", label: "How it works" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

const socials = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "YouTube", href: "#", icon: Youtube },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative overflow-hidden border-t border-slate-100 bg-white text-[#112d62]">
      <div className="footer-visual pointer-events-none absolute inset-y-0 right-0 hidden w-[35%] bg-[url('/nepal-career-hero.png')] bg-[length:auto_92%] bg-right bg-bottom bg-no-repeat opacity-20 lg:block" />
      <p className="pointer-events-none absolute right-10 top-8 hidden max-w-[180px] rotate-[-5deg] text-right text-lg font-semibold leading-6 text-blue-600 lg:block">
        Opportunities today.
        <br />A stronger Nepal tomorrow.
      </p>
      <div className="relative mx-auto max-w-7xl px-6 pb-5 pt-10 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.85fr]">
          <div>
            <Link href="/" className="text-5xl font-black tracking-[-.07em] text-[#112d62]">
              kam<span className="text-primary">khoj</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              Nepal job discovery for vacancies, internships, remote roles, and practical career
              routes. Applications continue at the original source.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#112d62] transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <FooterGroup title="Explore" links={exploreLinks} />
          {/* <FooterGroup title="Popular" links={popularLinks} /> */}
          <FooterGroup title="Trust" links={trustLinks} />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} KamKhoj. All rights reserved.</p>
          <p>
            Built for job seekers in Nepal <span className="text-primary">◆</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 text-sm font-black text-[#112d62]">{title}</h2>
      <div className="flex flex-col gap-1.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm leading-5 text-slate-500 transition hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

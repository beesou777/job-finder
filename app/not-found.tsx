import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Compass, Home, MapPin, Search } from "lucide-react";

const destinations = [
  { href: "/remote-jobs", label: "Remote jobs" },
  { href: "/internships", label: "Internships" },
  { href: "/blog", label: "Career guides" },
];

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[min(760px,82svh)] items-center overflow-hidden bg-[#f4f8fd] text-[#102e67]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#dfe9f6]" />
      <div className="site-container relative grid w-full items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
        <div className="relative z-10 max-w-[590px]">
          <h1 className="text-[clamp(2.8rem,7vw,5.8rem)] font-black leading-[0.98] tracking-[-0.055em] text-[#102e67]">
            We’ve lost
            <span className="mt-1 block text-primary">this page.</span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-base leading-7 text-[#536b8f] sm:text-lg sm:leading-8">
            The address may be outdated, or the page may have moved. Let’s get you back to the
            opportunities and career resources you came for.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/jobs"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(23,105,232,.18)] transition hover:-translate-y-0.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              Explore jobs
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-[#31527e] transition hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>

          <nav
            aria-label="More places to explore"
            className="mt-11 max-w-lg border-t border-[#dbe6f4] pt-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7186a4]">
              Keep exploring
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {destinations.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-bold text-[#31527e] underline decoration-[#b9cbe2] underline-offset-4 transition hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="relative mx-auto w-full max-w-[500px]" aria-hidden="true">
          <div className="relative aspect-[1.12] w-full">
            <div className="absolute inset-[7%_6%_6%_7%] rounded-[46%_54%_50%_44%] bg-[#e5effc]" />
            <div className="absolute inset-[12%_11%_11%_12%] rounded-[48%_42%_46%_54%] border border-[#c9d9ee]" />

            <svg viewBox="0 0 480 420" className="absolute inset-0 h-full w-full" fill="none">
              <path
                d="M57 285C94 285 91 183 153 183s51 116 116 116 55-164 147-164"
                stroke="#8eadd5"
                strokeDasharray="2 11"
                strokeLinecap="round"
                strokeWidth="3"
              />
              <path
                d="M397 135h24m-12-12v24"
                stroke="#8eadd5"
                strokeLinecap="round"
                strokeWidth="2"
              />
              <circle cx="57" cy="285" r="19" fill="#fff" stroke="#8eadd5" strokeWidth="2" />
              <circle cx="326" cy="299" r="7" fill="#1769e8" />
              <circle cx="416" cy="135" r="4" fill="#1769e8" />
            </svg>

            <div className="absolute left-[4%] top-[61%] flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-[0_8px_18px_rgba(16,46,103,.10)]">
              <Compass className="h-5 w-5" />
            </div>
            <div className="absolute right-[20%] top-[20%] flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-[1.35rem] bg-primary text-white shadow-[0_12px_24px_rgba(23,105,232,.22)] md:right-[6%]">
              <MapPin className="h-7 w-7" strokeWidth={2.2} />
            </div>

            <div className="absolute left-[24%] top-[29%] -rotate-6 select-none text-[clamp(5.5rem,17vw,10rem)] font-black leading-none tracking-[-0.09em] text-[#102e67]">
              404
            </div>
            <div className="absolute bottom-[9%] right-[1%] flex items-center gap-2 rounded-full border border-[#cddcf0] bg-white px-4 py-2.5 text-xs font-bold text-[#486487] shadow-[0_8px_20px_rgba(16,46,103,.07)]">
              <Search className="h-3.5 w-3.5 text-primary" />
              <span>Searching for the way back</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

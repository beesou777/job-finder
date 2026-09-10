import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, FileText, Search, UsersRound } from "lucide-react";

const featureCards = [
  {
    icon: Search,
    title: "Discover relevant jobs",
    text: "Explore opportunities from trusted employers in Nepal.",
  },
  {
    icon: FileText,
    title: "Upload your CV",
    text: "Get AI-powered job matches based on your skills and experience.",
  },
  {
    icon: BarChart3,
    title: "Prepare with resources",
    text: "Access guides, tips, and tools to strengthen your applications.",
  },
  {
    icon: UsersRound,
    title: "Practice interviews",
    text: "Build confidence with realistic mock interviews.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section-white py-12 lg:py-16">
      <div className="site-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featureCards.map(({ icon: Icon, title, text }) => (
          <div key={title} className="soft-card p-6">
            <div className="icon-tile">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-extrabold text-[#112d62]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowWorksSection() {
  const steps = [
    ["01", "Upload your CV", "Create a profile or upload your CV to get started."],
    ["02", "Explore opportunities", "Browse jobs that match your interests and goals."],
    ["03", "Get AI-powered matches", "Receive personalized recommendations based on your profile."],
    ["04", "Verify and apply", "Open the original source, confirm the details, and apply there."],
    ["05", "Practice and improve", "Use our career tools to prepare and grow."],
  ];
  return (
    <section className="section-blue py-16">
      <div className="site-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">A simple path to a brighter career</p>
            <h2 className="section-title">How KamKhoj works</h2>
          </div>
          <Link href="/how-kamkhoj-works" className="arrow-link hidden sm:flex">
            See how it works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-7 md:grid-cols-5">
          {steps.map(([num, title, text]) => (
            <div key={num} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                  {num}
                </span>
                <span className="hidden h-px flex-1 border-t border-dashed border-blue-200 md:block" />
              </div>
              <h3 className="font-extrabold text-[#112d62]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScrapingInfoSection() {
  return (
    <section className="section-white py-16">
      <div className="site-container">
        <div className="cta-panel relative overflow-hidden p-7 sm:p-10">
          <div className="relative z-10 max-w-xl">
            <p className="eyebrow text-emerald-700">AI matchmaker</p>
            <h2 className="mt-3 text-4xl font-black leading-[1.03] tracking-[-.04em] text-[#112d62] sm:text-5xl">
              Upload your CV.
              <br />
              <span className="text-accent">Get better opportunities.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
              Let KamKhoj understand your skills and career goals, then surface roles that fit where
              you want to go.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/dashboard" className="primary-button">
                Upload your CV <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/jobs" className="secondary-button">
                See sample matches
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

export function EditorialStandardsSection() {
  return (
    <section className="section-white pb-16">
      <div className="site-container">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="soft-card p-7">
            <div className="icon-tile">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-black text-[#112d62]">
              Career support for your journey
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Practical guides and resources to help you at every step.
            </p>
            <Link href="/blog" className="arrow-link mt-5">
              Explore resources <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="soft-card p-7">
            <p className="eyebrow">Source-first, always</p>
            <h3 className="mt-3 text-xl font-black text-[#112d62]">Make confident decisions.</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              We help you discover and compare. Always verify the final deadline, eligibility, and
              application instructions on the original source.
            </p>
            <Link href="/how-kamkhoj-works" className="arrow-link mt-5">
              Learn how it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResourcesSection() {
  return null;
}

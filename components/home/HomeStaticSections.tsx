import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Zap,
  MapPin,
  Info,
  Shield,
  FileText,
  Building2,
  Route,
  Clock3,
  ListChecks,
  Compass,
  ExternalLink,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="bg-zinc-950 py-16 text-white md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Built for daily job search
          </p>
          <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            One practical workflow for finding relevant vacancies in Nepal.
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-400">
            KamKhoj focuses on discovery: search broadly, compare quickly, then apply through the
            original source with the details verified.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FeatureCard
            icon={<Search className="w-7 h-7" />}
            title="Search across sources"
            description="Find opportunities by title, company, location, category, job type, and deadline without opening several Nepali job portals first."
            meta="Search input, source labels, city filters"
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7" />}
            title="Prioritize fresh listings"
            description="Use latest and expiring-soon sections to focus on vacancies that are active, timely, and worth checking today."
            meta="Latest jobs, near deadlines, active leads"
          />
          <FeatureCard
            icon={<MapPin className="w-7 h-7" />}
            title="Browse by place and path"
            description="Explore Kathmandu, Pokhara, remote roles, internships, IT jobs, banking jobs, marketing roles, and more."
            meta="Location pages and category pages"
          />
          <FeatureCard
            icon={<ListChecks className="w-7 h-7" />}
            title="Verify before applying"
            description="Open the original posting to confirm salary, deadline, eligibility, documents, and application instructions before submitting."
            meta="Source-first apply flow"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Card className="h-full rounded-xl border border-white/10 bg-[#18181a] text-white transition-all hover:-translate-y-0.5 hover:border-primary/60">
      <CardContent className="p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="shrink-0 rounded-xl border border-primary/30 bg-primary/10 p-3 text-primary">
            {icon}
          </div>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
            KamKhoj
          </span>
        </div>
        <h3 className="mb-3 text-2xl font-black text-white">{title}</h3>
        <p className="text-sm leading-6 text-zinc-400">{description}</p>
        <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950/60 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-primary">
          {meta}
        </div>
      </CardContent>
    </Card>
  );
}

export function ScrapingInfoSection() {
  return (
    <section className="bg-zinc-950 py-14 text-white">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl border border-white/10 bg-[#141416] p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
                How listings are handled
              </p>
              <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">
                Source-first job discovery, not a closed job portal.
              </h2>
              <p className="mt-5 text-base leading-7 text-zinc-400">
                KamKhoj organizes public job information so candidates can search faster. The final
                application, documents, employer instructions, and latest corrections stay with the
                original source.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Shield,
                  title: "Public information only",
                  text: "Listings are based on public job information and source attribution where available.",
                },
                {
                  icon: ExternalLink,
                  title: "Apply at the source",
                  text: "Apply links send candidates to the original portal or employer page for final submission.",
                },
                {
                  icon: Clock3,
                  title: "Deadline-aware browsing",
                  text: "Deadline and expiry signals help users decide which opportunities need attention first.",
                },
                {
                  icon: Info,
                  title: "Verify final details",
                  text: "Candidates should confirm salary, documents, criteria, and instructions before applying.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-zinc-950/70 p-5"
                  >
                    <Icon className="mb-4 h-6 w-6 text-primary" />
                    <h3 className="mb-2 text-lg font-black text-white">{item.title}</h3>
                    <p className="text-sm leading-6 text-zinc-400">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResourcesSection() {
  return (
    <section className="bg-zinc-950 py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Search tools and routes
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-4">
            More ways to navigate the Nepal job market.
          </h2>
          <p className="text-lg leading-8 text-zinc-400">
            KamKhoj is more than a feed. Use focused pages, resource hubs, and source-aware tools to
            move from broad discovery to a short list of jobs worth applying to.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ResourceCard
            icon={<FileText className="w-7 h-7" />}
            title="Career guides"
            description="Read practical guides for resumes, interviews, job search planning, and Nepali career decisions."
          />
          <ResourceCard
            icon={<Route className="w-7 h-7" />}
            title="SEO landing pages"
            description="Browse focused pages for jobs in Nepal, Kathmandu, Pokhara, internships, remote work, IT, banking, and marketing."
          />
          <ResourceCard
            icon={<Building2 className="w-7 h-7" />}
            title="Hiring directory"
            description="Employers can compare Nepali hiring platforms and understand how KamKhoj credits original job sources."
          />
          <ResourceCard
            icon={<Compass className="w-7 h-7" />}
            title="Smart discovery paths"
            description="Move between latest jobs, expiring jobs, internships, remote roles, company pages, and skill pages without starting over."
          />
        </div>
      </div>
    </section>
  );
}

export function EditorialStandardsSection() {
  return (
    <section className="bg-zinc-950 py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#18181a] p-6 md:p-8">
            <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
              What makes this useful
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              KamKhoj should save time, not replace your judgment.
            </h2>
            <div className="mt-6 space-y-4 text-zinc-300 leading-7">
              <p>
                Job discovery pages work best when they help candidates compare opportunities
                quickly and then move to the original source for the final decision. KamKhoj is
                built around that workflow.
              </p>
              <p>
                The strongest pages on the site are the ones that add original help for Nepal job
                seekers: search guidance, sourcing explanations, correction routes, and practical
                career articles that are revised when they stop being useful.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/how-kamkhoj-works"
                className="rounded-full bg-primary px-5 py-3 font-black text-zinc-950 transition-colors hover:bg-white"
              >
                How KamKhoj works
              </Link>
              <Link
                href="/editorial-policy"
                className="rounded-full border border-white/10 px-5 py-3 font-black text-zinc-200 transition-colors hover:border-primary/60 hover:text-primary"
              >
                Editorial policy
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141416] p-6 md:p-8">
            <h3 className="text-2xl font-black text-white">Before you apply</h3>
            <div className="mt-6 space-y-4">
              {[
                "Open the original job source and confirm the deadline, salary text, and application instructions.",
                "Check whether the role is truly remote, hybrid, or office-based before tailoring your CV.",
                "Use category and location filters to narrow the list before you spend time on applications.",
                "Read one relevant career guide before applying if the role is new to you or you are changing sectors.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 bg-primary" />
                  <p className="text-sm leading-6 text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full rounded-xl border border-white/10 bg-[#18181a] text-white transition-all hover:-translate-y-0.5 hover:border-primary/60">
      <CardContent className="p-7">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl shrink-0 text-primary border border-primary/30">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white mb-3">{title}</h3>
            <p className="text-sm text-zinc-400 leading-6">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

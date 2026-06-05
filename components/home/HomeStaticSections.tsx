import type { ReactNode } from "react";
import {
  Building2,
  Clock3,
  Compass,
  ExternalLink,
  FileText,
  Info,
  ListChecks,
  MapPin,
  Route,
  Search,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  meta?: string;
};

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
            KamKhoj focuses on discovery: search broadly, compare quickly, then
            apply through the original source with the details verified.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfoCard
            icon={<Search className="h-7 w-7" />}
            title="Search across sources"
            description="Find opportunities by title, company, location, category, job type, and deadline without opening several Nepali job portals first."
            meta="Search input, source labels, city filters"
          />
          <InfoCard
            icon={<Zap className="h-7 w-7" />}
            title="Prioritize fresh listings"
            description="Use latest and expiring-soon sections to focus on vacancies that are active, timely, and worth checking today."
            meta="Latest jobs, near deadlines, active leads"
          />
          <InfoCard
            icon={<MapPin className="h-7 w-7" />}
            title="Browse by place and path"
            description="Explore Kathmandu, Pokhara, remote roles, internships, IT jobs, banking jobs, marketing roles, and more."
            meta="Location pages and category pages"
          />
          <InfoCard
            icon={<ListChecks className="h-7 w-7" />}
            title="Verify before applying"
            description="Open the original posting to confirm salary, deadline, eligibility, documents, and application instructions before submitting."
            meta="Source-first apply flow"
          />
        </div>
      </div>
    </section>
  );
}

export function ScrapingInfoSection() {
  const cards = [
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
  ];

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
                KamKhoj organizes public job information so candidates can search
                faster. The final application, documents, employer instructions,
                and latest corrections stay with the original source.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-zinc-950/70 p-5"
                  >
                    <Icon className="mb-4 h-6 w-6 text-primary" />
                    <h3 className="mb-2 text-lg font-black text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-zinc-400">
                      {item.text}
                    </p>
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
          <h2 className="mb-4 text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            More ways to navigate the Nepal job market.
          </h2>
          <p className="text-lg leading-8 text-zinc-400">
            KamKhoj is more than a feed. Use focused pages, resource hubs, and
            source-aware tools to move from broad discovery to a short list of
            jobs worth applying to.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfoCard
            icon={<FileText className="h-7 w-7" />}
            title="Career guides"
            description="Read practical guides for resumes, interviews, job search planning, and Nepali career decisions."
          />
          <InfoCard
            icon={<Route className="h-7 w-7" />}
            title="Focused landing pages"
            description="Browse pages for jobs in Nepal, Kathmandu, Pokhara, internships, remote work, IT, banking, and marketing."
          />
          <InfoCard
            icon={<Building2 className="h-7 w-7" />}
            title="Hiring directory"
            description="Employers can compare Nepali hiring platforms and understand how KamKhoj credits original job sources."
          />
          <InfoCard
            icon={<Compass className="h-7 w-7" />}
            title="Smart discovery paths"
            description="Move between latest jobs, expiring jobs, internships, remote roles, company pages, and skill pages without starting over."
          />
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, description, meta }: InfoCardProps) {
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
        {meta && (
          <div className="mt-6 rounded-lg border border-white/10 bg-zinc-950/60 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.14em] text-primary">
            {meta}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

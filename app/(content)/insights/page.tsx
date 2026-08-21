import Link from "next/link";
import { Metadata } from "next";
import { BarChart3, Clock3, MapPin, RefreshCw, BriefcaseBusiness, Wifi } from "lucide-react";
import { getMarketInsights } from "@/server/services/market-insights";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const report = await getMarketInsights();
  return {
    title: "Nepal Job Market Insights | KamKhoj",
    description:
      "Current job-market signals from KamKhoj listings, including active jobs, categories, locations, internships, remote work, and expiring vacancies.",
    alternates: { canonical: "/insights" },
    robots: report.sampleSize >= 10 ? undefined : { index: false, follow: true },
  };
}

const number = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export default async function InsightsPage() {
  const report = await getMarketInsights();
  const updated = new Intl.DateTimeFormat("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(report.generatedAt));
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-white/10 bg-[#111113] py-16">
        <div className="container mx-auto px-4">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            KamKhoj data desk
          </p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Nepal job market insights
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
            A transparent snapshot of the active listings currently discoverable through KamKhoj.
            Use it to plan your search, then verify every vacancy at its original source.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
            <RefreshCw className="h-4 w-4" /> Updated {updated} · refreshed every 15 minutes
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              Icon: BriefcaseBusiness,
              label: "Active jobs",
              value: report.activeJobs,
              href: "/jobs",
            },
            { Icon: BarChart3, label: "New this week", value: report.newThisWeek, href: "/jobs" },
            {
              Icon: Wifi,
              label: "Remote or hybrid",
              value: report.remoteJobs,
              href: "/remote-jobs-nepal",
            },
            {
              Icon: Clock3,
              label: "Expiring in 7 days",
              value: report.expiringSoon,
              href: "/jobs",
            },
          ].map(({ Icon, label, value, href }) => (
            <Link
              href={href}
              key={label}
              className="rounded-2xl border border-white/10 bg-[#18181a] p-6 transition hover:border-primary/60"
            >
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-5 text-sm text-zinc-400">{label}</p>
              <p className="mt-1 text-3xl font-black">{number(value)}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <InsightList
            title="Most active categories"
            items={report.categories}
            hrefForItem={(item) => `/jobs?search=${encodeURIComponent(item.name)}`}
          />
          <InsightList
            title="Listings by location"
            items={report.locations}
            hrefForItem={(item) => `/jobs?location=${encodeURIComponent(item.name)}`}
            icon={<MapPin className="h-5 w-5 text-primary" />}
          />
        </div>
        <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="text-xl font-black">How to read this report</h2>
          <p className="mt-3 max-w-4xl leading-7 text-zinc-300">{report.methodology}</p>
          <p className="mt-3 text-sm text-zinc-500">
            Current sample: {number(report.sampleSize)} active listings. This is a platform
            snapshot, not an official census of all hiring in Nepal.
          </p>
        </div>
      </section>
    </main>
  );
}

function InsightList({
  title,
  items,
  hrefForItem,
  icon = <BarChart3 className="h-5 w-5 text-primary" />,
}: {
  title: string;
  items: Array<{ name: string; count: number }>;
  hrefForItem: (item: { name: string; count: number }) => string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#18181a] p-6">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="mt-6 space-y-4">
        {items.length ? (
          items.map((item) => (
            <Link
              href={hrefForItem(item)}
              key={item.name}
              className="block rounded-lg p-2 -mx-2 transition hover:bg-zinc-900"
            >
              <div className="flex justify-between gap-4 text-sm">
                <span className="truncate text-zinc-300">{item.name}</span>
                <span className="font-mono text-primary">{number(item.count)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.max(5, (item.count / items[0].count) * 100)}%` }}
                />
              </div>
            </Link>
          ))
        ) : (
          <p className="text-zinc-500">Not enough data yet.</p>
        )}
      </div>
    </div>
  );
}

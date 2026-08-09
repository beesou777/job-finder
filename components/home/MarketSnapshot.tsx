import Link from "next/link";
import { ArrowUpRight, BarChart3, Clock3, Wifi } from "lucide-react";
import { getMarketInsights } from "@/server/services/market-insights";

export async function MarketSnapshot() {
  const report = await getMarketInsights();
  const cards = [
    ["Active jobs", report.activeJobs, "/jobs"],
    ["New this week", report.newThisWeek, "/jobs"],
    ["Remote or hybrid", report.remoteJobs, "/remote-jobs-nepal"],
    ["Expiring soon", report.expiringSoon, "/jobs"],
  ] as const;
  return <section className="bg-zinc-950 py-14 text-white"><div className="container mx-auto px-4"><div className="rounded-2xl border border-white/10 bg-[#141416] p-6 md:p-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-primary">Market snapshot</p><h2 className="text-2xl font-black md:text-3xl">What the current listings show</h2><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">A live platform snapshot to help you choose where to focus your search.</p></div><Link href="/insights" className="inline-flex items-center gap-2 font-black text-primary hover:text-white">Full insights <ArrowUpRight className="h-4 w-4" /></Link></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, href], index) => <Link key={label} href={href} className="rounded-xl border border-white/10 bg-zinc-950/70 p-4 transition hover:border-primary/60"><div className="flex items-center justify-between"><span className="text-sm text-zinc-400">{label}</span>{index === 2 ? <Wifi className="h-4 w-4 text-primary" /> : index === 3 ? <Clock3 className="h-4 w-4 text-primary" /> : <BarChart3 className="h-4 w-4 text-primary" />}</div><p className="mt-3 text-2xl font-black">{value.toLocaleString("en-IN")}</p></Link>)}</div></div></div></section>;
}
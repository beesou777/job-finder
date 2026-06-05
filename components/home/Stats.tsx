import { getStats } from "@/lib/data-fetching";

export async function Stats() {
  const stats = await getStats();

  return (
    <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="mb-1 text-xl font-black text-primary md:text-2xl">
          {stats.total.toLocaleString()}+
        </div>
        <div className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Listings
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="mb-1 text-xl font-black text-primary md:text-2xl">
          {stats.totalJobs.toLocaleString()}+
        </div>
        <div className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Jobs
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <div className="mb-1 text-xl font-black text-primary md:text-2xl">
          {stats.totalInternships.toLocaleString()}+
        </div>
        <div className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Internships
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 pt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-1 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

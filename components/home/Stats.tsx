import { getStats } from "@/lib/data-fetching";

export async function Stats() {
  const stats = await getStats();

  return (
    <div className="grid grid-cols-3 gap-4 pt-4">
      <div className="text-center">
        <div className="text-xl md:text-2xl font-bold text-[#0A66C2] mb-1">
          {stats.total.toLocaleString()}+
        </div>
        <div className="text-xs text-gray-600 font-medium">
          Total Jobs
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl md:text-2xl font-bold text-[#0A66C2] mb-1">
          {stats.totalJobs.toLocaleString()}+
        </div>
        <div className="text-xs text-gray-600 font-medium">
          Full-Time
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl md:text-2xl font-bold text-[#0A66C2] mb-1">
          {stats.totalInternships.toLocaleString()}+
        </div>
        <div className="text-xs text-gray-600 font-medium">
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

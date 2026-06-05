import { Suspense } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";
import { getJobs } from "@/lib/data-fetching";
import { Card, CardContent } from "@/components/ui/card";

interface ExpiringSectionProps {
  urgency: string;
}

async function ExpiringJobsList({ urgency }: { urgency: string }) {
  const { jobs } = await getJobs({ limit: 6, urgency });

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-600">No jobs found expiring in this period.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job as any} />
      ))}
    </div>
  );
}

function ExpiringSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-white/10 bg-[#1f1f21] h-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-white/10 rounded w-16 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse"></div>
              </div>
              <div className="h-10 bg-white/10 rounded w-full animate-pulse mt-4"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ExpiringSection({ urgency }: ExpiringSectionProps) {
  const filters = [
    { label: "Today", value: "today" },
    { label: "3 Days", value: "3days" },
    { label: "7 Days", value: "7days" },
    { label: "30 Days", value: "30days" },
  ];

  return (
    <section className="bg-zinc-950 py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-2.5 w-2.5 bg-primary" />
              <span className="font-mono text-sm font-black uppercase tracking-[0.18em] text-zinc-200">
                Expiring Soon
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-3">
              Jobs with near deadlines
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl">
              Prioritize listings that may close soon, then confirm the final
              deadline on the original job source.
            </p>
          </div>
          <Link href={`/jobs?urgency=${urgency}`}>
            <Button
              size="lg"
              className="rounded-full border border-primary bg-primary text-zinc-950 hover:bg-white font-black shadow-sm"
            >
              View All Expiring
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => (
            <Link 
              key={filter.value}
              href={`/?urgency=${filter.value}`}
              scroll={false}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                urgency === filter.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/10"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <Suspense key={urgency} fallback={<ExpiringSkeleton />}>
          <ExpiringJobsList urgency={urgency} />
        </Suspense>
      </div>
    </section>
  );
}

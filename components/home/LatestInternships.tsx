import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";
import { getJobs } from "@/server/services/data-fetching";
import { Card, CardContent } from "@/components/ui/card";

async function InternshipsList() {
  const { jobs: internships, total } = await getJobs({
    limit: 6,
    type: "internship",
  });

  if (internships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-zinc-400">No internships found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <JobCard key={internship.id} job={internship as any} />
        ))}
      </div>
      {total > 6 && (
        <div className="text-center mt-10">
          <Link href="/internships">
            <Button
              size="lg"
              className="rounded-full border border-primary bg-primary px-7 text-zinc-950 hover:bg-white font-black"
            >
              View All Internships
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}

function InternshipsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border border-white/10 bg-[#242426] h-full">
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

export function LatestInternships() {
  return (
    <section className="bg-zinc-950 py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-2.5 w-2.5 bg-primary" />
              <span className="font-mono text-sm font-black uppercase tracking-[0.18em] text-zinc-200">
                Fresh internships
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3">
              Entry-level openings with source links.
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl">
              Discover internships and early-career roles, then verify
              requirements and application steps on the original source.
            </p>
          </div>
          <Link href="/internships">
            <Button
              size="lg"
              className="rounded-full border border-primary bg-primary px-7 text-zinc-950 hover:bg-white font-black"
            >
              View All Internships
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <Suspense fallback={<InternshipsSkeleton />}>
          <InternshipsList />
        </Suspense>
      </div>
    </section>
  );
}
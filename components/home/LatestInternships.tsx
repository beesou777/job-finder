import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClientJobGrid } from "@/components/jobs/ClientJobGrid";

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
              Discover internships and early-career roles, then verify requirements and application
              steps on the original source.
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

        <ClientJobGrid options={{ limit: 6, type: "internship" }} emptyMessage="No internships found." />
      </div>
    </section>
  );
}

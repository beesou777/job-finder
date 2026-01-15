import { Suspense } from "react";
import { Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";
import { getJobs } from "@/lib/data-fetching";
import { Card, CardContent } from "@/components/ui/card";

async function InternshipsList() {
  const { jobs: internships, total } = await getJobs({ limit: 6, type: "internship" });

  if (internships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">No internships found.</p>
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
              variant="outline"
              className="border border-[#0A66C2] px-8 py-6 text-lg hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
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
        <Card key={i} className="border-2 border-gray-200 bg-white h-full">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse mt-4"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LatestInternships() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-[#0A66C2]" />
              <Badge className="bg-blue-100 text-[#0A66C2] border-blue-200 hover:bg-blue-200 hover:text-[#0A66C2]">
                Fresh Opportunities
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-3">
              Latest Internship Opportunities
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover the most recent internship postings from top companies in Nepal
            </p>
          </div>
          <Link href="/internships">
            <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold shadow-md hover:shadow-lg transition-all">
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

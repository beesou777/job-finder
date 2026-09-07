import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateLocationMetadata } from "@/lib/seo";
import Script from "next/script";
import { getJobs } from "@/server/services/data-fetching";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateBreadcrumbSchema } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const VALID_CITIES = ["kathmandu", "pokhara", "butwal", "biratnagar", "lalitpur"];

function formatCityName(city: string): string {
  return city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = params.city.toLowerCase();

  if (!VALID_CITIES.includes(city)) {
    return {
      title: "Location Not Found | kamkhoj",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  try {
    const cityName = formatCityName(city);
    const { total } = await getJobs({ location: cityName, limit: 1 });

    return {
      ...generateLocationMetadata(cityName, total || 0),
      robots: {
        index: false,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: `Jobs in ${formatCityName(city)} | kamkhoj`,
      description: `Find jobs in ${formatCityName(city)}, Nepal`,
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default async function LocationPage({ params }: { params: { city: string } }) {
  const city = params.city.toLowerCase();
  const cityName = formatCityName(city);

  if (!VALID_CITIES.includes(city)) {
    notFound();
  }

  let jobs: any[] = [];
  let total = 0;
  let categories: any[] = [];

  try {
    const result = await getJobs({ location: cityName, limit: 100 });
    jobs = result.jobs || [];
    total = result.total || jobs.length;

    // Get unique categories
    const categoryMap = new Map();
    jobs.forEach((job: any) => {
      if (job.category) {
        categoryMap.set(job.category.id, {
          id: job.category.id,
          name: job.category.name,
          count: (categoryMap.get(job.category.id)?.count || 0) + 1,
        });
      }
    });
    categories = Array.from(categoryMap.values());
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Jobs", url: absoluteUrl("/jobs") },
    {
      name: `Jobs in ${cityName}`,
      url: absoluteUrl(`/jobs/location/${city}`),
    },
  ]);

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-[#070708] text-zinc-100">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(184,244,96,0.12),transparent_32%)]">
          <div className="container mx-auto px-4 py-8 md:py-10">
            {/* Breadcrumbs */}
            <nav className="mb-6 text-sm font-bold text-zinc-500" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-zinc-600">/</li>
                <li>
                  <Link href="/jobs" className="hover:text-primary transition-colors">
                    Jobs
                  </Link>
                </li>
                <li className="text-zinc-600">/</li>
                <li className="text-zinc-200">{cityName}</li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-primary" />
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full">
                  Location
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 text-zinc-50">
                Jobs in {cityName}, Nepal
              </h1>
              <p className="text-lg text-zinc-400 mb-4">
                Browse {total.toLocaleString()} job opportunities in {cityName}
              </p>

              {/* SEO Content Section */}
              <div className="prose prose-invert max-w-none text-zinc-300 mt-6">
                {cityName === "Kathmandu" && (
                  <p className="text-base leading-relaxed">
                    Kathmandu is Nepal's capital and economic hub, offering the most diverse job
                    opportunities in the country. The city is home to major corporations, IT
                    companies, banks, international organizations, and government offices. With a
                    growing tech sector, established banking industry, and thriving tourism sector,
                    Kathmandu provides excellent career prospects across various industries. The
                    city's infrastructure, networking opportunities, and higher salary ranges make
                    it an attractive destination for job seekers.
                  </p>
                )}
                {cityName === "Pokhara" && (
                  <p className="text-base leading-relaxed">
                    Pokhara, known as Nepal's tourism capital, offers unique employment
                    opportunities primarily in hospitality, tourism, education, and healthcare. The
                    city is experiencing growth in service industries, IT services, and adventure
                    tourism businesses. With a growing number of hotels, resorts, travel agencies,
                    and educational institutions, Pokhara provides career opportunities for
                    professionals seeking work outside the Kathmandu valley in a scenic and
                    developing urban center.
                  </p>
                )}
                {cityName === "Lalitpur" && (
                  <p className="text-base leading-relaxed">
                    Lalitpur, part of the Kathmandu Valley, is a major center for IT companies,
                    NGOs, INGOs, and creative industries. Areas like Jhamsikhel, Pulchowk, and
                    Kupondole host numerous software development companies, design agencies, and
                    development organizations. Lalitpur offers a vibrant work culture, modern office
                    spaces, and strong career prospects, particularly in technology, development
                    sectors, and social entrepreneurship.
                  </p>
                )}
                {cityName === "Butwal" && (
                  <p className="text-base leading-relaxed">
                    Butwal serves as a major commercial and industrial hub in western Nepal,
                    connecting the Terai region with the hills. The city offers diverse job
                    opportunities in manufacturing, trade, banking and financial services,
                    healthcare, and education. With its strategic location and continuous
                    infrastructure development, Butwal is an emerging destination for business
                    operations and career development.
                  </p>
                )}
                {cityName === "Biratnagar" && (
                  <p className="text-base leading-relaxed">
                    Biratnagar is one of Nepal's largest industrial and business centers, located in
                    the eastern region. The city offers substantial employment in manufacturing,
                    agro-industries, trade, logistics, and healthcare. With thriving industrial
                    corridors and cross-border commerce, Biratnagar provides extensive opportunities
                    for engineering, operations, management, and technical professionals.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="border-white/10 bg-[#1b1b1d]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-2xl font-black text-zinc-50">
                        {total.toLocaleString()}
                      </div>
                      <div className="text-sm text-zinc-500">Total Jobs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-[#1b1b1d]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-2xl font-black text-zinc-50">{categories.length}</div>
                      <div className="text-sm text-zinc-500">Job Categories</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-4 text-zinc-50">Jobs by Category</h2>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/jobs?location=${encodeURIComponent(cityName)}&category=${category.id}`}
                    >
                      <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm cursor-pointer text-zinc-200 hover:border-primary/60 hover:text-primary transition-colors">
                        {category.name} ({category.count})
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* View All Jobs Button */}
            <Link href={`/jobs?location=${encodeURIComponent(cityName)}`}>
              <Button className="rounded-full bg-primary text-zinc-950 hover:bg-white font-black">
                View All {cityName} Jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Jobs List */}
        <div className="container mx-auto px-4 py-6">
          {jobs.length === 0 ? (
            <Card className="border-white/10 bg-[#1b1b1d]">
              <CardContent className="pt-16 pb-16 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-2xl font-black mb-2 text-zinc-50">
                  No Jobs Found in {cityName}
                </h3>
                <p className="text-zinc-400 mb-6">
                  We're constantly updating our job listings. Check back soon or browse other
                  locations.
                </p>
                <Link href="/jobs">
                  <Button variant="outline">Browse All Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {jobs.slice(0, 12).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {jobs.length > 12 && (
                <div className="text-center">
                  <Link href={`/jobs?location=${encodeURIComponent(cityName)}`}>
                    <Button variant="outline" size="lg">
                      View All {total} Jobs in {cityName}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

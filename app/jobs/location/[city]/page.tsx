import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateLocationMetadata } from "@/lib/seo";
import Script from "next/script";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateBreadcrumbSchema } from "@/lib/seo";

const VALID_CITIES = [
  "kathmandu",
  "pokhara",
  "butwal",
  "biratnagar",
  "lalitpur",
];

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
      title: "Location Not Found | JobKhoj",
    };
  }

  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const cityName = formatCityName(city);
    
    // Count jobs in this city
    const total = await jobRepository.count({
      where: {
        location: cityName,
        expiresAt: null as any,
      },
    });

    // Filter expired jobs
    const now = new Date();
    const allJobs = await jobRepository.find({
      where: { location: cityName },
      take: 1000,
    });
    const validJobs = allJobs.filter(
      (job) => !job.expiresAt || job.expiresAt > now
    );
    const validTotal = validJobs.length;

    return generateLocationMetadata(cityName, validTotal);
  } catch (error) {
    return {
      title: `Jobs in ${formatCityName(city)} | JobKhoj`,
      description: `Find jobs in ${formatCityName(city)}, Nepal`,
    };
  }
}

export default async function LocationPage({
  params,
}: {
  params: { city: string };
}) {
  const city = params.city.toLowerCase();
  const cityName = formatCityName(city);

  if (!VALID_CITIES.includes(city)) {
    notFound();
  }

  let jobs: Job[] = [];
  let total = 0;
  let categories: any[] = [];

  try {
    const dataSource = await getDataSource();
    const jobRepository = dataSource.getRepository(Job);
    const now = new Date();

    // Get jobs in this city
    const allJobs = await jobRepository.find({
      where: { location: cityName },
      relations: ["category"],
      take: 100,
      order: { createdAt: "DESC" },
    });

    // Filter expired jobs
    jobs = allJobs.filter((job) => !job.expiresAt || job.expiresAt > now);
    total = jobs.length;

    // Get unique categories
    const categoryMap = new Map();
    jobs.forEach((job) => {
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
    { name: "Home", url: "https://kamkhoj.eventeir.ai" },
    { name: "Jobs", url: "https://kamkhoj.eventeir.ai/jobs" },
    { name: `Jobs in ${cityName}`, url: `https://kamkhoj.eventeir.ai/jobs/location/${city}` },
  ]);

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8 md:py-10">
            {/* Breadcrumbs */}
            <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link href="/jobs" className="hover:text-blue-600 transition-colors">
                    Jobs
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900">{cityName}</li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  Location
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
                Jobs in {cityName}, Nepal
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Browse {total.toLocaleString()} job opportunities in {cityName}
              </p>
              
              {/* SEO Content Section */}
              <div className="prose max-w-none text-gray-700 mt-6">
                {cityName === "Kathmandu" && (
                  <p className="text-base leading-relaxed">
                    Kathmandu is Nepal's capital and economic hub, offering the most diverse job opportunities in the country. 
                    The city is home to major corporations, IT companies, banks, international organizations, and government offices. 
                    With a growing tech sector, established banking industry, and thriving tourism sector, Kathmandu provides excellent career 
                    prospects across various industries. The city's infrastructure, networking opportunities, and higher salary ranges make it 
                    an attractive destination for job seekers.
                  </p>
                )}
                {cityName === "Pokhara" && (
                  <p className="text-base leading-relaxed">
                    Pokhara is Nepal's second-largest city and a major tourist destination, offering unique job opportunities in tourism, 
                    hospitality, and related services. The city's scenic beauty and growing infrastructure have attracted investment in 
                    hotels, restaurants, adventure sports companies, and service industries. Pokhara also has a growing IT sector and 
                    educational institutions, providing diverse employment options. The city offers a better work-life balance compared 
                    to Kathmandu while still providing good career opportunities.
                  </p>
                )}
                {cityName === "Butwal" && (
                  <p className="text-base leading-relaxed">
                    Butwal is a rapidly growing city in western Nepal, strategically located on the East-West Highway. The city has 
                    emerged as an important commercial and industrial hub, offering opportunities in manufacturing, trading, transportation, 
                    and services. With its proximity to India and growing infrastructure, Butwal provides good employment prospects in 
                    logistics, retail, and small to medium enterprises. The city's lower cost of living and growing economy make it an 
                    attractive option for job seekers.
                  </p>
                )}
                {cityName === "Biratnagar" && (
                  <p className="text-base leading-relaxed">
                    Biratnagar is Nepal's industrial capital and the largest city in the eastern region. The city is home to numerous 
                    manufacturing industries, including jute mills, sugar factories, and other processing plants. Biratnagar offers 
                    opportunities in industrial management, engineering, trade, and commerce. The city's strategic location near the 
                    Indian border makes it a hub for cross-border trade, creating jobs in logistics, customs, and trading. With growing 
                    infrastructure and industrial development, Biratnagar provides stable employment opportunities.
                  </p>
                )}
                {cityName === "Lalitpur" && (
                  <p className="text-base leading-relaxed">
                    Lalitpur (Patan) is part of the Kathmandu Valley and has emerged as a major tech and startup hub. The city is home 
                    to many IT companies, software development firms, and innovative startups. Lalitpur offers excellent opportunities in 
                    technology, design, and creative industries. The city's proximity to Kathmandu while maintaining its own identity makes 
                    it attractive for professionals seeking tech jobs, remote work opportunities, and startup culture. With good infrastructure 
                    and growing business ecosystem, Lalitpur provides modern career opportunities.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Jobs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {categories.length}
                      </div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {cityName}
                      </div>
                      <div className="text-sm text-gray-600">Location</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Popular Categories in {cityName}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {categories
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((category) => (
                      <Link
                        key={category.id}
                        href={`/jobs?category=${category.id}&location=${cityName}`}
                      >
                        <Badge className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">
                          {category.name} ({category.count})
                        </Badge>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* View All Jobs Button */}
            <Link href={`/jobs?location=${cityName}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                View All Jobs in {cityName}
              </Button>
            </Link>
          </div>
        </div>

        {/* Jobs List */}
        <div className="container mx-auto px-4 py-6">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="pt-16 pb-16 text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold mb-2 text-gray-900">
                  No Jobs Found in {cityName}
                </h3>
                <p className="text-gray-600 mb-6">
                  We're constantly updating our job listings. Check back soon or
                  browse jobs in other locations.
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
                  <JobCard key={job.id} job={job as any} />
                ))}
              </div>
              {jobs.length > 12 && (
                <div className="text-center">
                  <Link href={`/jobs?location=${cityName}`}>
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


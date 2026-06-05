"use client";

import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Briefcase,
  TrendingUp,
  Users,
  MapPin,
  Zap,
  ArrowRight,
  Sparkles,
  Star,
  Clock,
  FileText,
  Shield,
  Info,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FAQ } from "@/components/FAQ";
import { Input } from "@/components/ui/input";

export default function HomeContent() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [expiringJobs, setExpiringJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalInternships: 0,
    total: 0,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState<"job" | "internship">("job");
  const [expiringFilter, setExpiringFilter] = useState<
    "today" | "3days" | "7days" | "30days"
  >("7days");

  useEffect(() => {
    fetchData();
  }, [expiringFilter]);

  const handleSearch = () => {
    const basePath = jobType === "job" ? "/jobs" : "/internships";
    const searchParam = searchQuery.trim()
      ? `?search=${encodeURIComponent(searchQuery.trim())}`
      : "";
    router.push(`${basePath}${searchParam}`);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      console.log("[Client] Fetching data from API...");
      console.log("[Client] Expiring filter:", expiringFilter);

      // Optimized: Fetch all data in parallel with optimized endpoints
      let jobsRes: Response,
        internshipsRes: Response,
        expiringRes: Response,
        categoriesRes: Response,
        statsRes: Response;

      try {
        [jobsRes, internshipsRes, expiringRes, categoriesRes, statsRes] =
          await Promise.all([
            fetch("/api/jobs?limit=6&type=job"),
            fetch("/api/jobs?limit=6&type=internship"),
            fetch(`/api/jobs?limit=6&urgency=${expiringFilter}`),
            fetch("/api/categories?popular=true&limit=12"),
            fetch("/api/stats"),
          ]);
      } catch (err: any) {
        console.error("[Client] Network error fetching data:", err);
        setLoading(false);
        return;
      }

      // Process jobs
      if (jobsRes.ok) {
        const jobsData: any = await jobsRes.json();
        console.log(`[Client] Jobs API response:`, jobsData);
        setJobs(jobsData.data || []);
        setTotal(jobsData.total || 0);
        console.log(`[Client] Loaded ${jobsData.data?.length || 0} jobs`);
      } else {
        const errorText = await jobsRes.text();
        console.error(
          `[Client] Failed to fetch jobs: ${jobsRes.status}`,
          errorText,
        );
      }

      // Process internships
      if (internshipsRes.ok) {
        const internshipsData: any = await internshipsRes.json();
        console.log(`[Client] Internships API response:`, internshipsData);
        setInternships(internshipsData.data || []);
        console.log(
          `[Client] Loaded ${internshipsData.data?.length || 0} internships`,
        );
      } else {
        const errorText = await internshipsRes.text();
        console.error(
          `[Client] Failed to fetch internships: ${internshipsRes.status}`,
          errorText,
        );
      }

      // Process expiring jobs - sort by expiration date (soonest first)
      if (expiringRes.ok) {
        const expiringData: any = await expiringRes.json();
        const sortedExpiring = (expiringData.data || []).sort(
          (a: any, b: any) => {
            const dateA = a.expiresAt
              ? new Date(a.expiresAt).getTime()
              : Infinity;
            const dateB = b.expiresAt
              ? new Date(b.expiresAt).getTime()
              : Infinity;
            return dateA - dateB; // Soonest first
          },
        );
        setExpiringJobs(sortedExpiring);
        console.log(`[Client] Loaded ${sortedExpiring.length} expiring jobs`);
      } else {
        console.error(
          `[Client] Failed to fetch expiring jobs: ${expiringRes.status}`,
        );
      }

      // Process stats - use optimized stats endpoint
      if (statsRes.ok) {
        const statsData: any = await statsRes.json();
        console.log(`[Client] Stats API response:`, statsData);
        setStats({
          totalJobs: statsData.data?.totalJobs || 0,
          totalInternships: statsData.data?.totalInternships || 0,
          total: statsData.data?.total || 0,
        });
        console.log(
          `[Client] Stats: ${statsData.data?.totalJobs || 0} jobs, ${
            statsData.data?.totalInternships || 0
          } internships`,
        );
      } else {
        const errorText = await statsRes.text();
        console.error(
          `[Client] Failed to fetch stats: ${statsRes.status}`,
          errorText,
        );
        // Fallback to 0 if stats fail
        setStats({ totalJobs: 0, totalInternships: 0, total: 0 });
      }

      // Process categories
      if (categoriesRes.ok) {
        const categoriesData: any = await categoriesRes.json();
        setCategories(categoriesData.data || []);
        console.log(
          `[Client] Loaded ${categoriesData.data?.length || 0} categories`,
        );
      } else {
        console.error(
          `[Client] Failed to fetch categories: ${categoriesRes.status}`,
        );
      }
    } catch (error: any) {
      console.error("[Client] Error fetching data:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  // Structured Data for SEO
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://www.kamkhoj.com/";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "kamkhoj",
    description:
      "Nepal's #1 Job Finder - Find jobs and internships across Nepal",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // CollectionPage schema for aggregator (SEO only)
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Best Job Aggregator Sites in Nepal - kamkhoj",
    description: `Job aggregator sites in Nepal - Browse ${total}+ job listings aggregated from top Nepali job portals`,
    url: baseUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      description: "Job listings aggregated from multiple Nepali job portals",
    },
  };

  const jobPostingStructuredData = jobs.slice(0, 10).map((job: any) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.title,
    identifier: {
      "@type": "PropertyValue",
      name: "kamkhoj",
      value: job.id,
    },
    datePosted: job.createdAt,
    validThrough:
      job.expiresAt ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.type === "internship" ? "INTERN" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company || "Company",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Nepal",
        addressCountry: "NP",
      },
    },
    baseSalary: job.salaryText
      ? {
          "@type": "MonetaryAmount",
          currency: "NPR",
          value: {
            "@type": "QuantitativeValue",
            value: job.salaryText,
          },
        }
      : undefined,
    url: job.applyUrl,
  }));

  // Skeleton components
  const SkeletonCard = () => (
    <Card className="bg-white border shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonJobCard = () => (
    <Card className="border-2 border-gray-200 bg-white h-full">
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
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse mt-4"></div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      {jobPostingStructuredData.map((data: any, index: number) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      {/* Hero Section - Professional with Two Column Layout */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Search Section */}
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900  leading-snug mb-4">
                    Find Jobs in Nepal
                    <span className="block text-[#0A66C2] mt-2">
                      Latest Opportunities {new Date().getFullYear()}
                    </span>
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 mb-2 leading-relaxed">
                    Discover 1000+ job opportunities from top Nepali job portals
                  </p>
                  <p className="text-sm text-gray-500">
                    Search across MeroJob, Kantipur Job, JobsNepal, KumariJob,
                    and more - all in one place
                  </p>
                </div>

                {/* Search Bar with Select Toggle - Reference Style */}
                <div className="bg-white rounded-full shadow-lg p-2 mb-6 flex items-center gap-2">
                  {/* Job Type Select Toggle - Left */}
                  <div className="relative">
                    <select
                      value={jobType}
                      onChange={(e) =>
                        setJobType(e.target.value as "job" | "internship")
                      }
                      className="appearance-none bg-[#0A66C2]/10 border border-white rounded-full px-4 py-3 pr-8 h-12 text-sm font-medium text-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] cursor-pointer min-w-[140px]"
                    >
                      <option value="job">All Jobs</option>
                      <option value="internship">All Internships</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#0A66C2] w-4 h-4 pointer-events-none" />
                  </div>

                  {/* Search Input - Center */}
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter the title, keywords or phrase"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      className="h-12 text-sm border-0 focus-visible:ring-0 shadow-none pl-4"
                    />
                  </div>

                  {/* Search Button - Right */}
                  <Button
                    onClick={handleSearch}
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Stats */}
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
              </div>

              {/* Right Side - Image */}
              <div className="hidden lg:block">
                <div className="relative">
                  <img
                    src="/man-search-hiring-job-online-from-laptop.avif"
                    alt="Person searching for jobs online"
                    className="w-full h-auto rounded-lg mix-blend-darken"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expiring Soon Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-[#0A66C2]" />
                <Badge className="bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20 hover:bg-[#0A66C2]/20">
                  Expiring Soon
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900  leading-snug mb-3">
                Jobs Expiring Soon
              </h2>
              <p className="text-base text-muted-foreground">
                Don't miss out! These opportunities are closing soon
              </p>
            </div>
            <Link href={`/jobs?urgency=${expiringFilter}`}>
              <Button
                size="lg"
                className="hidden md:flex bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                View All Expiring
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Day-based Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setExpiringFilter("today")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                expiringFilter === "today"
                  ? "bg-[#0A66C2] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setExpiringFilter("3days")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                expiringFilter === "3days"
                  ? "bg-[#0A66C2] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              3 Days
            </button>
            <button
              onClick={() => setExpiringFilter("7days")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                expiringFilter === "7days"
                  ? "bg-[#0A66C2] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setExpiringFilter("30days")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                expiringFilter === "30days"
                  ? "bg-[#0A66C2] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              30 Days
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
            </div>
          ) : expiringJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No jobs</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expiringJobs.slice(0, 6).map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900  leading-snug mb-4">
            Nepal's most comprehensive job search platform - aggregating
            opportunities from all major portals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Comprehensive Search
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Search across multiple job portals from one place. Filter by
                    category, location, job type, and more to find exactly what
                    you're looking for.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                  <Zap className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Updated Daily
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our automated system scrapes the latest job postings daily
                    from top Nepali job portals, ensuring you never miss an
                    opportunity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                  <MapPin className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Nepal-Wide Coverage
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Find opportunities in Kathmandu, Pokhara, Lalitpur, and
                    cities throughout Nepal. Remote and on-site positions
                    available.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6 text-primary" />
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  Fresh Opportunities
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900  leading-snug mb-3">
                Latest Job Opportunities
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover the most recent job postings from top companies in
                Nepal
              </p>
            </div>
            <Link href="/jobs">
              <Button
                size="lg"
                className="hidden md:flex bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                View All Jobs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No jobs</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.slice(0, 6).map((job: any) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {jobs.length > 6 && (
                <div className="text-center mt-10">
                  <Link href="/jobs">
                    <Button
                      size="lg"
                      className="rounded-full border border-primary bg-primary px-7 text-zinc-950 hover:bg-white font-black"
                    >
                      View All {total} Jobs
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Latest Internships Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 hover:text-blue-700">
                  Fresh Opportunities
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900  leading-snug mb-3">
                Latest Internship Opportunities
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover the most recent internship postings from top companies
                in Nepal
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
            </div>
          ) : internships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No jobs</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internships.slice(0, 6).map((internship: any) => (
                  <JobCard key={internship.id} job={internship} />
                ))}
              </div>
              {internships.length > 6 && (
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
          )}
        </div>
      </section>

      {/* About Our Scraping Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-blue-50/50">
          <CardContent className="pt-8 pb-8 px-6 md:px-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  About Our Service
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  kamkhoj is a job aggregator that collects job listings from
                  various Nepali job portals to provide you with a comprehensive
                  search experience. We use automated systems to gather publicly
                  available job postings, ensuring you have access to the latest
                  opportunities all in one place.
                </p>
                <div className="flex items-start gap-3 mt-4 p-4 bg-white/80 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Ethical & Transparent
                    </p>
                    <p className="text-sm text-gray-600">
                      We only collect publicly available information. We don't
                      break any terms of service, and we respect the original
                      job sources. All job applications are handled directly
                      through the original job portals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Helpful Resources Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900  leading-snug mb-4">
              Resources to Help You Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to land your dream job in Nepal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Resume Tips
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Learn how to create a standout resume that gets noticed by
                      employers. Get tips on formatting, keywords, and
                      highlighting your achievements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Interview Prep
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Prepare for success with common interview questions, body
                      language tips, and strategies to make a great first
                      impression.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                    <TrendingUp className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Career Growth
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Discover career paths, salary insights, and growth
                      opportunities in Nepal's job market. Plan your
                      professional journey.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                    <Clock className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Daily Updates
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      New job opportunities are added daily from top Nepali job
                      portals. Check back regularly to never miss an
                      opportunity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                    <MapPin className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Location Based
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Find jobs in Kathmandu, Pokhara, Lalitpur, and cities
                      across Nepal. Filter by location to find opportunities
                      near you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-gray-100 rounded-lg shrink-0">
                    <Sparkles className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Free Service
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      kamkhoj is completely free to use. No sign-up required.
                      Browse jobs, apply directly, and start your career journey
                      today.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}

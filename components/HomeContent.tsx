"use client";

import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, TrendingUp, Users, MapPin, Zap, ArrowRight, Sparkles, Star, Clock, FileText, Shield, Info } from "lucide-react";
import Link from "next/link";

export default function HomeContent() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ totalJobs: 0, totalInternships: 0, total: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log("[Client] Fetching data from API...");
      
      // Optimized: Fetch all data in parallel with optimized endpoints
      const [jobsRes, internshipsRes, categoriesRes, statsRes] = await Promise.all([
        fetch("/api/jobs?limit=6&type=job"),
        fetch("/api/jobs?limit=6&type=internship"),
        fetch("/api/categories?popular=true&limit=12"),
        fetch("/api/stats"),
      ]);

      // Process jobs
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.data || []);
        setTotal(jobsData.total || 0);
        console.log(`[Client] Loaded ${jobsData.data?.length || 0} jobs`);
      } else {
        console.error(`[Client] Failed to fetch jobs: ${jobsRes.status}`);
      }

      // Process internships
      if (internshipsRes.ok) {
        const internshipsData = await internshipsRes.json();
        setInternships(internshipsData.data || []);
        console.log(`[Client] Loaded ${internshipsData.data?.length || 0} internships`);
      } else {
        console.error(`[Client] Failed to fetch internships: ${internshipsRes.status}`);
      }

      // Process stats - use optimized stats endpoint
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalJobs: statsData.data?.totalJobs || 0,
          totalInternships: statsData.data?.totalInternships || 0,
          total: statsData.data?.total || 0,
        });
        console.log(`[Client] Stats: ${statsData.data?.totalJobs || 0} jobs, ${statsData.data?.totalInternships || 0} internships`);
      } else {
        console.error(`[Client] Failed to fetch stats: ${statsRes.status}`);
        // Fallback to 0 if stats fail
        setStats({ totalJobs: 0, totalInternships: 0, total: 0 });
      }

      // Process categories
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data || []);
        console.log(`[Client] Loaded ${categoriesData.data?.length || 0} categories`);
      } else {
        console.error(`[Client] Failed to fetch categories: ${categoriesRes.status}`);
      }
    } catch (error: any) {
      console.error("[Client] Error fetching data:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "JobKhoj",
    "description": "Nepal's #1 Job Finder - Find jobs and internships across Nepal",
    "url": typeof window !== "undefined" ? window.location.origin : "https://job-khoj.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${typeof window !== "undefined" ? window.location.origin : "https://job-khoj.vercel.app"}/jobs?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const jobPostingStructuredData = jobs.slice(0, 10).map((job: any) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || job.title,
    "identifier": {
      "@type": "PropertyValue",
      "name": "JobKhoj",
      "value": job.id
    },
    "datePosted": job.createdAt,
    "validThrough": job.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": job.type === "internship" ? "INTERN" : "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company || "Company"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location || "Nepal",
        "addressCountry": "NP"
      }
    },
    "baseSalary": job.salaryText ? {
      "@type": "MonetaryAmount",
      "currency": "NPR",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salaryText
      }
    } : undefined,
    "url": job.applyUrl
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
      {jobPostingStructuredData.map((data: any, index: number) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      {/* Hero Section - Minimal */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Find Jobs in Nepal
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Browse {stats.total} job opportunities from top Nepali job portals
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/jobs">
                <Button size="lg" className="px-6">
                  <Briefcase className="mr-2 w-4 h-4" />
                  Jobs ({stats.totalJobs})
                </Button>
              </Link>
              <Link href="/internships">
                <Button size="lg" variant="outline" className="px-6">
                  <Users className="mr-2 w-4 h-4" />
                  Internships ({stats.totalInternships})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <Card className="bg-white border shadow-md hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-medium">Total Opportunities</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border shadow-md hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-medium">Active Jobs</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalJobs}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border shadow-md hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1 font-medium">Internships</p>
                      <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.totalInternships}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-1 bg-primary/10 text-primary border-primary/20">
            Why Choose JobKhoj
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Land Your Dream Job</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nepal's most comprehensive job search platform - aggregating opportunities from all major portals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-400 hover:-translate-y-2 bg-white">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Comprehensive Search</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Search across multiple job portals from one place. Filter by category, 
                location, job type, and more to find exactly what you're looking for.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-400 hover:-translate-y-2 bg-white">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Updated Daily</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Our automated system scrapes the latest job postings daily from top 
                Nepali job portals, ensuring you never miss an opportunity.
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-indigo-400 hover:-translate-y-2 bg-white">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Nepal-Wide Coverage</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Find opportunities in Kathmandu, Pokhara, Lalitpur, and cities 
                throughout Nepal. Remote and on-site positions available.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-6 h-6 text-primary" />
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                  Fresh Opportunities
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">
                Latest Job Opportunities
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover the most recent job postings from top companies in Nepal
              </p>
            </div>
            <Link href="/jobs">
              <Button size="lg" className="hidden md:flex gradient-primary text-white shadow-lg hover:shadow-xl transition-all">
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
          <Card className="border-2 border-dashed">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Jobs Available Yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We're currently fetching the latest job opportunities from top Nepali job portals. 
                Please check back soon for new opportunities.
              </p>
            </CardContent>
          </Card>
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
                    <Button size="lg" variant="outline" className="border-2 px-8 py-6 text-lg hover:bg-primary hover:text-white transition-colors">
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
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-700 hover:border-purple-200">
                  Fresh Opportunities
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3">
                Latest Internship Opportunities
              </h2>
              <p className="text-xl text-muted-foreground">
                Discover the most recent internship postings from top companies in Nepal
              </p>
            </div>
            <Link href="/internships">
              <Button size="lg" className="hidden md:flex bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all">
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
          <Card className="border-2 border-dashed">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Internships Available Yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We're currently fetching the latest internship opportunities from top Nepali job portals. 
                Please check back soon for new opportunities.
              </p>
            </CardContent>
          </Card>
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
                    <Button size="lg" variant="outline" className="border-2 px-8 py-6 text-lg hover:bg-purple-600 hover:text-white transition-colors border-purple-600">
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
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="pt-8 pb-8 px-6 md:px-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">About Our Service</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  JobKhoj is a job aggregator that collects job listings from various Nepali job portals to provide you with a comprehensive search experience. We use automated systems to gather publicly available job postings, ensuring you have access to the latest opportunities all in one place.
                </p>
                <div className="flex items-start gap-3 mt-4 p-4 bg-white/80 rounded-lg border border-blue-100">
                  <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Ethical & Transparent</p>
                    <p className="text-sm text-gray-600">
                      We only collect publicly available information. We don't break any terms of service, and we respect the original job sources. All job applications are handled directly through the original job portals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Helpful Resources Section */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Resources to Help You <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to land your dream job in Nepal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-400 hover:-translate-y-2 bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Resume Tips</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Learn how to create a standout resume that gets noticed by employers. 
                  Get tips on formatting, keywords, and highlighting your achievements.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-purple-400 hover:-translate-y-2 bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Interview Prep</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Prepare for success with common interview questions, body language tips, 
                  and strategies to make a great first impression.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-indigo-400 hover:-translate-y-2 bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Career Growth</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Discover career paths, salary insights, and growth opportunities 
                  in Nepal's job market. Plan your professional journey.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-green-400 hover:-translate-y-2 bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Daily Updates</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  New job opportunities are added daily from top Nepali job portals. 
                  Check back regularly to never miss an opportunity.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-400 hover:-translate-y-2 bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Location Based</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Find jobs in Kathmandu, Pokhara, Lalitpur, and cities across Nepal. 
                  Filter by location to find opportunities near you.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-pink-400 hover:-translate-y-2 bg-white">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Free Service</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  JobKhoj is completely free to use. No sign-up required. 
                  Browse jobs, apply directly, and start your career journey today.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

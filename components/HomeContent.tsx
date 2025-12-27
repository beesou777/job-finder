"use client";

import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, TrendingUp, Users, MapPin, Zap, ArrowRight, Sparkles, Star, Clock, FileText } from "lucide-react";
import Link from "next/link";

export default function HomeContent() {
  const [jobs, setJobs] = useState<any[]>([]);
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
      
      // Fetch all data in parallel
      const [jobsRes, categoriesRes, jobsCountRes, internshipsCountRes] = await Promise.all([
        fetch("/api/jobs?limit=50"),
        fetch("/api/categories?popular=true&limit=12"),
        fetch("/api/jobs?type=job&limit=1"),
        fetch("/api/jobs?type=internship&limit=1"),
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

      // Process stats - fetch from jobs API for accurate counts
      const jobsCount = jobsCountRes.ok ? (await jobsCountRes.json()).total : 0;
      const internshipsCount = internshipsCountRes.ok ? (await internshipsCountRes.json()).total : 0;
      
      setStats({
        totalJobs: jobsCount,
        totalInternships: internshipsCount,
        total: jobsCount + internshipsCount,
      });
      console.log(`[Client] Stats: ${jobsCount} jobs, ${internshipsCount} internships`);

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
    "url": typeof window !== "undefined" ? window.location.origin : "https://jobkhoj.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${typeof window !== "undefined" ? window.location.origin : "https://jobkhoj.com"}/jobs?search={search_term_string}`
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 mr-3" />
              <h1 className="text-5xl md:text-6xl font-bold">JobKhoj</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Nepal's #1 Job Finder - Your Career Journey Starts Here
            </p>
            <p className="text-lg mb-8 text-blue-200">
              Find the latest jobs and internships from top Nepali job portals. 
              Search across MeroCareer, JobsNepal, KumariJob, InternSathi, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
                  <Search className="mr-2 w-5 h-5" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/internships">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  <Star className="mr-2 w-5 h-5" />
                  Find Internships
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Briefcase className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <p className="text-3xl font-bold">{stats.totalJobs.toLocaleString()}</p>
                    <p className="text-muted-foreground">Active Jobs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <p className="text-3xl font-bold">{stats.totalInternships.toLocaleString()}</p>
                    <p className="text-muted-foreground">Internships</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
                    <p className="text-muted-foreground">Total Opportunities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-center">Popular Categories</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category: any) => (
                <Link key={category.id} href={`/jobs?category=${category.id}`}>
                  <Badge variant="secondary" className="px-4 py-2 text-base cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {category.name}
                    {category.jobCount > 0 && (
                      <span className="ml-2 text-xs opacity-70">({category.jobCount})</span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Jobs Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Latest Job Opportunities</h2>
            <Link href="/jobs">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
        {jobs.length === 0 ? (
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

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose JobKhoj?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Fast & Easy</h3>
                <p className="text-muted-foreground">
                  Search across multiple job portals in one place. Save time and find your dream job faster.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Comprehensive</h3>
                <p className="text-muted-foreground">
                  Aggregated listings from top Nepali job portals including MeroCareer, JobsNepal, and more.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Location-Based</h3>
                <p className="text-muted-foreground">
                  Find jobs in Kathmandu, Pokhara, and cities across Nepal. Filter by location easily.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Career Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Browse thousands of job opportunities and find your perfect match today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
                <Briefcase className="mr-2 w-5 h-5" />
                Explore Jobs
              </Button>
            </Link>
            <Link href="/internships">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                <Star className="mr-2 w-5 h-5" />
                Find Internships
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


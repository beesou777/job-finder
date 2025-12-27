import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, TrendingUp, Users, MapPin, Zap, ArrowRight, Sparkles, Star, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobKhoj - Find Jobs in Nepal | Latest Job Opportunities & Internships",
  description: "Nepal's #1 job aggregator. Find the latest jobs and internships in Nepal. Search across top Nepali job portals - MeroCareer, JobsNepal, KumariJob, InternSathi, JobAxle. Your career journey starts here.",
  keywords: [
    "jobs in nepal",
    "nepal jobs",
    "jobs kathmandu",
    "internships nepal",
    "job portal nepal",
    "nepal job search",
    "career nepal",
    "nepal employment",
    "job opportunities nepal",
    "merocareer",
    "jobsnepal",
    "kumarijob",
    "internsathi",
    "jobaxle",
    "nepal job aggregator"
  ],
  openGraph: {
    title: "JobKhoj - Find Jobs in Nepal | Latest Job Opportunities & Internships",
    description: "Nepal's #1 job aggregator. Find the latest jobs and internships across Nepal.",
  },
};

async function getJobs() {
  try {
    // Use absolute URL in production, relative in development
    const apiUrl = process.env.NEXT_PUBLIC_API || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/jobs?limit=50`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
      return { data: [], total: 0 };
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { data: [], total: 0 };
  }
}

async function getStats() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const [jobsRes, internshipsRes] = await Promise.all([
      fetch(`${apiUrl}/api/jobs?type=job`, { cache: "no-store" }),
      fetch(`${apiUrl}/api/jobs?type=internship`, { cache: "no-store" }),
    ]);
    
    const jobs = jobsRes.ok ? await jobsRes.json() : { total: 0 };
    const internships = internshipsRes.ok ? await internshipsRes.json() : { total: 0 };
    
    return {
      totalJobs: jobs.total || 0,
      totalInternships: internships.total || 0,
      total: (jobs.total || 0) + (internships.total || 0),
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { totalJobs: 0, totalInternships: 0, total: 0 };
  }
}

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/api/categories?popular=true&limit=12`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch categories: ${res.status} ${res.statusText}`);
      return { data: [] };
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { data: [] };
  }
}

export default async function Home() {
  const { data: jobs, total } = await getJobs();
  const stats = await getStats();
  const { data: categories } = await getCategories();

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "JobKhoj",
    "description": "Nepal's #1 Job Finder - Find jobs and internships across Nepal",
    "url": process.env.NEXT_PUBLIC_API || "https://jobkhoj.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_API || "https://jobkhoj.com"}/jobs?search={search_term_string}`
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
                <Badge className="bg-primary/10 text-primary border-primary/20">
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

      {/* Popular Categories */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Explore by <span className="text-gradient">Category</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Find opportunities in your field of interest
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category: any) => (
              <Link key={category.id} href={`/jobs?category=${category.id}`}>
                <Badge 
                  variant="secondary" 
                  className="text-base px-6 py-3 cursor-pointer hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-primary text-gray-900 font-semibold"
                >
                  {category.name}
                  {category.jobCount > 0 && (
                    <span className="ml-2 text-xs opacity-75">
                      ({category.jobCount})
                    </span>
                  )}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

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

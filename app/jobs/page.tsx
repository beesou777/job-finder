"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2 } from "lucide-react";

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("search"), searchParams.get("category"), searchParams.get("type")]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const search = searchParams.get("search") || "";
      const category = searchParams.get("category") || "";
      const type = searchParams.get("type") || "job";

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (type) params.append("type", type);

      const [jobsRes, categoriesRes] = await Promise.all([
        fetch(`/api/jobs?${params.toString()}`),
        fetch(`/api/categories`),
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.success ? jobsData.data : []);
        setTotal(jobsData.total || 0);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.success ? categoriesData.data : []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue) params.append("search", searchValue);
    const category = searchParams.get("category");
    const type = searchParams.get("type") || "job";
    if (category) params.append("category", category);
    if (type) params.append("type", type);
    window.location.href = `/jobs?${params.toString()}`;
  };

  const selectedCategory = searchParams.get("category");
  const selectedType = searchParams.get("type") || "job";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Header - Minimal */}
      <div className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            {selectedCategory && categories.find((c: any) => c.id === selectedCategory)
              ? `${categories.find((c: any) => c.id === selectedCategory)?.name} Jobs`
              : "Jobs in Nepal"}
          </h1>
          <p className="text-gray-600">
            {selectedCategory 
              ? `Showing ${total} job${total !== 1 ? 's' : ''} in this category`
              : `Browse ${total} job opportunities from top Nepali job portals`}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search jobs by title, company, or category..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by Category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/jobs?type=${selectedType}`}>
                <Badge 
                  variant={!selectedCategory ? "default" : "outline"}
                  className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                    !selectedCategory 
                      ? "bg-gradient-primary text-white border-0 shadow-md text-primary" 
                      : "hover:bg-primary/10 hover:border-primary/50 text-gray-900"
                  }`}
                >
                  All Categories
                </Badge>
              </a>
              {categories.map((cat: any) => (
                <a
                  key={cat.id}
                  href={`/jobs?type=${selectedType}&category=${cat.id}`}
                >
                  <Badge
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    className={`px-4 py-2 text-sm cursor-pointer transition-all font-semibold ${
                      selectedCategory === cat.id
                        ? "bg-gradient-primary text-white border-0 shadow-md hover:text-white text-primary text-gray-900"
                        : "hover:bg-primary/10 hover:border-primary/50 text-gray-900 border-gray-300 "
                    }`}
                  >
                    {cat.name}
                  </Badge>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <p className="text-xl text-muted-foreground mb-2">
                {selectedCategory 
                  ? "No jobs found in this category yet."
                  : "No jobs found matching your criteria."}
              </p>
              <p className="text-muted-foreground mb-6">
                {selectedCategory 
                  ? "This category may not have any jobs yet, or the jobs may not have been assigned to categories. Try viewing all jobs or selecting a different category."
                  : "Try adjusting your search terms or removing some filters to see more results."}
              </p>
              <div className="flex gap-3 justify-center">
                <a href={`/jobs?type=${selectedType}`}>
                  <Button variant="outline">View All Jobs</Button>
                </a>
                <a href="/">
                  <Button>Back to Home</Button>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {jobs.length} of {total} jobs
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}


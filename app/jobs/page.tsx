"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";
import { FilterSidebar } from "@/components/FilterSidebar";

const ITEMS_PER_PAGE = 12;

function JobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [jobTypes, setJobTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("search"), searchParams.get("category"), searchParams.get("type"), searchParams.get("jobType"), searchParams.get("location"), searchParams.get("urgency"), searchParams.get("page")]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const search = searchParams.get("search") || "";
      const category = searchParams.get("category") || "";
      const type = searchParams.get("type") || "job";
      const page = parseInt(searchParams.get("page") || "1");

      const jobType = searchParams.get("jobType") || "";
      const location = searchParams.get("location") || "";
      const urgency = searchParams.get("urgency") || "";

      const params = new URLSearchParams();
      params.append("limit", String(ITEMS_PER_PAGE));
      params.append("offset", String((page - 1) * ITEMS_PER_PAGE));
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (type) params.append("type", type);
      if (jobType) params.append("jobType", jobType);
      if (location) params.append("location", location);
      if (urgency) params.append("urgency", urgency);

      const [jobsRes, categoriesRes, filtersRes] = await Promise.all([
        fetch(`/api/jobs?${params.toString()}`),
        fetch(`/api/categories?popular=true&limit=20`),
        fetch(`/api/filters?type=${type}`),
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        console.log(`[Jobs Page] Received ${jobsData.data?.length || 0} jobs, total: ${jobsData.total || 0}`);
        setJobs(jobsData.success ? jobsData.data : []);
        setTotal(jobsData.total || 0);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.success ? categoriesData.data : []);
      }

      if (filtersRes.ok) {
        const filtersData = await filtersRes.json();
        if (filtersData.success) {
          setJobTypes(filtersData.data.jobTypes || []);
          setLocations(filtersData.data.locations || []);
        }
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/jobs?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/jobs?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/jobs?${params.toString()}`);
  };

  const handleJobTypeChange = (jobType: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (jobType) {
      params.set("jobType", jobType);
    } else {
      params.delete("jobType");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/jobs?${params.toString()}`);
  };

  const handleUrgencyChange = (urgency: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (urgency) {
      params.set("urgency", urgency);
    } else {
      params.delete("urgency");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/jobs?${params.toString()}`);
  };

  const handleLocationChange = (location: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (location) {
      params.set("location", location);
    } else {
      params.delete("location");
    }
    params.delete("page"); // Reset to page 1
    router.push(`/jobs?${params.toString()}`);
  };

  const removeFilter = (filterType: "category" | "search" | "jobType" | "location" | "urgency") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterType);
    params.delete("page");
    router.push(`/jobs?${params.toString()}`);
    if (filterType === "search") {
      setSearchValue("");
    }
  };

  const selectedCategory = searchParams.get("category");
  const selectedJobType = searchParams.get("jobType");
  const selectedLocation = searchParams.get("location");
  const selectedUrgency = searchParams.get("urgency");
  const selectedType = searchParams.get("type") || "job";
  const selectedCategoryName = categories.find((c: any) => c.id === selectedCategory)?.name;

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Skeleton components
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
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
            {selectedCategoryName
              ? `${selectedCategoryName} Jobs`
              : "Jobs in Nepal"}
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {selectedCategory 
              ? `Browse ${total} job${total !== 1 ? 's' : ''} in this category`
              : `Browse ${total} job opportunities from top Nepali job portals`}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <div className="w-full">
            {/* Search and Active Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-2">
                <form onSubmit={handleSearch} className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search jobs by title, company, or category..."
                    className="pl-10"
                  />
                </form>
                <Button type="button" onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (searchValue) {
                    params.set("search", searchValue);
                  } else {
                    params.delete("search");
                  }
                  params.delete("page");
                  router.push(`/jobs?${params.toString()}`);
                }}>Search</Button>
                <FilterSidebar
                  categories={categories}
                  jobTypes={jobTypes}
                  locations={locations}
                  selectedCategory={selectedCategory}
                  selectedJobType={selectedJobType}
                  selectedLocation={selectedLocation}
                  selectedUrgency={selectedUrgency}
                  onCategoryChange={handleCategoryChange}
                  onJobTypeChange={handleJobTypeChange}
                  onLocationChange={handleLocationChange}
                  onUrgencyChange={handleUrgencyChange}
                />
              </div>

              {/* Active Filters - Dice.com style */}
              {(selectedCategory || selectedJobType || selectedLocation || selectedUrgency || searchParams.get("search")) && (
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                      {selectedCategoryName}
                      <button
                        onClick={() => removeFilter("category")}
                        className="ml-0.5 hover:text-blue-900 transition-colors"
                        aria-label="Remove category filter"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )}
                  {selectedJobType && (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                      {jobTypes.find((jt) => jt.value === selectedJobType)?.label || selectedJobType}
                      <button
                        onClick={() => removeFilter("jobType")}
                        className="ml-0.5 hover:text-blue-900 transition-colors"
                        aria-label="Remove job type filter"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )}
                  {selectedLocation && (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                      {selectedLocation}
                      <button
                        onClick={() => removeFilter("location")}
                        className="ml-0.5 hover:text-blue-900 transition-colors"
                        aria-label="Remove location filter"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )}
                  {selectedUrgency && (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                      {selectedUrgency === "today" ? "Today" : selectedUrgency === "3days" ? "Last 3 days" : selectedUrgency === "7days" ? "Last 7 days" : selectedUrgency === "30days" ? "Last 30 days" : selectedUrgency}
                      <button
                        onClick={() => removeFilter("urgency")}
                        className="ml-0.5 hover:text-blue-900 transition-colors"
                        aria-label="Remove urgency filter"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )}
                  {searchParams.get("search") && (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                      {searchParams.get("search")}
                      <button
                        onClick={() => removeFilter("search")}
                        className="ml-0.5 hover:text-blue-900 transition-colors"
                        aria-label="Remove search filter"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("type", selectedType);
                      router.push(`/jobs?${params.toString()}`);
                      setSearchValue("");
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>


            {/* Jobs List */}
            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                    <SkeletonJobCard key={i} />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <p className="text-xl text-muted-foreground mb-2">
                      {selectedCategory 
                        ? "No jobs found in this category yet."
                        : "No jobs found matching your criteria."}
                    </p>
                    <p className="text-muted-foreground mb-6 text-sm">
                      {selectedCategory 
                        ? "This category may not have any jobs yet. Try viewing all jobs or selecting a different category."
                        : "Try adjusting your search terms or removing some filters to see more results."}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link href={`/jobs?type=${selectedType}`}>
                        <Button variant="outline">View All Jobs</Button>
                      </Link>
                      <Link href="/">
                        <Button>Back to Home</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                    {jobs.map((job: any) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={total}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  )}
                </>
              )}
            </div>
          </div>
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

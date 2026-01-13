"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X, ChevronDown, MapPin } from "lucide-react";
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

      // Use combined endpoint for faster loading (single API call instead of 3)
      params.append("includeFilters", "true");
      params.append("includeCategories", "true");
      
      const combinedRes = await fetch(`/api/jobs/combined?${params.toString()}`);

      if (combinedRes.ok) {
        const combinedData = await combinedRes.json();
        console.log(`[Jobs Page] Received ${combinedData.data?.jobs?.length || 0} jobs, total: ${combinedData.total || 0}`);
        
        if (combinedData.success) {
          setJobs(combinedData.data.jobs || []);
          setTotal(combinedData.total || 0);
          setCategories(combinedData.data.categories || []);
          setJobTypes(combinedData.data.filters?.jobTypes || []);
          setLocations(combinedData.data.filters?.locations || []);
        }
      } else {
        console.error(`[Jobs Page] Failed to fetch data: ${combinedRes.status}`);
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
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8 md:py-10">
          {/* Header with Title */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              {selectedCategoryName
                ? `${selectedCategoryName} Jobs`
                : (
                  <>
                    Shape Your Future with <span className="text-[#0A66C2]">kamkhoj</span>
                  </>
                )}
            </h1>
          </div>

          {/* Enhanced Search Bar */}
          <div className="space-y-4">
              {/* Desktop: Search with inline filters, Mobile: Search with filter button */}
              <div className="flex flex-col gap-3">
                {/* Row 1: Search Input + Location + Search Button */}
                <div className="flex flex-col md:flex-row gap-3">
                  <form onSubmit={handleSearch} className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search jobs by title, company, or category..."
                      className="pl-12 pr-4 h-12 text-base border-gray-300 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
                    />
                  </form>
                  
                  {/* Location Filter - Desktop only in this row */}
                  <div className="hidden md:block relative min-w-[160px]">
                    <select
                      value={selectedLocation || ""}
                      onChange={(e) => handleLocationChange(e.target.value || null)}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 h-12 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] cursor-pointer w-full"
                    >
                      <option value="">Location</option>
                      {locations.map((loc: any) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                      type="button" 
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        if (searchValue) {
                          params.set("search", searchValue);
                        } else {
                          params.delete("search");
                        }
                        params.delete("page");
                        router.push(`/jobs?${params.toString()}`);
                      }}
                      className="h-12 px-6 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold shadow-sm flex-1 md:flex-none"
                    >
                      Search
                    </Button>
                    {/* Mobile Filter Button */}
                    <div className="md:hidden">
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
                  </div>
                </div>

                {/* Row 2: Date Posted, Work Type, Employment Type - Desktop only */}
                <div className="hidden md:grid grid-cols-3 gap-3">
                  {/* Date Posted Filter */}
                  <div className="relative">
                    <select
                      value={selectedUrgency || ""}
                      onChange={(e) => handleUrgencyChange(e.target.value || null)}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 h-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] cursor-pointer w-full"
                    >
                      <option value="">Date posted</option>
                      <option value="today">Today</option>
                      <option value="3days">Last 3 days</option>
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>

                  {/* Work Type Filter (On-site/Hybrid/Remote) */}
                  <div className="relative">
                    <select
                      value={selectedJobType === "remote" ? "remote" : selectedJobType === "hybrid" ? "hybrid" : selectedJobType === "onsite" ? "onsite" : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleJobTypeChange(value || null);
                      }}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 h-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] cursor-pointer w-full"
                    >
                      <option value="">On-site/Hybrid/Remote</option>
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>

                  {/* Employment Type Filter */}
                  <div className="relative">
                    <select
                      value={selectedJobType === "full-time" ? "full-time" : selectedJobType === "part-time" ? "part-time" : selectedJobType === "contract" ? "contract" : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          handleJobTypeChange(value);
                        } else {
                          handleJobTypeChange(null);
                        }
                      }}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 h-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] cursor-pointer w-full"
                    >
                      <option value="">Employment type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>


              {/* Active Filters */}
              {(selectedCategory || selectedJobType || selectedLocation || selectedUrgency || searchParams.get("search")) && (
                <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500 font-medium mr-1">Active filters:</span>
                  {selectedCategory && (
                    <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
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
                    <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
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
                    <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
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
                    <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
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
                    <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
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
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("type", selectedType);
                      router.push(`/jobs?${params.toString()}`);
                      setSearchValue("");
                    }}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm font-medium bg-transparent border-0"
                  >
                    Clear all
                  </Button>
                </div>
              )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <div className="w-full">
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
                        <Button>View All Jobs</Button>
                      </Link>
                      <Link href="/">
                        <Button>Back to Home</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
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

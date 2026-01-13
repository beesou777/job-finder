"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RemoteJobCard } from "@/components/RemoteJobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X, ChevronDown, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 18;
const API_URL = "https://js-ha.simplify.jobs/multi_search";
const API_KEY = "SWF1ODFZbzBkcVlVdnVwT2FqUE5EZ3JpSk5hVmdpUHg1SklXWEdGbHZVRT1POHJieyJleGNsdWRlX2ZpZWxkcyI6ImNvbXBhbnlfdXJsLGNhdGVnb3JpZXMsYWRkaXRpb25hbF9yZXF1aXJlbWVudHMsY291bnRyaWVzLGRlZ3JlZXMsZ2VvbG9jYXRpb25zLGluZHVzdHJpZXMsaXNfc2ltcGxlX2FwcGxpY2F0aW9uLGpvYl9saXN0cyxsZWFkZXJzaGlwX3R5cGUsc2VjdXJpdHlfY2xlYXJhbmNlLHNraWxscyx1cmwifQ%3D%3D";

interface FacetCount {
  count: number;
  value: string;
  highlighted: string;
}

interface FacetCounts {
  field_name: string;
  counts: FacetCount[];
}

interface Job {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  locations?: string[];
  functions?: string[];
  experience_level?: string[];
  travel_requirements?: string;
  type?: string;
  min_salary?: number;
  max_salary?: number;
  currency_type?: string;
  salary_period?: number;
  posting_id: string;
  company_id?: string;
  start_date?: number;
}

function RemoteJobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [facetCounts, setFacetCounts] = useState<FacetCounts[]>([]);
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Get filter values from URL
  const selectedCountry = searchParams.get("country") || "";
  const selectedDegree = searchParams.get("degree") || "";
  const selectedExperience = searchParams.get("experience") || "";
  const selectedFunction = searchParams.get("function") || "";
  const selectedLocation = searchParams.get("location") || "";
  const selectedType = searchParams.get("type") || "";
  const selectedTravelReq = searchParams.get("travel") || "Remote";

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get("q"),
    searchParams.get("country"),
    searchParams.get("degree"),
    searchParams.get("experience"),
    searchParams.get("function"),
    searchParams.get("location"),
    searchParams.get("type"),
    searchParams.get("travel"),
    searchParams.get("page"),
  ]);

  const buildFilterBy = () => {
    const filters: string[] = [];
    
    // Always filter by Remote travel requirement
    if (selectedTravelReq) {
      filters.push(`travel_requirements:[\`${selectedTravelReq}\`]`);
    }
    
    if (selectedCountry) {
      filters.push(`countries:[\`${selectedCountry}\`]`);
    }
    
    if (selectedDegree) {
      filters.push(`degrees:[\`${selectedDegree}\`]`);
    }
    
    if (selectedExperience) {
      filters.push(`experience_level:[\`${selectedExperience}\`]`);
    }
    
    if (selectedFunction) {
      filters.push(`functions:[\`${selectedFunction}\`]`);
    }
    
    if (selectedLocation) {
      filters.push(`locations:[\`${selectedLocation}\`]`);
    }
    
    if (selectedType) {
      filters.push(`type:[\`${selectedType}\`]`);
    }
    
    return filters.join(" && ");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = searchValue || searchParams.get("q") || "frontend";
      
      const payload = {
        searches: [
          {
            collection: "jobs",
            q: query,
            query_by: "title,company_name,functions,locations",
            facet_by: "countries,degrees,experience_level,functions,locations,travel_requirements,type",
            filter_by: buildFilterBy() || "travel_requirements:[`Remote`]",
            highlight_full_fields: "title,company_name,functions,locations",
            sort_by: "_text_match:desc,start_date:desc",
            page: currentPage,
            per_page: ITEMS_PER_PAGE,
            max_facet_values: 50,
          },
          {
            collection: "jobs",
            q: query,
            query_by: "title,company_name,functions,locations",
            facet_by: "travel_requirements",
            highlight_full_fields: "title,company_name,functions,locations",
            sort_by: "_text_match:desc,start_date:desc",
            page: 1,
            per_page: 1,
            max_facet_values: 50,
          },
        ],
      };

      const response = await fetch(`${API_URL}?x-typesense-api-key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.results && data.results[0]) {
          const firstResult = data.results[0];
          const jobHits = firstResult.hits || [];
          
          setJobs(
            jobHits.map((hit: any) => ({
              ...hit.document,
              id: hit.document.id || hit.document.posting_id,
            }))
          );
          setTotal(firstResult.found || 0);
          setFacetCounts(firstResult.facet_counts || []);
        }
      } else {
        console.error("Failed to fetch remote jobs:", response.status);
      }
    } catch (error) {
      console.error("Error fetching remote jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("q", searchValue);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/remote-jobs?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/remote-jobs?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/remote-jobs?${params.toString()}`);
  };

  const removeFilter = (filterType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterType);
    params.delete("page");
    router.push(`/remote-jobs?${params.toString()}`);
  };

  const getFacetOptions = (fieldName: string): FacetCount[] => {
    const facet = facetCounts.find((f) => f.field_name === fieldName);
    return facet?.counts || [];
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Skeleton component
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
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              Find Your Dream <span className="text-[#0A66C2]">International Remote Job</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Discover {total.toLocaleString()} international remote opportunities from top companies worldwide
            </p>
          </div>

          {/* Search Bar */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search international remote jobs by title, company, or skills..."
                  className="pl-12 pr-4 h-12 text-base border-gray-300 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-6 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold shadow-sm"
              >
                Search
              </Button>
            </form>

            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* Countries */}
              <Select
                value={selectedCountry}
                onValueChange={(value) => updateFilter("country", value === "all" ? null : value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {getFacetOptions("countries").map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Experience Level */}
              <Select
                value={selectedExperience}
                onValueChange={(value) => updateFilter("experience", value === "all" ? null : value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {getFacetOptions("experience_level").map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Functions */}
              <Select
                value={selectedFunction}
                onValueChange={(value) => updateFilter("function", value === "all" ? null : value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Functions</SelectItem>
                  {getFacetOptions("functions").map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Locations */}
              <Select
                value={selectedLocation}
                onValueChange={(value) => updateFilter("location", value === "all" ? null : value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {getFacetOptions("locations").slice(0, 50).map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Degrees */}
              <Select
                value={selectedDegree}
                onValueChange={(value) => updateFilter("degree", value === "all" ? null : value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Degree" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degrees</SelectItem>
                  {getFacetOptions("degrees").map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Job Type */}
              <Select
                value={selectedType}
                onValueChange={(value) => updateFilter("type", value === "all" ? null : value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getFacetOptions("type").map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Travel Requirements */}
              <Select
                value={selectedTravelReq}
                onValueChange={(value) => updateFilter("travel", value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Travel" />
                </SelectTrigger>
                <SelectContent>
                  {getFacetOptions("travel_requirements").map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(selectedCountry || selectedDegree || selectedExperience || 
              selectedFunction || selectedLocation || selectedType || 
              searchParams.get("q")) && (
              <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium mr-1">Active filters:</span>
                {selectedCountry && (
                  <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                    Country: {selectedCountry}
                    <button
                      onClick={() => removeFilter("country")}
                      className="ml-0.5 hover:text-blue-900 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {selectedDegree && (
                  <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                    {selectedDegree}
                    <button
                      onClick={() => removeFilter("degree")}
                      className="ml-0.5 hover:text-blue-900 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {selectedExperience && (
                  <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                    {selectedExperience}
                    <button
                      onClick={() => removeFilter("experience")}
                      className="ml-0.5 hover:text-blue-900 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {selectedFunction && (
                  <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                    {selectedFunction}
                    <button
                      onClick={() => removeFilter("function")}
                      className="ml-0.5 hover:text-blue-900 transition-colors"
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
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {selectedType && (
                  <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                    {selectedType}
                    <button
                      onClick={() => removeFilter("type")}
                      className="ml-0.5 hover:text-blue-900 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                {searchParams.get("q") && (
                  <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                    {searchParams.get("q")}
                    <button
                      onClick={() => removeFilter("q")}
                      className="ml-0.5 hover:text-blue-900 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                )}
                <Button
                  onClick={() => {
                    router.push("/remote-jobs?travel=Remote");
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
        <div className="w-full">
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
                  No international remote jobs found matching your criteria.
                </p>
                <p className="text-muted-foreground mb-6 text-sm">
                  Try adjusting your search terms or removing some filters to see more results.
                </p>
                <Button
                  onClick={() => {
                    router.push("/remote-jobs?travel=Remote");
                    setSearchValue("");
                  }}
                >
                  View All International Remote Jobs
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {jobs.map((job) => (
                  <RemoteJobCard key={job.id} job={job} />
                ))}
              </div>

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
  );
}

export default function RemoteJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <RemoteJobsPageContent />
    </Suspense>
  );
}


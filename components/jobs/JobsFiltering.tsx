"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterSidebar } from "@/components/FilterSidebar";

interface JobsFilteringProps {
  categories: any[];
  jobTypes: any[];
  locations: any[];
  basePath?: string;
  title?: string;
  searchPlaceholder?: string;
}

export function JobsFiltering({ 
  categories, 
  jobTypes, 
  locations, 
  basePath = "/jobs",
  title,
  searchPlaceholder = "Search jobs by title, company, or category..."
}: JobsFilteringProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page"); // Reset to page 1 on filter change
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchValue || null });
  };

  const removeFilter = (key: string) => {
    updateParams({ [key]: null });
    if (key === "search") setSearchValue("");
  };

  const selectedCategory = searchParams.get("category");
  const selectedJobType = searchParams.get("jobType");
  const selectedLocation = searchParams.get("location");
  const selectedUrgency = searchParams.get("urgency");
  const selectedCategoryName = categories.find((c: any) => c.id === selectedCategory)?.name;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
            {title || (selectedCategoryName
              ? `${selectedCategoryName} Jobs`
              : (
                <>
                  Shape Your Future with <span className="text-[#0A66C2]">kamkhoj</span>
                </>
              ))}
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-12 pr-4 h-12 text-base border-gray-300 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
                />
              </form>
              
              <div className="hidden md:block relative min-w-[160px]">
                <select
                  value={selectedLocation || ""}
                  onChange={(e) => updateParams({ location: e.target.value || null })}
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
                  onClick={() => updateParams({ search: searchValue || null })}
                  className="h-12 px-6 bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold shadow-sm flex-1 md:flex-none"
                >
                  Search
                </Button>
                <div className="md:hidden">
                  <FilterSidebar
                    categories={categories}
                    jobTypes={jobTypes}
                    locations={locations}
                    selectedCategory={selectedCategory}
                    selectedJobType={selectedJobType}
                    selectedLocation={selectedLocation}
                    selectedUrgency={selectedUrgency}
                    onCategoryChange={(v) => updateParams({ category: v })}
                    onJobTypeChange={(v) => updateParams({ jobType: v })}
                    onLocationChange={(v) => updateParams({ location: v })}
                    onUrgencyChange={(v) => updateParams({ urgency: v })}
                  />
                </div>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-3 gap-3">
              <div className="relative">
                <select
                  value={selectedUrgency || ""}
                  onChange={(e) => updateParams({ urgency: e.target.value || null })}
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

              <div className="relative">
                <select
                  value={selectedJobType === "remote" ? "remote" : selectedJobType === "hybrid" ? "hybrid" : selectedJobType === "onsite" ? "onsite" : ""}
                  onChange={(e) => updateParams({ jobType: e.target.value || null })}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 h-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-[#0A66C2] cursor-pointer w-full"
                >
                  <option value="">On-site/Hybrid/Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={selectedJobType === "full-time" ? "full-time" : selectedJobType === "part-time" ? "part-time" : selectedJobType === "contract" ? "contract" : ""}
                  onChange={(e) => updateParams({ jobType: e.target.value || null })}
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

          {(selectedCategory || selectedJobType || selectedLocation || selectedUrgency || searchParams.get("search")) && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium mr-1">Active filters:</span>
              {selectedCategory && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedCategoryName}
                  <button onClick={() => removeFilter("category")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedJobType && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedJobType}
                  <button onClick={() => removeFilter("jobType")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedLocation && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedLocation}
                  <button onClick={() => removeFilter("location")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedUrgency && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedUrgency}
                  <button onClick={() => removeFilter("urgency")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {searchParams.get("search") && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {searchParams.get("search")}
                  <button onClick={() => removeFilter("search")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              <Button
                onClick={() => router.push(basePath)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm font-medium bg-transparent border-0"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

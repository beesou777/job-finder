"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RemoteJobsFilteringProps {
  facetCounts: any[];
}

export function RemoteJobsFiltering({ facetCounts }: RemoteJobsFilteringProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    router.push(`/remote-jobs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchValue || null });
  };

  const removeFilter = (key: string) => {
    updateParams({ [key]: null });
    if (key === "q") setSearchValue("");
  };

  const getFacetOptions = (fieldName: string) => {
    const facet = facetCounts.find((f) => f.field_name === fieldName);
    return facet?.counts || [];
  };

  const selectedCountry = searchParams.get("country");
  const selectedExperience = searchParams.get("experience");
  const selectedFunction = searchParams.get("function");
  const selectedLocation = searchParams.get("location");
  const selectedType = searchParams.get("type");
  const selectedTravelReq = searchParams.get("travel") || "Remote";

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
            Find Your Dream <span className="text-[#0A66C2]">International Remote Job</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Discover thousands of international remote opportunities from top companies worldwide
          </p>
        </div>

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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Countries */}
            <Select
              value={selectedCountry || "all"}
              onValueChange={(value) => updateParams({ country: value === "all" ? null : value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {getFacetOptions("countries").map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Experience Level */}
            <Select
              value={selectedExperience || "all"}
              onValueChange={(value) => updateParams({ experience: value === "all" ? null : value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {getFacetOptions("experience_level").map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Functions */}
            <Select
              value={selectedFunction || "all"}
              onValueChange={(value) => updateParams({ function: value === "all" ? null : value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Function" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Functions</SelectItem>
                {getFacetOptions("functions").map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Locations */}
            <Select
              value={selectedLocation || "all"}
              onValueChange={(value) => updateParams({ location: value === "all" ? null : value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {getFacetOptions("locations").slice(0, 50).map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Job Type */}
            <Select
              value={selectedType || "all"}
              onValueChange={(value) => updateParams({ type: value === "all" ? null : value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getFacetOptions("type").map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Travel Requirements */}
            <Select
              value={selectedTravelReq}
              onValueChange={(value) => updateParams({ travel: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Travel" />
              </SelectTrigger>
              <SelectContent>
                {getFacetOptions("travel_requirements").map((item: any) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.value} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(selectedCountry || selectedExperience || selectedFunction || selectedLocation || selectedType || searchParams.get("q")) && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium mr-1">Active filters:</span>
              {selectedCountry && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedCountry}
                  <button onClick={() => removeFilter("country")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
               {selectedExperience && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedExperience}
                  <button onClick={() => removeFilter("experience")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedFunction && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedFunction}
                  <button onClick={() => removeFilter("function")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedLocation && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedLocation}
                  <button onClick={() => removeFilter("location")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedType && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {selectedType}
                  <button onClick={() => removeFilter("type")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {searchParams.get("q") && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {searchParams.get("q")}
                  <button onClick={() => removeFilter("q")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              <Button
                onClick={() => router.push("/remote-jobs?travel=Remote")}
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

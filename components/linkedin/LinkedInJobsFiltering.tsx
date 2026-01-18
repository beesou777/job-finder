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

interface LinkedInJobsFilteringProps {
  companies: any[];
  places: any[];
}

export function LinkedInJobsFiltering({ companies, places }: LinkedInJobsFilteringProps) {
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
    params.delete("page");
    params.delete("jobId");
    router.push(`/linkedin-jobs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchValue || null });
  };

  const removeFilter = (key: string) => {
    updateParams({ [key]: null });
    if (key === "search") setSearchValue("");
  };

  const selectedCompany = searchParams.get("company");
  const selectedPlace = searchParams.get("place");
  const selectedDatePosted = searchParams.get("datePosted");

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
            LinkedIn Jobs - Find Your <span className="text-[#0A66C2]">Next Opportunity</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Discover thousands of LinkedIn job opportunities from top companies in Nepal
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for roles, companies, or locations"
              className="pl-12 pr-4 h-12 text-base border-gray-300 focus:border-[#0A66C2] focus:ring-[#0A66C2]"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-3 mb-4">
          <Select
            value={selectedCompany || "all"}
            onValueChange={(value) => updateParams({ company: value === "all" ? null : value })}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.filter((item) => item.value).map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.value} ({item.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedPlace || "all"}
            onValueChange={(value) => updateParams({ place: value === "all" ? null : value })}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {places.filter((item) => item.value).map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.value} ({item.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDatePosted || "all"}
            onValueChange={(value) => updateParams({ datePosted: value === "all" ? null : value })}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Date posted" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="3days">Last 3 days</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          {(selectedCompany || selectedPlace || selectedDatePosted || searchParams.get("search")) && (
            <Button
              onClick={() => {
                router.push("/linkedin-jobs");
                setSearchValue("");
              }}
              variant="outline"
              className="h-10"
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {(selectedCompany || selectedPlace || selectedDatePosted || searchParams.get("search")) && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium mr-1">Active filters:</span>
            {selectedCompany && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                Company: {selectedCompany}
                <button onClick={() => removeFilter("company")} className="ml-0.5 hover:text-blue-900 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {selectedPlace && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                Location: {selectedPlace}
                <button onClick={() => removeFilter("place")} className="ml-0.5 hover:text-blue-900 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {selectedDatePosted && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                Date: {selectedDatePosted}
                <button onClick={() => removeFilter("datePosted")} className="ml-0.5 hover:text-blue-900 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {searchParams.get("search") && (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                {searchParams.get("search")}
                <button onClick={() => removeFilter("search")} className="ml-0.5 hover:text-blue-900 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

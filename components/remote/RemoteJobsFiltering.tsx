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
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams?.get("q") || "");

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString());
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
    <div className="bg-zinc-950 border-b border-white/10 text-white">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Remote openings
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Find international remote jobs
          </h1>
          <p className="text-zinc-400 mt-3 max-w-2xl">
            Discover thousands of international remote opportunities from top companies worldwide
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#18181a] p-3 md:p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search international remote jobs by title, company, or skills..."
                className="pl-12 pr-4 h-12 text-base rounded-xl border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary"
              />
            </div>
            <Button
              type="submit"
              className="h-12 rounded-xl px-6 bg-primary hover:bg-white text-zinc-950 font-black shadow-sm"
            >
              Search
            </Button>
          </form>

          {searchParams.get("q") && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-zinc-500 font-bold mr-1">Active filters:</span>
              {selectedCountry && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200"
                >
                  {selectedCountry}
                  <button
                    onClick={() => removeFilter("country")}
                    className="ml-0.5 hover:text-blue-900 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedExperience && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200"
                >
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
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200"
                >
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
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200"
                >
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
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200"
                >
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
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200"
                >
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

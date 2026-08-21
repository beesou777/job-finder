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
  const paramsSnapshot = searchParams ?? new URLSearchParams();
  const [searchValue, setSearchValue] = useState(paramsSnapshot.get("search") || "");

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(paramsSnapshot.toString());
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

  const selectedCompany = paramsSnapshot.get("company");
  const selectedPlace = paramsSnapshot.get("place");
  const selectedDatePosted = paramsSnapshot.get("datePosted");

  return (
    <div className="bg-zinc-950 border-b border-white/10 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            LinkedIn sourced
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            LinkedIn jobs from public leads
          </h1>
          <p className="text-zinc-400 mt-3 max-w-2xl">
            Discover thousands of LinkedIn job opportunities from top companies in Nepal
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for roles, companies, or locations"
              className="pl-12 pr-4 h-12 text-base rounded-xl border-white/10 bg-[#18181a] text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary"
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
              {companies
                .filter((item) => item.value)
                .map((item) => (
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
              {places
                .filter((item) => item.value)
                .map((item) => (
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

          {(selectedCompany ||
            selectedPlace ||
            selectedDatePosted ||
            paramsSnapshot.get("search")) && (
            <Button
              onClick={() => {
                router.push("/linkedin-jobs");
                setSearchValue("");
              }}
              variant="outline"
              className="h-10 rounded-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {(selectedCompany ||
          selectedPlace ||
          selectedDatePosted ||
          paramsSnapshot.get("search")) && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-white/10">
            <span className="text-sm text-zinc-500 font-medium mr-1">Active filters:</span>
            {selectedCompany && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-primary"
              >
                Company: {selectedCompany}
                <button
                  onClick={() => removeFilter("company")}
                  className="ml-0.5 hover:text-zinc-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {selectedPlace && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-primary"
              >
                Location: {selectedPlace}
                <button
                  onClick={() => removeFilter("place")}
                  className="ml-0.5 hover:text-zinc-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {selectedDatePosted && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-primary"
              >
                Date: {selectedDatePosted}
                <button
                  onClick={() => removeFilter("datePosted")}
                  className="ml-0.5 hover:text-zinc-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {paramsSnapshot.get("search") && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-primary"
              >
                {paramsSnapshot.get("search")}
                <button
                  onClick={() => removeFilter("search")}
                  className="ml-0.5 hover:text-zinc-50 transition-colors"
                >
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

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const paramsSnapshot = searchParams ?? new URLSearchParams();
  const [searchValue, setSearchValue] = useState(paramsSnapshot.get("search") || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(paramsSnapshot.toString());
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

  const selectedCategory = paramsSnapshot.get("category");
  const selectedJobType = paramsSnapshot.get("jobType");
  const selectedLocation = paramsSnapshot.get("location");
  const selectedUrgency = paramsSnapshot.get("urgency");
  const selectedCategoryName = categories.find((c: any) => c.id === selectedCategory)?.name;
  const activeFilterCount = [
    selectedCategory,
    selectedJobType,
    selectedLocation,
    selectedUrgency,
    paramsSnapshot.get("search"),
  ].filter(Boolean).length;

  return (
    <div className="border-b border-white/10 bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6 max-w-4xl">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Search openings
          </p>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            {title || (selectedCategoryName
              ? `${selectedCategoryName} Jobs`
              : (
                <>
                  Find verified job leads with <span className="text-primary">kamkhoj</span>
                </>
              ))}
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Filter by title, company, category, location, deadline, and work
            arrangement. Open the original source before applying to confirm
            salary, eligibility, and instructions.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-[#18181a] p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-12 rounded-xl border-white/10 bg-zinc-950 pl-12 pr-4 text-base font-semibold text-white placeholder:text-zinc-500 focus:border-primary focus:ring-primary"
                />
              </form>

              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  onClick={() => updateParams({ search: searchValue || null })}
                  className="h-12 rounded-xl bg-primary px-6 font-black text-zinc-950 shadow-sm hover:bg-white flex-1 md:flex-none"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  onClick={() => setFiltersOpen((value) => !value)}
                  className="h-12 rounded-xl border border-white/10 bg-zinc-950 px-5 font-black text-white hover:border-primary hover:bg-zinc-900"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-zinc-950">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {filtersOpen && (
            <div className="dark-panel-grid rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl shadow-black/30">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-white">Refine your search</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Choose the details that matter, then close this card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full border border-white/10 p-2 text-zinc-400 hover:border-primary hover:text-primary"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <FilterSelect
                  label="Category"
                  value={selectedCategory || ""}
                  onChange={(value) => updateParams({ category: value || null })}
                  options={[
                    { value: "", label: "All categories" },
                    ...categories.map((category: any) => ({
                      value: category.id,
                      label: category.name,
                    })),
                  ]}
                />
                <FilterSelect
                  label="Location"
                  value={selectedLocation || ""}
                  onChange={(value) => updateParams({ location: value || null })}
                  options={[
                    { value: "", label: "All locations" },
                    ...locations.map((loc: any) => ({
                      value: loc.value,
                      label: loc.label,
                    })),
                  ]}
                />
                <FilterSelect
                  label="Date posted"
                  value={selectedUrgency || ""}
                  onChange={(value) => updateParams({ urgency: value || null })}
                  options={[
                    { value: "", label: "Any time" },
                    { value: "today", label: "Today" },
                    { value: "3days", label: "Last 3 days" },
                    { value: "7days", label: "Last 7 days" },
                    { value: "30days", label: "Last 30 days" },
                  ]}
                />
                <FilterSelect
                  label="Work type"
                  value={selectedJobType || ""}
                  onChange={(value) => updateParams({ jobType: value || null })}
                  options={[
                    { value: "", label: "Any work type" },
                    ...jobTypes.map((type: any) => ({
                      value: type.value,
                      label: type.label,
                    })),
                  ]}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-full bg-primary px-5 font-black text-zinc-950 hover:bg-white"
                >
                  Done
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    router.push(basePath);
                  }}
                  className="rounded-full border border-white/10 bg-transparent px-5 font-black text-zinc-300 hover:bg-white/10 hover:text-white"
                >
                  Clear all
                </Button>
              </div>
            </div>
            )}

            {/* <div className="hidden md:grid grid-cols-3 gap-3">
              <div className="relative">
                <select
                  value={selectedUrgency || ""}
                  onChange={(e) => updateParams({ urgency: e.target.value || null })}
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 pr-8 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Date posted</option>
                  <option value="today">Today</option>
                  <option value="3days">Last 3 days</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>

              <div className="relative">
                <select
                  value={selectedJobType === "remote" ? "remote" : selectedJobType === "hybrid" ? "hybrid" : selectedJobType === "onsite" ? "onsite" : ""}
                  onChange={(e) => updateParams({ jobType: e.target.value || null })}
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 pr-8 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">On-site/Hybrid/Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>

              <div className="relative">
                <select
                  value={selectedJobType === "full-time" ? "full-time" : selectedJobType === "part-time" ? "part-time" : selectedJobType === "contract" ? "contract" : ""}
                  onChange={(e) => updateParams({ jobType: e.target.value || null })}
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-2 pr-8 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Employment type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>
            </div> */}
          </div>

          {(selectedCategory || selectedJobType || selectedLocation || selectedUrgency || paramsSnapshot.get("search")) && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-white/10">
              <span className="text-sm text-zinc-500 font-bold mr-1">Active filters:</span>
              {selectedCategory && (
                <Badge className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
                  {selectedCategoryName}
                  <button onClick={() => removeFilter("category")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedJobType && (
                <Badge className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
                  {selectedJobType}
                  <button onClick={() => removeFilter("jobType")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedLocation && (
                <Badge className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
                  {selectedLocation}
                  <button onClick={() => removeFilter("location")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedUrgency && (
                <Badge className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
                  {selectedUrgency}
                  <button onClick={() => removeFilter("urgency")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {paramsSnapshot.get("search") && (
                <Badge className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3 py-1.5 text-primary">
                  {paramsSnapshot.get("search")}
                  <button onClick={() => removeFilter("search")} className="ml-0.5 hover:text-blue-900 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              <Button
                onClick={() => router.push(basePath)}
                className="border-0 bg-transparent text-sm font-bold text-zinc-400 hover:bg-white/10 hover:text-white"
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#18181a] px-4 py-2 pr-10 text-sm font-bold text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {options.map((option) => (
            <option key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      </div>
    </label>
  );
}

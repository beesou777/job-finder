"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
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
  searchPlaceholder = "Search jobs by title, company, or category...",
}: JobsFilteringProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsSnapshot = searchParams ?? new URLSearchParams();
  const [searchValue, setSearchValue] = useState(paramsSnapshot.get("search") || "");
  const [openFilter, setOpenFilter] = useState<string | null>(null);

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
  const cleanCategories = Array.from(
    new Map(
      categories
        .filter((category: any) => {
          const name = String(category?.name || "").trim();
          return name.length > 1 && !/\d/.test(name) && !name.startsWith("#");
        })
        .map((category: any) => [String(category.name).trim().toLowerCase(), category]),
    ).values(),
  );
  return (
    <div className="listing-filter-hero border-b border-[#dbe8f7] bg-[#eff7ff] text-[#102e67]">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="mb-6 max-w-4xl">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Search openings
          </p>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-[#102e67] md:text-5xl">
            {title ||
              (selectedCategoryName ? (
                `${selectedCategoryName} Jobs`
              ) : (
                <>
                  Find verified job leads with <span className="text-primary">kamkhoj</span>
                </>
              ))}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#617493]">
            Filter by title, company, category, location, deadline, and work arrangement. Open the
            original source before applying to confirm salary, eligibility, and instructions.
          </p>
        </div>

        <div className="listing-search-box space-y-4 rounded-2xl border border-[#d6e5f7] bg-white p-3 shadow-sm md:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-12 rounded-xl border-[#d6e5f7] bg-white pl-12 pr-4 text-base font-semibold text-[#102e67] placeholder:text-[#91a1ba] focus:border-primary focus:ring-primary"
                />
              </form>

              <div className="flex w-full md:w-auto">
                <Button
                  onClick={() => updateParams({ search: searchValue || null })}
                  className="h-12 rounded-xl bg-primary px-6 font-black text-white shadow-sm hover:bg-accent flex-1 md:flex-none"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="dark-panel-grid">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <FilterSelect
                  id="category"
                  label="Category"
                  value={selectedCategory || ""}
                  open={openFilter === "category"}
                  onToggle={() =>
                    setOpenFilter((current) => (current === "category" ? null : "category"))
                  }
                  onChange={(value) => updateParams({ category: value || null })}
                  options={[
                    { value: "", label: "All categories" },
                    ...cleanCategories.map((category: any) => ({
                      value: category.id,
                      label: category.name,
                    })),
                  ]}
                />
                <FilterSelect
                  id="location"
                  label="Location"
                  value={selectedLocation || ""}
                  open={openFilter === "location"}
                  onToggle={() =>
                    setOpenFilter((current) => (current === "location" ? null : "location"))
                  }
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
                  id="date-posted"
                  label="Date posted"
                  value={selectedUrgency || ""}
                  open={openFilter === "date-posted"}
                  onToggle={() =>
                    setOpenFilter((current) => (current === "date-posted" ? null : "date-posted"))
                  }
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
                  id="work-type"
                  label="Work type"
                  value={selectedJobType || ""}
                  open={openFilter === "work-type"}
                  onToggle={() =>
                    setOpenFilter((current) => (current === "work-type" ? null : "work-type"))
                  }
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
                  onClick={() => {
                    setSearchValue("");
                    router.push(basePath);
                  }}
                  className="rounded-full border border-[#d6e5f7] bg-transparent px-5 font-black text-[#617493] hover:border-primary hover:bg-[#eff7ff] hover:text-primary"
                >
                  Clear all
                </Button>
              </div>
            </div>

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

          {(selectedCategory ||
            selectedJobType ||
            selectedLocation ||
            selectedUrgency ||
            paramsSnapshot.get("search")) && (
            <div className="flex flex-wrap items-center gap-2 border-t border-[#d6e5f7] pt-3">
              <span className="mr-1 text-sm font-bold text-[#617493]">Active filters:</span>
              {selectedCategory && (
                <Badge className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]">
                  {selectedCategoryName}
                  <button
                    onClick={() => removeFilter("category")}
                    className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedJobType && (
                <Badge className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]">
                  {selectedJobType}
                  <button
                    onClick={() => removeFilter("jobType")}
                    className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedLocation && (
                <Badge className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]">
                  {selectedLocation}
                  <button
                    onClick={() => removeFilter("location")}
                    className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedUrgency && (
                <Badge className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]">
                  {selectedUrgency}
                  <button
                    onClick={() => removeFilter("urgency")}
                    className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {paramsSnapshot.get("search") && (
                <Badge className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]">
                  {paramsSnapshot.get("search")}
                  <button
                    onClick={() => removeFilter("search")}
                    className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              <Button
                onClick={() => router.push(basePath)}
                className="border-0 bg-transparent text-sm font-bold text-[#617493] hover:bg-[#eff7ff] hover:text-primary"
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
  id,
  label,
  value,
  open,
  onToggle,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const filteredOptions = options.filter(
    (option) => option.value === "" || !/\d/.test(option.label),
  );
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#617493]">
        {label}
      </span>
      <div className="relative">
        <button
          type="button"
          id={`${id}-filter`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={onToggle}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#d6e5f7] bg-white px-4 py-2 text-left text-sm font-bold text-[#102e67] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <span className="truncate">
            {filteredOptions.find((option) => option.value === value)?.label ||
              filteredOptions[0]?.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#7183a3] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute left-0 top-[calc(100%+6px)] z-[70] max-h-60 w-full overflow-y-auto rounded-xl border border-[#d6e5f7] bg-white p-1 shadow-xl shadow-[#1f4e8c]/10"
          >
            {filteredOptions.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                key={`${label}-${option.value || "all"}`}
                onClick={() => {
                  onChange(option.value);
                  onToggle();
                }}
                className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors ${option.value === value ? "bg-blue-50 font-bold text-primary" : "text-[#284b7d] hover:bg-blue-50 hover:text-primary"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}

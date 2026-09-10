"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LinkedInJobsFilteringProps {
  companies: Array<{ value: string; count?: number }>;
  places: Array<{ value: string; count?: number }>;
}

export function LinkedInJobsFiltering({ companies, places }: LinkedInJobsFilteringProps) {
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
    <div className="listing-filter-hero border-b border-[#dbe8f7] bg-[#eff7ff] text-[#102e67]">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            LinkedIn sourced
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-[#102e67] leading-tight">
            LinkedIn jobs from public leads
          </h1>
          <p className="text-[#617493] mt-3 max-w-2xl">
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
              className="h-12 rounded-xl border-[#d6e5f7] bg-white pl-12 pr-4 text-base text-[#102e67] placeholder:text-[#91a1ba] focus:border-primary focus:ring-primary"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-3 mb-4">
          <FilterSelect
            id="company"
            label="Company"
            value={selectedCompany || ""}
            open={openFilter === "company"}
            onToggle={() => setOpenFilter((current) => (current === "company" ? null : "company"))}
            onChange={(value) => updateParams({ company: value || null })}
            options={[
              { value: "", label: "All Companies" },
              ...companies
                .filter((item) => item.value)
                .map((item) => ({
                  value: item.value,
                  label: `${item.value} (${item.count ?? 0})`,
                })),
            ]}
          />

          <FilterSelect
            id="location"
            label="Location"
            value={selectedPlace || ""}
            open={openFilter === "location"}
            onToggle={() =>
              setOpenFilter((current) => (current === "location" ? null : "location"))
            }
            onChange={(value) => updateParams({ place: value || null })}
            options={[
              { value: "", label: "All Locations" },
              ...places
                .filter((item) => item.value)
                .map((item) => ({
                  value: item.value,
                  label: `${item.value} (${item.count ?? 0})`,
                })),
            ]}
          />

          <FilterSelect
            id="date-posted"
            label="Date posted"
            value={selectedDatePosted || ""}
            open={openFilter === "date-posted"}
            onToggle={() =>
              setOpenFilter((current) => (current === "date-posted" ? null : "date-posted"))
            }
            onChange={(value) => updateParams({ datePosted: value || null })}
            options={[
              { value: "", label: "Any time" },
              { value: "today", label: "Today" },
              { value: "3days", label: "Last 3 days" },
              { value: "7days", label: "Last 7 days" },
              { value: "30days", label: "Last 30 days" },
            ]}
          />

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
              className="h-10 rounded-full border border-[#d6e5f7] bg-transparent text-[#617493] hover:border-primary hover:bg-[#eff7ff] hover:text-primary"
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {(selectedCompany ||
          selectedPlace ||
          selectedDatePosted ||
          paramsSnapshot.get("search")) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[#d6e5f7] pt-3">
            <span className="mr-1 text-sm font-medium text-[#617493]">Active filters:</span>
            {selectedCompany && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]"
              >
                Company: {selectedCompany}
                <button
                  onClick={() => removeFilter("company")}
                  className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {selectedPlace && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]"
              >
                Location: {selectedPlace}
                <button
                  onClick={() => removeFilter("place")}
                  className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {selectedDatePosted && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]"
              >
                Date: {selectedDatePosted}
                <button
                  onClick={() => removeFilter("datePosted")}
                  className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            )}
            {paramsSnapshot.get("search") && (
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full border border-[#b9d7ff] bg-[#eff7ff] px-3 py-1.5 text-[#1769e8] hover:border-[#8bbcff] hover:bg-[#dbeafe] hover:text-[#1255bc]"
              >
                {paramsSnapshot.get("search")}
                <button
                  onClick={() => removeFilter("search")}
                  className="ml-0.5 text-[#1769e8] transition-colors hover:text-[#1255bc]"
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
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <div className="relative">
        <button
          type="button"
          id={`${id}-filter`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={onToggle}
          className="flex h-11 w-[200px] max-w-full items-center justify-between rounded-xl border border-[#d6e5f7] bg-white px-4 py-2 text-left text-sm font-bold text-[#102e67] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <span className="truncate">
            {options.find((option) => option.value === value)?.label || options[0]?.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#7183a3] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute left-0 top-[calc(100%+6px)] z-[70] max-h-60 w-[305px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-[#d6e5f7] bg-white p-1 shadow-xl shadow-[#1f4e8c]/10"
          >
            {options.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                key={`${id}-${option.value || "all"}`}
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

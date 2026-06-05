"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HomeSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState<"job" | "internship">("job");

  const handleSearch = () => {
    const basePath = jobType === "job" ? "/jobs" : "/internships";
    const searchParam = searchQuery.trim()
      ? `?search=${encodeURIComponent(searchQuery.trim())}`
      : "";
    router.push(`${basePath}${searchParam}`);
  };

  return (
    <div className="mb-4 rounded-full border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="grid gap-2 md:grid-cols-[170px_1fr_56px]">
        <div className="relative">
        <select
          value={jobType}
          onChange={(e) =>
            setJobType(e.target.value as "job" | "internship")
          }
          className="h-12 w-full appearance-none rounded-full border border-white/10 bg-zinc-950/70 px-4 py-3 pr-9 text-sm font-black text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="job">All Jobs</option>
          <option value="internship">All Internships</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
      </div>

      <div>
        <Input
          type="text"
          placeholder="Search by job title, company, skill, or city"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="h-12 border-0 bg-transparent px-4 text-base font-semibold text-white shadow-none placeholder:text-zinc-400 focus-visible:ring-0"
        />
      </div>

      <Button
        onClick={handleSearch}
        className="flex h-12 w-full items-center justify-center rounded-full bg-primary p-0 text-zinc-950 shadow-sm transition-colors hover:bg-white md:w-14"
        aria-label="Search jobs"
      >
        <Search className="w-5 h-5" />
      </Button>
      </div>
    </div>
  );
}

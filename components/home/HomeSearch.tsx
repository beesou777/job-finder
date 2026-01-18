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
    <div className="bg-white rounded-full shadow-lg p-2 mb-6 flex items-center gap-2">
      {/* Job Type Select Toggle - Left */}
      <div className="relative">
        <select
          value={jobType}
          onChange={(e) =>
            setJobType(e.target.value as "job" | "internship")
          }
          className="appearance-none bg-[#0A66C2]/10 border border-white rounded-full px-4 py-3 pr-8 h-12 text-sm font-medium text-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] cursor-pointer min-w-[140px]"
        >
          <option value="job">All Jobs</option>
          <option value="internship">All Internships</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#0A66C2] w-4 h-4 pointer-events-none" />
      </div>

      {/* Search Input - Center */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Enter the title, keywords or phrase"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="h-12 text-sm border-0 focus-visible:ring-0 shadow-none pl-4"
        />
      </div>

      {/* Search Button - Right */}
      <Button
        onClick={handleSearch}
        className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
      >
        <Search className="w-5 h-5" />
      </Button>
    </div>
  );
}

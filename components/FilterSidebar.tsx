"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; jobCount?: number }>;
  jobTypes?: Array<{ value: string; label: string; count: number }>;
  locations?: Array<{ value: string; label: string; count: number }>;
  selectedCategory?: string | null;
  selectedJobType?: string | null;
  selectedLocation?: string | null;
  selectedUrgency?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
  onJobTypeChange?: (jobType: string | null) => void;
  onLocationChange?: (location: string | null) => void;
  onUrgencyChange?: (urgency: string | null) => void;
}

export function FilterSidebar({
  categories,
  jobTypes = [],
  locations = [],
  selectedCategory,
  selectedJobType,
  selectedLocation,
  selectedUrgency,
  onCategoryChange,
  onJobTypeChange,
  onLocationChange,
  onUrgencyChange,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    selectedCategory,
    selectedJobType,
    selectedLocation,
    selectedUrgency,
  ].filter(Boolean).length;

  const handleCategoryClick = (categoryId: string | null) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const handleJobTypeClick = (jobType: string | null) => {
    if (onJobTypeChange) {
      onJobTypeChange(jobType);
    }
  };

  const handleLocationClick = (location: string | null) => {
    if (onLocationChange) {
      onLocationChange(location);
    }
  };

  const handleUrgencyClick = (urgency: string | null) => {
    if (onUrgencyChange) {
      onUrgencyChange(urgency);
    }
  };

  const handleClearAll = () => {
    if (onCategoryChange) onCategoryChange(null);
    if (onJobTypeChange) onJobTypeChange(null);
    if (onLocationChange) onLocationChange(null);
    if (onUrgencyChange) onUrgencyChange(null);
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  // Urgency options based on expiresAt
  const urgencyOptions = [
    { value: "today", label: "Today", description: "Jobs expiring today" },
    { value: "3days", label: "Last 3 days", description: "Jobs expiring within 3 days" },
    { value: "7days", label: "Last 7 days", description: "Jobs expiring within 7 days" },
    { value: "30days", label: "Last 30 days", description: "Jobs expiring within 30 days" },
  ];

  return (
    <>
      {/* Filter Button */}
      <Button
        variant="outline"
        className="gap-2 rounded-full border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="h-4 w-4" />
        All filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter Overlay/Modal - Dice.com style */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#111113] text-zinc-100 shadow-2xl overflow-y-auto flex flex-col border-l border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111113] sticky top-0 z-10">
              <h3 className="text-lg font-black">Filter Results</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <FilterContent
                categories={categories}
                jobTypes={jobTypes}
                locations={locations}
                urgencyOptions={urgencyOptions}
                selectedCategory={selectedCategory}
                selectedJobType={selectedJobType}
                selectedLocation={selectedLocation}
                selectedUrgency={selectedUrgency}
                onCategoryClick={handleCategoryClick}
                onJobTypeClick={handleJobTypeClick}
                onLocationClick={handleLocationClick}
                onUrgencyClick={handleUrgencyClick}
              />
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-[#111113] sticky bottom-0 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={handleClearAll}
              >
                Clear filters
              </Button>
              <Button
                className="flex-1 rounded-full bg-primary text-zinc-950 hover:bg-white font-black"
                onClick={handleApply}
              >
                Apply filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterContent({
  categories,
  jobTypes,
  locations,
  urgencyOptions,
  selectedCategory,
  selectedJobType,
  selectedLocation,
  selectedUrgency,
  onCategoryClick,
  onJobTypeClick,
  onLocationClick,
  onUrgencyClick,
}: {
  categories: Array<{ id: string; name: string; jobCount?: number }>;
  jobTypes: Array<{ value: string; label: string; count: number }>;
  locations: Array<{ value: string; label: string; count: number }>;
  urgencyOptions: Array<{ value: string; label: string; description: string }>;
  selectedCategory?: string | null;
  selectedJobType?: string | null;
  selectedLocation?: string | null;
  selectedUrgency?: string | null;
  onCategoryClick: (categoryId: string | null) => void;
  onJobTypeClick: (jobType: string | null) => void;
  onLocationClick: (location: string | null) => void;
  onUrgencyClick: (urgency: string | null) => void;
}) {
  const [openCategory, setOpenCategory] = useState(true);
  const [openJobType, setOpenJobType] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openUrgency, setOpenUrgency] = useState(false);

  return (
    <div className="space-y-6">
      {/* Categories Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => setOpenCategory(!openCategory)}
          className="flex items-center justify-between w-full text-left font-semibold mb-3 text-sm"
        >
          <span>Categories</span>
          {openCategory ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {openCategory && (
          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            <button
              onClick={() => onCategoryClick(null)}
              className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                !selectedCategory 
                  ? "bg-blue-50 text-blue-700 font-medium" 
                  : "hover:bg-white/5"
              }`}
            >
              <span>All Categories</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                  selectedCategory === category.id 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "hover:bg-white/5"
                }`}
              >
                <span className="truncate">{category.name}</span>
                {category.jobCount !== undefined && (
                  <Badge variant="secondary" className="ml-2 text-xs shrink-0">
                    {category.jobCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posted Date / Urgency Filter */}
      <div className="border-b pb-4">
        <button
          onClick={() => setOpenUrgency(!openUrgency)}
          className="flex items-center justify-between w-full text-left font-semibold mb-3 text-sm"
        >
          <span>Posted date</span>
          {openUrgency ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {openUrgency && (
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 mb-2">
              This is the date the job was posted by a recruiter or employer. Select one.
            </p>
            <div className="space-y-1">
              <button
                onClick={() => onUrgencyClick(null)}
                className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                  !selectedUrgency 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "hover:bg-white/5"
                }`}
              >
                <span>No preference</span>
              </button>
              {urgencyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUrgencyClick(option.value)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                    selectedUrgency === option.value 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Employment Type / Work Settings Filter */}
      {jobTypes.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => setOpenJobType(!openJobType)}
            className="flex items-center justify-between w-full text-left font-semibold mb-3 text-sm"
          >
            <span>Employment type</span>
            {openJobType ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {openJobType && (
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 mb-2">
                Tell us the type of work you're looking for. You can select multiple options.
              </p>
              <div className="space-y-1 max-h-[280px] overflow-y-auto">
                <button
                  onClick={() => onJobTypeClick(null)}
                  className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                    !selectedJobType 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <span>All Types</span>
                </button>
                {jobTypes.map((jobType) => (
                  <button
                    key={jobType.value}
                    onClick={() => onJobTypeClick(jobType.value)}
                    className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                      selectedJobType === jobType.value 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="truncate">{jobType.label}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs shrink-0">
                      {jobType.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Locations Filter */}
      {locations.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => setOpenLocation(!openLocation)}
            className="flex items-center justify-between w-full text-left font-semibold mb-3 text-sm"
          >
            <span>Locations</span>
            {openLocation ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {openLocation && (
            <div className="space-y-1 max-h-[280px] overflow-y-auto">
              <button
                onClick={() => onLocationClick(null)}
                className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                  !selectedLocation 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "hover:bg-white/5"
                }`}
              >
                <span>All Locations</span>
              </button>
              {locations.map((location) => (
                <button
                  key={location.value}
                  onClick={() => onLocationClick(location.value)}
                  className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                    selectedLocation === location.value 
                      ? "bg-blue-50 text-blue-700 font-medium" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{location.label}</span>
                  <Badge variant="secondary" className="ml-2 text-xs shrink-0">
                    {location.count}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

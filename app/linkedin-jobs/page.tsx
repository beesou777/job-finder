"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, X, MapPin, Building2, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const ITEMS_PER_PAGE = 20;

interface LinkedInJob {
  id: number;
  job_id: string;
  title: string;
  company: string | null;
  company_link: string | null;
  place: string | null;
  job_date: Date | null;
  job_link: string | null;
  apply_link: string | null;
  description: string | null;
  insights: Record<string, any> | null;
  created_at: Date;
}

interface FilterOption {
  value: string;
  count: number;
}

function LinkedInJobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<LinkedInJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<LinkedInJob | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(false);
  const [companies, setCompanies] = useState<FilterOption[]>([]);
  const [places, setPlaces] = useState<FilterOption[]>([]);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const currentPage = parseInt(searchParams.get("page") || "1");

  const selectedCompany = searchParams.get("company") || "";
  const selectedPlace = searchParams.get("place") || "";
  const selectedDatePosted = searchParams.get("datePosted") || "";
  const selectedJobId = searchParams.get("jobId");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get("search"),
    searchParams.get("company"),
    searchParams.get("place"),
    searchParams.get("datePosted"),
    searchParams.get("page"),
  ]);

  useEffect(() => {
    if (selectedJobId) {
      fetchJobDetails(parseInt(selectedJobId));
    } else if (jobs.length > 0 && !selectedJob) {
      // Auto-select first job if none selected
      setSelectedJob(jobs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId, jobs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const search = searchParams.get("search") || "";
      const company = searchParams.get("company") || "";
      const place = searchParams.get("place") || "";
      const datePosted = searchParams.get("datePosted") || "";
      const page = parseInt(searchParams.get("page") || "1");

      const params = new URLSearchParams();
      params.append("limit", String(ITEMS_PER_PAGE));
      params.append("offset", String((page - 1) * ITEMS_PER_PAGE));
      if (search) params.append("search", search);
      if (company) params.append("company", company);
      if (place) params.append("place", place);
      if (datePosted) params.append("datePosted", datePosted);

      const response = await fetch(`/api/linkedin-jobs?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobs(data.data.jobs || []);
          setTotal(data.total || 0);
          setCompanies(data.data.filters?.companies || []);
          setPlaces(data.data.filters?.places || []);
          
          // If no job is selected and we have jobs, select the first one
          if (!selectedJobId && data.data.jobs && data.data.jobs.length > 0) {
            const firstJob = data.data.jobs[0];
            setSelectedJob(firstJob);
            const urlParams = new URLSearchParams(searchParams.toString());
            urlParams.set("jobId", String(firstJob.id));
            router.replace(`/linkedin-jobs?${urlParams.toString()}`, { scroll: false });
          }
        }
      } else {
        console.error("Failed to fetch LinkedIn jobs:", response.status);
      }
    } catch (error) {
      console.error("Error fetching LinkedIn jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (jobId: number) => {
    try {
      setJobLoading(true);
      const response = await fetch(`/api/linkedin-jobs/${jobId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedJob(data.data);
        }
      } else {
        console.error("Failed to fetch job details:", response.status);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setJobLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    params.delete("page");
    params.delete("jobId");
    router.push(`/linkedin-jobs?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/linkedin-jobs?${params.toString()}`);
  };

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    params.delete("jobId");
    router.push(`/linkedin-jobs?${params.toString()}`);
  };

  const removeFilter = (filterType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterType);
    params.delete("page");
    params.delete("jobId");
    router.push(`/linkedin-jobs?${params.toString()}`);
  };

  const handleJobClick = (job: LinkedInJob) => {
    setSelectedJob(job);
    const params = new URLSearchParams(searchParams.toString());
    params.set("jobId", String(job.id));
    router.replace(`/linkedin-jobs?${params.toString()}`, { scroll: false });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "N/A";
    const now = new Date();
    const jobDate = new Date(date);
    const diffInMs = now.getTime() - jobDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? "Posted just now" : `Posted ${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `Posted ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffInDays < 7) {
      return `Posted ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    } else if (diffInWeeks < 4) {
      return `Posted ${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
    } else if (diffInMonths < 12) {
      return `Posted ${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
    } else {
      return formatDate(date);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              LinkedIn Jobs - Find Your <span className="text-[#0A66C2]">Next Opportunity</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Discover {total.toLocaleString()} LinkedIn job opportunities from top companies in Nepal
            </p>
          </div>

          {/* Search Bar */}
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

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select
              value={selectedCompany || "all"}
              onValueChange={(value) => updateFilter("company", value === "all" ? null : value)}
            >
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies
                  .filter((item) => item.value && item.value.trim() !== "")
                  .map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedPlace || "all"}
              onValueChange={(value) => updateFilter("place", value === "all" ? null : value)}
            >
              <SelectTrigger className="h-10 w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {places
                  .filter((item) => item.value && item.value.trim() !== "")
                  .map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.value} ({item.count})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDatePosted || "all"}
              onValueChange={(value) => updateFilter("datePosted", value === "all" ? null : value)}
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

          {/* Active Filters */}
          {(selectedCompany || selectedPlace || selectedDatePosted || searchParams.get("search")) && (
            <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium mr-1">Active filters:</span>
              {selectedCompany && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  Company: {selectedCompany}
                  <button
                    onClick={() => removeFilter("company")}
                    className="ml-0.5 hover:text-blue-900 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedPlace && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  Location: {selectedPlace}
                  <button
                    onClick={() => removeFilter("place")}
                    className="ml-0.5 hover:text-blue-900 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedDatePosted && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  Date: {
                    selectedDatePosted === "today" ? "Today" :
                    selectedDatePosted === "3days" ? "Last 3 days" :
                    selectedDatePosted === "7days" ? "Last 7 days" :
                    selectedDatePosted === "30days" ? "Last 30 days" :
                    selectedDatePosted
                  }
                  <button
                    onClick={() => removeFilter("datePosted")}
                    className="ml-0.5 hover:text-blue-900 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {searchParams.get("search") && (
                <Badge className="gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
                  {searchParams.get("search")}
                  <button
                    onClick={() => removeFilter("search")}
                    className="ml-0.5 hover:text-blue-900 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Job List */}
          <div className="w-full md:w-1/3 lg:w-2/5">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing {jobs.length} of {total.toLocaleString()} Jobs
                </p>
              </div>

              {loading ? (
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="border-2 border-gray-200">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <Card className="border-2 border-gray-200">
                  <CardContent className="pt-6 text-center py-8">
                    <p className="text-gray-600">No jobs found matching your criteria.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                    {jobs.map((job) => (
                      <Card
                        key={job.id}
                        className={`border-2 cursor-pointer transition-all hover:shadow-md ${
                          selectedJob?.id === job.id
                            ? "border-[#0A66C2] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleJobClick(job)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-base text-gray-900 line-clamp-2 flex-1">
                              {job.title}
                            </h3>
                          </div>
                          {job.company && (
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Building2 className="h-4 w-4 mr-1" />
                              <span className="truncate">{job.company}</span>
                            </div>
                          )}
                          {job.place && (
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="truncate">{job.place}</span>
                            </div>
                          )}
                          {job.job_date && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatRelativeTime(job.job_date)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={total}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </>
            )}
            </div>
          </div>

          {/* Right Side - Job Details */}
          <div className="w-full md:w-2/3 lg:w-3/5">
            {jobLoading ? (
              <Card className="border-2 border-gray-200">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ) : selectedJob ? (
              <Card className="border-2 border-gray-200 md:sticky md:top-4">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                      {selectedJob.company && (
                        <div className="flex items-center text-lg text-gray-700 mb-2">
                          <Building2 className="h-5 w-5 mr-2" />
                          {selectedJob.company_link ? (
                            <a
                              href={selectedJob.company_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0A66C2] hover:underline"
                            >
                              {selectedJob.company}
                            </a>
                          ) : (
                            <span>{selectedJob.company}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 ml-4 flex-shrink-0">
                      {selectedJob.job_link && (
                        <Button
                          className="border-2 border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white bg-white font-semibold transition-colors"
                          size="sm"
                          asChild
                        >
                          <a
                            href={selectedJob.job_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            View on LinkedIn
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      )}
                      {selectedJob.apply_link && (
                        <Button
                          className="bg-[#004182] hover:bg-[#003366] text-white font-semibold shadow-sm"
                          size="sm"
                          asChild
                        >
                          <a
                            href={selectedJob.apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            Apply
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                    {selectedJob.place && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{selectedJob.place}</span>
                      </div>
                    )}
                    {selectedJob.job_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatRelativeTime(selectedJob.job_date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                      {selectedJob.description ? (
                        <div
                          className="text-gray-700 leading-relaxed space-y-2"
                          style={{ lineHeight: '1.7' }}
                          dangerouslySetInnerHTML={{
                            __html: selectedJob.description
                              .split(/\n{2,}/) // Split on 2+ newlines
                              .map(para => para.trim().replace(/\n/g, '<br />'))
                              .filter(para => para.length > 0)
                              .map(para => `<p style="margin-bottom: 0.5rem;">${para}</p>`)
                              .join(''),
                          }}
                        />
                      ) : (
                        <p className="text-gray-500 italic">No description available.</p>
                      )}
                    </div>

                    {selectedJob.insights && Object.keys(selectedJob.insights).length > 0 && (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Insights</h3>
                        <div className="space-y-2">
                          {Object.entries(selectedJob.insights).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium text-gray-700 w-32">{key}:</span>
                              <span className="text-gray-600">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-gray-200">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-gray-600">Select a job to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LinkedInJobsPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <LinkedInJobsPageContent />
      </Suspense>
    </>
  );
}


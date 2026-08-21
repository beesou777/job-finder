"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Building2,
  TrendingUp,
  Calendar,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  Download,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface OpportunityScore {
  company: string;
  normalizedName: string;
  domain: string | null;
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  reasons: string[];
  linkedInJobCount: number;
  lastJobDate: string | Date | null;
  hasRecentJobs: boolean;
  isNepalLocation: boolean;
  status: "ALREADY_ON_PLATFORM" | "NOT_ON_PLATFORM";
  approachability?: {
    isKnownCompany: boolean;
    hasContactInfo: boolean;
    email?: string | null;
    phoneNumber?: string | null;
    website?: string | null;
    source?: string;
  };
  linkedInJobs?: Array<{
    id: number;
    job_id: string;
    title: string;
    job_date: string | Date | null;
    place: string | null;
    job_link: string | null;
  }>;
}

interface OpportunitiesResponse {
  success: boolean;
  data: OpportunityScore[];
  total: number;
  meta: {
    notOnPlatform: number;
    alreadyOnPlatform: number;
    veryHigh: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function OpportunitiesView() {
  const [opportunities, setOpportunities] = useState<OpportunityScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<OpportunitiesResponse["meta"] | null>(null);
  const [filter, setFilter] = useState({
    status: "" as "NOT_ON_PLATFORM" | "ALREADY_ON_PLATFORM" | "",
    level: "" as "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" | "",
    search: "",
    minScore: "",
  });
  const [sortBy, setSortBy] = useState<"score" | "jobs" | "date">("score");
  const [selectedCompany, setSelectedCompany] = useState<OpportunityScore | null>(null);

  const [rawOpportunities, setRawOpportunities] = useState<OpportunityScore[]>([]);

  const fetchOpportunities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.level) params.append("level", filter.level);
      if (filter.minScore) params.append("minScore", filter.minScore);
      params.append("limit", "200");

      const res = await fetch(`/api/admin/opportunities?${params.toString()}`);
      const data: OpportunitiesResponse = await res.json();

      if (data.success) {
        setRawOpportunities(data.data);
        setMeta(data.meta);
      } else {
        setError("Failed to fetch opportunities");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch opportunities");
      console.error("Error fetching opportunities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.status, filter.level, filter.minScore]);

  // Re-sort and filter when sortBy or search changes
  useEffect(() => {
    let filtered = [...rawOpportunities];

    // Apply client-side search filter
    if (filter.search) {
      filtered = filtered.filter((opp) =>
        opp.company.toLowerCase().includes(filter.search.toLowerCase()),
      );
    }

    // Sort
    filtered = sortOpportunities(filtered, sortBy);

    setOpportunities(filtered);
  }, [sortBy, filter.search, rawOpportunities]);

  const sortOpportunities = (
    opps: OpportunityScore[],
    sort: "score" | "jobs" | "date",
  ): OpportunityScore[] => {
    const sorted = [...opps];
    switch (sort) {
      case "score":
        return sorted.sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === "NOT_ON_PLATFORM" ? -1 : 1;
          }
          return b.score - a.score;
        });
      case "jobs":
        return sorted.sort((a, b) => b.linkedInJobCount - a.linkedInJobCount);
      case "date":
        return sorted.sort((a, b) => {
          if (!a.lastJobDate && !b.lastJobDate) return 0;
          if (!a.lastJobDate) return 1;
          if (!b.lastJobDate) return -1;

          // Handle both Date objects and date strings
          const dateA =
            a.lastJobDate instanceof Date
              ? a.lastJobDate.getTime()
              : new Date(a.lastJobDate as string).getTime();
          const dateB =
            b.lastJobDate instanceof Date
              ? b.lastJobDate.getTime()
              : new Date(b.lastJobDate as string).getTime();

          // Handle invalid dates
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;

          return dateB - dateA; // Most recent first
        });
      default:
        return sorted;
    }
  };

  const getLevelColor = (level: OpportunityScore["level"]) => {
    switch (level) {
      case "VERY_HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "LOW":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusBadge = (status: OpportunityScore["status"]) => {
    if (status === "NOT_ON_PLATFORM") {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Target className="w-3 h-3 mr-1" />
          Pitch Now
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Already Using Platform
      </Badge>
    );
  };

  const generatePitchMessage = (opp: OpportunityScore): string => {
    return `Hi ${opp.company} team,

We noticed you're actively hiring on LinkedIn (${opp.linkedInJobCount} active job${opp.linkedInJobCount > 1 ? "s" : ""}) but not reaching candidates through local Nepal-focused platforms like ours.

Our platform reaches ${opp.isNepalLocation ? "thousands of" : ""} qualified candidates in Nepal. Would you be interested in posting your jobs with us?

Best regards,
Job Finder Team`;
  };

  const exportToCSV = () => {
    const csv = [
      ["Company", "Score", "Level", "Status", "LinkedIn Jobs", "Last Job Date", "Reasons"].join(
        ",",
      ),
      ...opportunities.map((opp) => {
        let lastJobDateStr = "";
        if (opp.lastJobDate) {
          const date =
            opp.lastJobDate instanceof Date ? opp.lastJobDate : new Date(opp.lastJobDate as string);
          lastJobDateStr = !isNaN(date.getTime()) ? date.toISOString() : "";
        }
        return [
          `"${opp.company}"`,
          opp.score,
          opp.level,
          opp.status,
          opp.linkedInJobCount,
          lastJobDateStr,
          `"${opp.reasons.join("; ")}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opportunities-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Companies hiring on LinkedIn but not on our platform
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {meta && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approachable Companies</CardDescription>
              <CardTitle className="text-2xl text-green-600">{meta.notOnPlatform}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Very High Priority</CardDescription>
              <CardTitle className="text-2xl text-red-600">{meta.veryHigh}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>High Priority</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{meta.high}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Already on Platform</CardDescription>
              <CardTitle className="text-2xl">{meta.alreadyOnPlatform}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Company</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              >
                <option value="">All</option>
                <option value="NOT_ON_PLATFORM">Not on Platform</option>
                <option value="ALREADY_ON_PLATFORM">Already on Platform</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filter.level}
                onChange={(e) => setFilter({ ...filter, level: e.target.value as any })}
              >
                <option value="">All</option>
                <option value="VERY_HIGH">Very High</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Min Score</label>
              <Input
                type="number"
                placeholder="0"
                value={filter.minScore}
                onChange={(e) => setFilter({ ...filter, minScore: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy("score")}
              className={sortBy === "score" ? "bg-primary text-primary-foreground" : ""}
            >
              Sort by Score
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy("jobs")}
              className={sortBy === "jobs" ? "bg-primary text-primary-foreground" : ""}
            >
              Sort by Jobs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy("date")}
              className={sortBy === "date" ? "bg-primary text-primary-foreground" : ""}
            >
              Sort by Date
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunities ({opportunities.length})</CardTitle>
          <CardDescription>Companies ranked by opportunity score</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading opportunities...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No opportunities found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <Card
                  key={opp.company}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCompany(opp)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-semibold text-lg">{opp.company}</h3>
                          {getStatusBadge(opp.status)}
                          <Badge className={getLevelColor(opp.level)}>{opp.level}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <span>
                              Score: <strong>{opp.score}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {opp.linkedInJobCount} LinkedIn job
                              {opp.linkedInJobCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {opp.lastJobDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {new Date(opp.lastJobDate as string).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {opp.isNepalLocation && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>Nepal</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">
                            <strong>Reasons:</strong> {opp.reasons.join(" • ")}
                          </p>
                          {opp.approachability?.hasContactInfo && (
                            <p className="text-sm text-green-600 mt-1">
                              ✓ Contact info available (
                              {opp.approachability.email || opp.approachability.phoneNumber})
                            </p>
                          )}
                        </div>
                      </div>
                      {opp.status === "NOT_ON_PLATFORM" && (
                        <div className="ml-4 flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Pitch
                          </Button>
                          {opp.domain && (
                            <Button size="sm" variant="ghost" asChild>
                              <a
                                href={`https://${opp.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedCompany.company}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Opportunity Score</h4>
                <div className="flex items-center gap-4">
                  <Badge className={getLevelColor(selectedCompany.level)}>
                    {selectedCompany.level} ({selectedCompany.score} points)
                  </Badge>
                  {getStatusBadge(selectedCompany.status)}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Reasons</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedCompany.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">LinkedIn Activity</h4>
                <p className="text-sm mb-3">
                  {selectedCompany.linkedInJobCount} active job
                  {selectedCompany.linkedInJobCount !== 1 ? "s" : ""}
                  {selectedCompany.lastJobDate && (
                    <>
                      {" "}
                      • Last posted:{" "}
                      {new Date(selectedCompany.lastJobDate as string).toLocaleDateString()}
                    </>
                  )}
                  {selectedCompany.hasRecentJobs && (
                    <>
                      {" "}
                      • <span className="text-green-600">Posted in last 7 days</span>
                    </>
                  )}
                </p>
                {selectedCompany.linkedInJobs && selectedCompany.linkedInJobs.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <h5 className="font-medium text-sm">LinkedIn Jobs:</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedCompany.linkedInJobs.map((job) => (
                        <div key={job.id} className="border rounded-md p-2 text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium">{job.title}</p>
                              {job.place && (
                                <p className="text-muted-foreground text-xs mt-1">{job.place}</p>
                              )}
                              {job.job_date && (
                                <p className="text-muted-foreground text-xs">
                                  {new Date(job.job_date as string).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {job.job_link && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={job.job_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {(() => {
                // Prefer approachability website, then domain, but exclude LinkedIn URLs
                const website =
                  selectedCompany.approachability?.website ||
                  (selectedCompany.domain ? `https://${selectedCompany.domain}` : null);

                // Filter out LinkedIn company URLs
                if (
                  website &&
                  (website.includes("linkedin.com/company") ||
                    website.includes("linkedin.com/mycompany"))
                ) {
                  return null;
                }

                return website ? (
                  <div>
                    <h4 className="font-semibold mb-2">Website</h4>
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      {website}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : null;
              })()}
              {selectedCompany.approachability?.hasContactInfo && (
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    {selectedCompany.approachability.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${selectedCompany.approachability.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedCompany.approachability.email}
                        </a>
                      </div>
                    )}
                    {selectedCompany.approachability.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {selectedCompany.approachability.phoneNumber}
                        </span>
                      </div>
                    )}
                    {selectedCompany.approachability.source && (
                      <p className="text-xs text-muted-foreground">
                        Source: {selectedCompany.approachability.source}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {selectedCompany.status === "NOT_ON_PLATFORM" && (
                <div>
                  <h4 className="font-semibold mb-2">Suggested Pitch Message</h4>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {generatePitchMessage(selectedCompany)}
                    </pre>
                  </div>
                  <Button className="mt-2" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Copy Pitch
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

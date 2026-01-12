"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, Mail, Phone, ExternalLink, Download, Search, Target, Zap } from "lucide-react";

interface CompanyEnrichment {
  id?: string;
  companyId?: string;
  companyName: string;
  domain?: string;
  email?: string;
  phoneNumber?: string;
  website?: string;
  careerPageUrl?: string;
  intentScore?: number;
  intentLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  jobsLast7Days: number;
  jobsLast30Days: number;
  jobsCount?: number;
  uniqueJobCategories?: number;
  hasCareerPage?: boolean;
  keywordMatches?: string[];
  externalStatus?: string;
  matchConfidence?: number | string;
  matchedFrom?: string;
  isPitchTarget?: boolean;
  isNewLead?: boolean;
  salesNotes?: string;
  lastVerifiedAt?: string;
  updatedAt?: string;
  latestJobTitle?: string;
  latestJobUrl?: string;
}

export function CompanyEnrichmentView() {
  const [companies, setCompanies] = useState<CompanyEnrichment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    level: "" as "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" | "", // Show all by default
    minScore: "",
    hasContact: false,
    isPitchTarget: false,
    search: "", // Company name search
  });
  const [leaderboardType, setLeaderboardType] = useState<"intent" | "jobs7d" | "jobs30d" | "contacts">("intent");

  useEffect(() => {
    fetchCompanies();
  }, [filter, leaderboardType]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new endpoint that matches jobs with JSON data
      // Add cache-busting timestamp and no-cache headers
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/companies/enriched-from-jobs?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        let filteredData = data.data;

        // Apply filters
        if (filter.search) {
          filteredData = filteredData.filter((c: CompanyEnrichment) =>
            c.companyName.toLowerCase().includes(filter.search.toLowerCase())
          );
        }

        if (filter.hasContact) {
          filteredData = filteredData.filter(
            (c: CompanyEnrichment) => c.email || c.phoneNumber
          );
        }

        if (filter.minScore) {
          const minScoreNum = parseInt(filter.minScore);
          filteredData = filteredData.filter(
            (c: CompanyEnrichment) => (c.intentScore || 0) >= minScoreNum
          );
        }

        if (filter.isPitchTarget) {
          filteredData = filteredData.filter(
            (c: CompanyEnrichment) => c.isPitchTarget === true
          );
        }

        setCompanies(filteredData);
      } else {
        setError(data.error || "Failed to fetch companies");
      }
    } catch (err: any) {
      setError(err.message || "Error loading companies");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async (type: "intent" | "jobs7d" | "jobs30d" | "contacts") => {
    setIsLoading(true);
    setError(null); 
    try {
      // Add cache-busting timestamp and no-cache headers
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/companies/enriched-from-jobs?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await res.json();
      
      if (data.success) {
        let sortedData = [...data.data];
        
        // Sort based on leaderboard type
        switch (type) {
          case "jobs7d":
            sortedData.sort((a, b) => b.jobsLast7Days - a.jobsLast7Days);
            break;
          case "jobs30d":
            sortedData.sort((a, b) => b.jobsLast30Days - a.jobsLast30Days);
            break;
          case "contacts":
            sortedData = sortedData.filter((c) => c.email || c.phoneNumber);
            sortedData.sort((a, b) => (b.jobsCount || 0) - (a.jobsCount || 0));
            break;
          case "intent":
          default:
            // Sort by total jobs count as proxy for intent
            sortedData.sort((a, b) => (b.jobsCount || 0) - (a.jobsCount || 0));
            break;
        }
        
        setCompanies(sortedData.slice(0, 50));
        setLeaderboardType(type);
      } else {
        setError(data.error || "Failed to fetch leaderboard");
      }
    } catch (err: any) {
      setError(err.message || "Error loading leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: string, format: "csv" | "json" = "csv") => {
    try {
      const res = await fetch(`/api/companies/export?type=${type}&format=${format}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = format === "json" ? "json" : "csv";
      a.download = `companies-${type}-${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Error exporting: " + err.message);
    }
  };

  const getIntentLevelColor = (level: string) => {
    switch (level) {
      case "VERY_HIGH":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "LOW":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const stats = {
    total: companies.length,
    highIntent: companies.filter((c) => (c.jobsCount || 0) >= 3).length, // 3+ jobs considered high intent
    withContacts: companies.filter((c) => c.email || c.phoneNumber).length,
    pitchTargets: companies.filter((c) => c.isPitchTarget).length,
    avgScore: companies.length > 0
      ? Math.round(companies.reduce((sum, c) => sum + (c.jobsCount || 0), 0) / companies.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Enrichment & Hiring Intent</h1>
          <p className="text-muted-foreground mt-1">
            High-intent companies ready for sales outreach
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("contacts", "json")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("high-intent")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Companies</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Intent</CardDescription>
            <CardTitle className="text-2xl text-orange-600">{stats.highIntent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With Contacts</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.withContacts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.avgScore}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={leaderboardType === "intent" ? "default" : "ghost"}
          onClick={() => fetchLeaderboard("intent")}
          size="sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          High Intent
        </Button>
        <Button
          variant={leaderboardType === "jobs7d" ? "default" : "ghost"}
          onClick={() => fetchLeaderboard("jobs7d")}
          size="sm"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Jobs (7d)
        </Button>
        <Button
          variant={leaderboardType === "jobs30d" ? "default" : "ghost"}
          onClick={() => fetchLeaderboard("jobs30d")}
          size="sm"
        >
          Jobs (30d)
        </Button>
        <Button
          variant={leaderboardType === "contacts" ? "default" : "ghost"}
          onClick={() => fetchLeaderboard("contacts")}
          size="sm"
        >
          <Mail className="h-4 w-4 mr-2" />
          With Contacts
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Search Company Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by company name..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Intent Level</label>
              <select
                className="w-full p-2 border rounded"
                value={filter.level}
                onChange={(e) => setFilter({ ...filter, level: e.target.value as any })}
              >
                <option value="">All Levels</option>
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
            <div className="flex flex-col gap-2 justify-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.hasContact}
                  onChange={(e) => setFilter({ ...filter, hasContact: e.target.checked })}
                />
                <span className="text-sm font-medium">Has Contact Info</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.isPitchTarget}
                  onChange={(e) => setFilter({ ...filter, isPitchTarget: e.target.checked })}
                />
                <span className="text-sm font-medium">Pitch Targets</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading companies...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-500">Error: {error}</p>
            <Button onClick={fetchCompanies} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No companies found. Try adjusting filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.companyName || company.id || Math.random()} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-xl font-bold">{company.companyName}</h3>
                      {company.matchConfidence && (
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          Match: {company.matchConfidence}%
                        </Badge>
                      )}
                      {company.matchedFrom && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          From: {company.matchedFrom}
                        </Badge>
                      )}
                      <Badge variant="outline">Jobs: {company.jobsCount || 0}</Badge>
                      {company.intentScore && (
                        <Badge variant="outline">Score: {company.intentScore}</Badge>
                      )}
                      {company.isPitchTarget && (
                        <Badge variant="default" className="bg-blue-600">
                          <Target className="h-3 w-3 mr-1" />
                          Pitch Target
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        {company.domain && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Domain:</span>
                            <span className="text-muted-foreground">{company.domain}</span>
                          </div>
                        )}
                        {company.latestJobTitle && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Latest Job:</span>
                            {company.latestJobUrl ? (
                              <a
                                href={company.latestJobUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {company.latestJobTitle}
                              </a>
                            ) : (
                              <span className="text-muted-foreground">{company.latestJobTitle}</span>
                            )}
                          </div>
                        )}
                        {company.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <span className="text-muted-foreground font-medium">{company.phoneNumber}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <a 
                              href={`mailto:${company.email}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {company.email}
                            </a>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <a
                              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {company.website}
                            </a>
                          </div>
                        )}
                        {company.hasCareerPage && company.careerPageUrl && (
                          <a
                            href={company.careerPageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Career Page
                          </a>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Jobs (7d):</span>
                          <span className="text-muted-foreground">{company.jobsLast7Days}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Jobs (30d):</span>
                          <span className="text-muted-foreground">{company.jobsLast30Days}</span>
                        </div>
                        {company.uniqueJobCategories && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Categories:</span>
                            <span className="text-muted-foreground">{company.uniqueJobCategories}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


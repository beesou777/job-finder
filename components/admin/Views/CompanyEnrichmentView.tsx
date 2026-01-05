"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, Mail, Phone, ExternalLink, Download, Search, Target, Zap } from "lucide-react";

interface CompanyEnrichment {
  id: string;
  companyId: string;
  companyName: string;
  domain: string;
  email: string;
  phoneNumber: string;
  website: string;
  careerPageUrl: string;
  intentScore: number;
  intentLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  jobsLast7Days: number;
  jobsLast30Days: number;
  uniqueJobCategories: number;
  hasCareerPage: boolean;
  keywordMatches: string[];
  externalStatus: string;
  matchConfidence: string;
  isPitchTarget: boolean;
  isNewLead: boolean;
  salesNotes: string;
  lastVerifiedAt: string;
  updatedAt: string;
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
  });
  const [leaderboardType, setLeaderboardType] = useState<"intent" | "jobs7d" | "jobs30d" | "contacts">("intent");

  useEffect(() => {
    fetchCompanies();
  }, [filter, leaderboardType]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter.level) params.append("level", filter.level);
      if (filter.minScore) params.append("minScore", filter.minScore);
      if (filter.hasContact) params.append("hasContact", "true");
      if (filter.isPitchTarget) params.append("isPitchTarget", "true");
      params.append("limit", "50");
      params.append("sortBy", "intentScore");
      params.append("sortOrder", "DESC");

      const res = await fetch(`/api/companies/intent?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setCompanies(data.data);
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
      const res = await fetch(`/api/companies/leaderboard?type=${type}&limit=50`);
      const data = await res.json();
      
      if (data.success) {
        setCompanies(data.data);
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

  const handleExport = async (type: string) => {
    try {
      const res = await fetch(`/api/companies/export?type=${type}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `companies-${type}-${new Date().toISOString().split("T")[0]}.csv`;
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
    highIntent: companies.filter((c) => c.intentLevel === "HIGH" || c.intentLevel === "VERY_HIGH").length,
    withContacts: companies.filter((c) => c.email || c.phoneNumber).length,
    pitchTargets: companies.filter((c) => c.isPitchTarget).length,
    avgScore: companies.length > 0
      ? Math.round(companies.reduce((sum, c) => sum + c.intentScore, 0) / companies.length)
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.hasContact}
                  onChange={(e) => setFilter({ ...filter, hasContact: e.target.checked })}
                />
                <span className="text-sm font-medium">Has Contact Info</span>
              </label>
            </div>
            <div className="flex items-end">
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
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-xl font-bold">{company.companyName}</h3>
                      <Badge className={getIntentLevelColor(company.intentLevel)}>
                        {company.intentLevel.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">Score: {company.intentScore}</Badge>
                      {company.isPitchTarget && (
                        <Badge variant="default" className="bg-blue-600">
                          <Target className="h-3 w-3 mr-1" />
                          Pitch Target
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Domain:</span>
                          <span className="text-muted-foreground">{company.domain || "N/A"}</span>
                        </div>
                        {company.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{company.email}</span>
                          </div>
                        )}
                        {company.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{company.phoneNumber}</span>
                          </div>
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
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Categories:</span>
                          <span className="text-muted-foreground">{company.uniqueJobCategories}</span>
                        </div>
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


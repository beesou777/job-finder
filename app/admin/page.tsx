
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ExecutiveOverview } from "@/components/admin/Views/ExecutiveOverview";
import { SourcesView } from "@/components/admin/Views/SourcesView";
import { SeoView } from "@/components/admin/Views/SeoView";
import { DataQualityView } from "@/components/admin/Views/DataQualityView";
import { ReportsView } from "@/components/admin/Views/ReportsView";
import { PredictiveInsights } from "@/components/admin/Views/PredictiveInsights";
import { SettingsView } from "@/components/admin/Views/SettingsView";
import { NavigationPage } from "@/components/admin/Views/NavigationPage";
import { CompanyEnrichmentView } from "@/components/admin/Views/CompanyEnrichmentView";
import { Menu } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Data State
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [dateRange, setDateRange] = useState("30d");
  const [dashboardMode, setDashboardMode] = useState<"founder" | "ops">("founder");

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchAnalytics(dateRange);
    }
  }, []);

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      fetchAnalytics(dateRange);
    } else {
      alert("Incorrect password");
    }
  };

  const fetchAnalytics = async (range: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrape = async () => {
    setIsScraping(true);
    setScrapeResult(null);

    try {
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminPassword}`,
        },
      });

      const data = await res.json();
      setScrapeResult(data);
      
      if (data.success) {
        // Refresh analytics after scrape
        await fetchAnalytics(dateRange);
      }
    } catch (error: any) {
      setScrapeResult({ success: false, error: error.message });
    } finally {
      setIsScraping(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">Restricted area for foundation team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Access Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full bg-slate-900 text-white hover:bg-slate-800">
              Enter Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <AdminSidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isCollapsed={isSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 h-full">
        {/* Top Mobile Bar / Collapse Toggle */}
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                <Menu className="h-5 w-5" />
            </Button>
            <div className="md:hidden font-bold">JF Admin</div>
            
            {/* Mode Toggle */}
            <div className="hidden sm:flex items-center ml-4 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                <Button 
                    variant={dashboardMode === "founder" ? "secondary" : "ghost"} 
                    size="sm" 
                    className={`h-7 px-3 text-[10px] font-bold uppercase tracking-wider transition-all ${dashboardMode === "founder" ? "bg-white shadow-sm" : ""}`}
                    onClick={() => setDashboardMode("founder")}
                >
                    Founder Mode
                </Button>
                <Button 
                    variant={dashboardMode === "ops" ? "secondary" : "ghost"} 
                    size="sm" 
                    className={`h-7 px-3 text-[10px] font-bold uppercase tracking-wider transition-all ${dashboardMode === "ops" ? "bg-white shadow-sm" : ""}`}
                    onClick={() => setDashboardMode("ops")}
                >
                    Ops Mode
                </Button>
            </div>

            <div className="ml-auto">
                 <Button
                  variant="ghost"
                  onClick={() => {
                    sessionStorage.removeItem("admin_auth");
                    setIsAuthenticated(false);
                  }}
                >
                  Logout
                </Button>
            </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto pb-10">
                {activeView === "overview" && (
                    <ExecutiveOverview 
                        analyticsData={analyticsData}
                        isLoading={isLoading}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        fetchAnalytics={fetchAnalytics}
                        mode={dashboardMode}
                    />
                )}
                {activeView === "companies" && (
                    <CompanyEnrichmentView />
                )}
                {activeView === "data-quality" && (
                    <DataQualityView analyticsData={analyticsData} />
                )}
                 {activeView === "alerts" && (
                    <DataQualityView analyticsData={analyticsData} />
                )}
                {activeView === "sources" && (
                    <SourcesView 
                        analyticsData={analyticsData} 
                        handleScrape={handleScrape}
                    />
                )}
                {activeView === "navigation" && (
                    <NavigationPage />
                )}
                {activeView === "seo" && (
                    <SeoView analyticsData={analyticsData} />
                )}

                {activeView === "reports" && (
                     <ReportsView />
                )}
                {activeView === "settings" && (
                    <SettingsView 
                        handleScrape={handleScrape}
                        isScraping={isScraping}
                        scrapeResult={scrapeResult}
                    />
                )}
                 {activeView !== "overview" && 
                  activeView !== "predictive" && 
                  activeView !== "companies" &&
                  activeView !== "data-quality" && 
                  activeView !== "sources" && 
                  activeView !== "seo" && 
                  activeView !== "reports" && 
                  activeView !== "alerts" &&
                  activeView !== "settings" &&
                  activeView !== "navigation" && (
                    <div className="p-12 text-center text-muted-foreground">
                        <h2 className="text-2xl font-bold mb-2">Work In Progress</h2>
                        <p>Module {activeView} is currently under construction.</p>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
}

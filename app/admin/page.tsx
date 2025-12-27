"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Database, Activity, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
    if (password === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      fetchStats();
    } else {
      alert("Incorrect password");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleScrape = async () => {
    setIsLoading(true);
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
        await fetchStats();
      }
    } catch (error: any) {
      setScrapeResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter password to access admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => {
            sessionStorage.removeItem("admin_auth");
            setIsAuthenticated(false);
          }}
        >
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Jobs in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bySource?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active job portals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scrapeResult?.success ? "Success" : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {scrapeResult?.totalScraped || 0} jobs scraped
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Job Sources</CardTitle>
          <CardDescription>Jobs by source portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats?.bySource?.map((source: any) => (
              <div
                key={source.source}
                className="px-3 py-1 rounded-md bg-secondary text-sm"
              >
                {source.source}: {source.count}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scraper Control</CardTitle>
          <CardDescription>
            Manually trigger the job scraper to fetch latest jobs from all portals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleScrape}
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              "Run Scraper Now"
            )}
          </Button>

          {scrapeResult && (
            <div
              className={`p-4 rounded-md ${
                scrapeResult.success
                  ? "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                  : "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {scrapeResult.success ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="font-medium">
                  {scrapeResult.success ? "Success" : "Error"}
                </p>
              </div>
              <p className="text-sm">{scrapeResult.message || scrapeResult.error}</p>
              {scrapeResult.success && (
                <div className="text-sm mt-2 space-y-1">
                  <p>Total scraped: {scrapeResult.totalScraped}</p>
                  <p>New jobs saved: {scrapeResult.saved}</p>
                  <p>Duplicates skipped: {scrapeResult.duplicates}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


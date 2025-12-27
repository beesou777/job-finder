"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Activity } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchStats();
  }, []);

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
    setIsScrapingLoading(true);
    setScrapeResult(null);

    try {
      const res = await fetch("/api/scrape/run", {
        method: "POST",
      });

      const data = await res.json();
      setScrapeResult(data);
      
      // Refresh stats after scraping
      if (data.success) {
        await fetchStats();
      }
    } catch (error) {
      setScrapeResult({ success: false, error: "Failed to run scraper" });
    } finally {
      setIsScrapingLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Jobs in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.bySource?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active job portals
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
              <Badge key={source.source} variant="outline" className="text-base py-1">
                {source.source}: {source.count}
              </Badge>
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
            disabled={isScrapingLoading}
            size="lg"
            className="w-full md:w-auto"
          >
            {isScrapingLoading ? (
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
              <p className="font-medium">
                {scrapeResult.success ? "✅ Success" : "❌ Error"}
              </p>
              <p className="text-sm mt-1">
                {scrapeResult.message || scrapeResult.error}
              </p>
              {scrapeResult.success && (
                <div className="text-sm mt-2">
                  <p>Total scraped: {scrapeResult.total}</p>
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


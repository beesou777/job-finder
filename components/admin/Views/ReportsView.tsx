import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, Users } from "lucide-react";
import { useState, useEffect } from "react";

export function ReportsView() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories for the table (can be optimized to pass as prop)
    fetch("/api/analytics?range=30d")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.success) setCategories(data.data.categoryStats || []);
      });
  }, []);

  const handleDownload = async (type: string) => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/analytics/export?type=${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Download failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error downloading report");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports & Data Products</h2>
        <p className="text-muted-foreground">
          Export raw data and generate specialized insight reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" /> Hiring Trends
            </CardTitle>
            <CardDescription>Weekly job volume and growth analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleDownload("trends")}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" /> Company Leads
            </CardTitle>
            <CardDescription>High-intent companies hiring aggressively.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleDownload("leads")}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-500" /> Raw Feed
            </CardTitle>
            <CardDescription>Full dump of active job listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" /> Not Available
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category Trends Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Trending Data</CardTitle>
          <CardDescription>Top job categories by volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Category Name</th>
                  <th className="px-4 py-3 font-medium text-right">Active Jobs</th>
                  <th className="px-4 py-3 font-medium text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const maxCount = Math.max(...categories.map((c) => parseInt(c.count) || 0), 1);

                  const getDemandLevel = (count: number) => {
                    const ratio = count / maxCount;
                    if (ratio > 0.6)
                      return { label: "High Demand", color: "text-green-600", bg: "bg-green-100" };
                    if (ratio > 0.3)
                      return {
                        label: "Medium Demand",
                        color: "text-yellow-600",
                        bg: "bg-yellow-100",
                      };
                    return { label: "Low Demand", color: "text-slate-500", bg: "bg-slate-100" };
                  };

                  return categories.slice(0, 10).map((cat: any, i) => {
                    const count = parseInt(cat.count) || 0;
                    const status = getDemandLevel(count);

                    return (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3 font-medium">{cat.name}</td>
                        <td className="px-4 py-3 text-right">{cat.count}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      Loading category data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

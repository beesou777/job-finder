import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { JobGrowthChart } from "@/components/admin/Charts/JobGrowthChart";
import { SourceDistributionChart } from "@/components/admin/Charts/SourceDistributionChart";
import { CategoryChart } from "@/components/admin/Charts/CategoryChart";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ExecutiveOverviewProps {
  analyticsData: any;
  isLoading: boolean;
  dateRange: string;
  setDateRange: (range: string) => void;
  fetchAnalytics: (range: string) => void;
  mode?: "founder" | "ops";
}

export function ExecutiveOverview({
  analyticsData,
  isLoading,
  dateRange,
  setDateRange,
  fetchAnalytics,
  mode = "founder",
}: ExecutiveOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {mode === "founder" ? "Ecosystem Intelligence" : "Operational Control"}
          </h2>
          <p className="text-muted-foreground">
            {mode === "founder"
              ? "Strategic overview of market indicators and growth trends."
              : "Deep-dive into source reliability, scraper logs and raw volumes."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={(val) => {
              setDateRange(val);
              fetchAnalytics(val);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => fetchAnalytics(dateRange)}
            disabled={isLoading}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <AnalyticsOverview data={analyticsData?.overview} isLoading={isLoading} />

      {/* Job Growth and Category Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <JobGrowthChart data={analyticsData?.growthTrends} />
        <CategoryChart data={analyticsData?.categoryStats} />
      </div>

      {/* Additional Charts Section */}
      {mode === "ops" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SourceDistributionChart data={analyticsData?.sourceStats} />
        </div>
      )}

      {/* Market Indices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Market Indices</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simplified Indices View */}
            {analyticsData?.indices ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium">Nepal Hiring Index</span>
                  <span className="font-bold text-green-600">
                    {analyticsData.indices.nhi.value}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-medium">Remote Readiness</span>
                  <span className="font-bold text-blue-600">
                    {analyticsData.indices.remoteReadiness.value}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-20 animate-pulse bg-gray-100 rounded"></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

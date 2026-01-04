

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Activity, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OverviewProps {
  data: {
    jobsToday: { value: number; delta: number };
    jobsLast7Days: { value: number; delta: number };
    jobsLast30Days: { value: number; delta: number };
    activeJobs: number;
    expiredJobs: number;
    totalJobs: number;
    wowGrowth?: number;
    remotePercentage: number;
    completenessScore: number;
  } | null;
  isLoading?: boolean;
}

const DeltaBadge = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  return (
    <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {isPositive ? <ArrowUp className="h-2 w-2 mr-0.5" /> : <ArrowDown className="h-2 w-2 mr-0.5" />}
      {Math.abs(value)}%
    </div>
  );
};

export function AnalyticsOverview({ data, isLoading }: OverviewProps) {
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="relative overflow-hidden group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Active Context</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeJobs}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.totalJobs} total jobs tracked across platforms
          </p>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">Data Integrity</div>
            <div className="text-xs font-bold text-primary">{data.completenessScore}%</div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Velocity</CardTitle>
          <DeltaBadge value={data.jobsLast7Days.delta} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.jobsLast7Days.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            New listings in last 7 days
          </p>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">MoM Trend</div>
            <DeltaBadge value={data.jobsLast30Days.delta} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Ingestion</CardTitle>
          <DeltaBadge value={data.jobsToday.delta} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.jobsToday.value}</div>
          <p className="text-xs text-muted-foreground mt-1">Jobs synced since midnight</p>
          <div className="mt-4 flex items-center gap-2">
             <Badge variant="secondary" className="text-[9px] py-0 bg-blue-50 text-blue-700 border-blue-100">Live Sync</Badge>
             <span className="text-[9px] text-muted-foreground">NPT: {new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Market Percentile</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Top 12%</div>
          <p className="text-xs text-muted-foreground mt-1">Historical volume rank this week</p>
          <div className="mt-4 bg-slate-100 h-1 rounded-full overflow-hidden">
             <div className="bg-primary h-full w-[88%]" />
          </div>
        </CardContent>
       </Card>
    </div>
  );
}

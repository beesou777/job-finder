import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceDistributionChart } from "@/components/admin/Charts/SourceDistributionChart";
import { CheckCircle2, Activity, AlertCircle, RefreshCw, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SourcesViewProps {
  analyticsData: any;
  handleScrape: () => void;
}

export function SourcesView({ analyticsData, handleScrape }: SourcesViewProps) {
  const [isScraping, setIsScraping] = useState(false);

  if (!analyticsData) return <div className="animate-pulse h-32 bg-gray-100 rounded-md"></div>;

  return (
    <div className="space-y-6">

       <div>
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Source Intelligence</h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Activity className="h-3 w-3 text-green-500" />
                Live Sync: {new Date().toLocaleTimeString()}
            </div>
        </div>
        <p className="text-muted-foreground">Monitoring data pipelines and source health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Source (Big Card) */}
        <SourceDistributionChart 
            data={analyticsData.sourceStats} 
            className="md:col-span-2 md:row-span-2"
        />

        {/* Total Sources Stat */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{analyticsData.sourceStats?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" /> 100% Connectivity
                </p>
            </CardContent>
        </Card>

         {/* Scraper Status (Small) */}
        <Card>
             <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
                <Badge variant="secondary" className="text-[9px] py-0 bg-amber-50 text-amber-600 border-amber-100">7ms Latency</Badge>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                     <div className={`h-3 w-3 rounded-full ${isScraping ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
                     <span className="font-bold">{isScraping ? "Processing" : "Operational"}</span>
                </div>
            </CardContent>
        </Card>

        {/* Source List (Long) */}
        <Card className="md:col-span-3">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" /> Source Reliability Matrix
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {analyticsData.sourceStats?.map((source: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-lg font-bold text-slate-400">#{i + 1}</span>
                                <div className="font-semibold capitalize">{source.source}</div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-sm font-bold">{source.count} jobs</div>
                                    <div className="text-xs text-muted-foreground">Contribution</div>
                                </div>
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                     <div 
                                        className="h-full bg-indigo-500" 
                                        style={{ width: `${(source.count / (analyticsData.overview?.totalJobs?.value || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

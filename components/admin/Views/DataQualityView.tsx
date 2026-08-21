import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface DataQualityViewProps {
  analyticsData: any;
}

export function DataQualityView({ analyticsData }: DataQualityViewProps) {
  if (!analyticsData) return <div>Loading...</div>;

  const alerts = analyticsData.alerts || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Quality & Alerts</h2>
        <p className="text-muted-foreground">
          System health, anomaly detection, and data integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alerts Section */}
        <Card className="col-span-1 border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Alerts
            </CardTitle>
            <CardDescription>System notices requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p>All systems normal. No active alerts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg bg-orange-50 border border-orange-100 text-orange-900 dark:bg-orange-900/10 dark:text-orange-100 dark:border-orange-800"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <span className="text-xs uppercase px-2 py-0.5 rounded bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Normalization Status */}
        <Card>
          <CardHeader>
            <CardTitle>Data Completeness</CardTitle>
            <CardDescription>Metric of field population across all jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-800">
                <span className="text-3xl font-bold">
                  {analyticsData.overview?.completenessScore}%
                </span>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Verified Companies</span>
                <span className="text-muted-foreground">Coming Soon</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Normalized Locations</span>
                <span className="text-muted-foreground">Coming Soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

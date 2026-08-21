import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Target, Zap, Info, ShieldCheck, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PredictiveProps {
  forecast: any;
  indices: any;
  onWindowChange?: (window: string) => void;
}

export function PredictiveInsights({ forecast, indices, onWindowChange }: PredictiveProps) {
  if (!forecast || !indices)
    return <div className="animate-pulse h-32 bg-gray-100 rounded-md"></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NHI Index Card */}
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none relative overflow-hidden group">
          <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <Info className="h-5 w-5 cursor-help" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Target className="h-4 w-4" /> NEPAL HIRING INDEX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{indices.nhi?.value}</div>
            <div className="flex items-center gap-2 mt-2 text-sm text-green-400">
              <TrendingUp className="h-4 w-4" /> {indices.nhi?.change} pts
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Weighted score of volume, freshness & diversity.
            </p>
          </CardContent>
        </Card>

        {/* Remote Readiness */}
        <Card className="relative group">
          <div className="absolute top-2 right-2 text-muted-foreground opacity-20 group-hover:opacity-40 transition-opacity">
            <Info className="h-4 w-4 cursor-help" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" /> Remote Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{indices.remoteReadiness?.value}/100</div>
            <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${indices.remoteReadiness?.value}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-tighter">
              Tracks remote/hybrid job adoption
            </p>
          </CardContent>
        </Card>

        {/* Forecast Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Forecast Model</span>
              <Badge variant="outline" className="text-[10px] h-5 py-0">
                v1.2-beta
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {forecast.insight === "Upward Trend" ? (
                <TrendingUp className="text-green-500 h-5 w-5" />
              ) : (
                <TrendingDown className="text-red-500 h-5 w-5" />
              )}
              {forecast.insight}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground text-xs">Model Reliability:</span>
              <span className="font-bold text-primary text-xs">{forecast.reliabilityScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Job Market Prediction</CardTitle>
            <CardDescription>
              AI-projected volume with{" "}
              <span className="text-primary font-semibold">95% confidence bands</span>.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground mr-2">
              <Calendar className="h-3 w-3" />
              SMA Window:
            </div>
            <Select defaultValue="7" onValueChange={onWindowChange}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days (Short)</SelectItem>
                <SelectItem value="14">14 Days (Accurate)</SelectItem>
                <SelectItem value="30">30 Days (Smooth)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={forecast.forecast}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.toLocaleDateString("en-US", { weekday: "short" });
                  }}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value: any, name?: string) => {
                    if (name === "predictedCount") return [value, "Projected Jobs"];
                    if (name === "upperBound") return [value, "Upper Confidence"];
                    if (name === "lowerBound") return [value, "Lower Confidence"];
                    return [value, name || "Value"];
                  }}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString(undefined, { dateStyle: "full" })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="transparent"
                  fill="#8884d8"
                  fillOpacity={0.1}
                  name="Confidence Interval"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="transparent"
                  fill="#f8fafc"
                  fillOpacity={1}
                  name="Lower Block"
                />
                <Line
                  type="monotone"
                  dataKey="predictedCount"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Trend Line"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600" /> Central Projection
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-100" /> Confidence Band
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

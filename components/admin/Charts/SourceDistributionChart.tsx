import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SourceChartProps {
  data: any[];
  className?: string; // Add className prop
}

export function SourceDistributionChart({ data, className }: SourceChartProps) {
  if (!data?.length) return null;

  // Take top 10 sources
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.source,
    jobs: parseInt(item.count, 10),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Job Sources</CardTitle>
        <CardDescription>Most active job portals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis type="number" fontSize={12} stroke="#888888" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                fontSize={12}
                stroke="#888888"
                tickFormatter={(value) =>
                  value.length > 12 ? `${value.substring(0, 12)}...` : value
                }
              />
              <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px" }} />
              <Bar dataKey="jobs" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

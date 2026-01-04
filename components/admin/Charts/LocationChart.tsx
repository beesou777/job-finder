
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LocationChartProps {
  data: any[];
}

export function LocationChart({ data }: LocationChartProps) {
  if (!data?.length) return null;

  // Take top 10 locations
  const chartData = data.slice(0, 10).map(item => ({
    name: item.location || "Unknown",
    value: parseInt(item.count, 10)
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Locations</CardTitle>
        <CardDescription>Where the jobs are</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                angle={-45} 
                textAnchor="end" 
                height={60}
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: "8px" }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

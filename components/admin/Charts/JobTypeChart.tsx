
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface JobTypeChartProps {
  data: any[];
}

const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

export function JobTypeChart({ data }: JobTypeChartProps) {
  if (!data?.length) return null;

  const chartData = data.map(item => ({
    name: item.type || "Unspecified",
    value: parseInt(item.count, 10)
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Job Types</CardTitle>
        <CardDescription>Engagement models</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px" }} />
              <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

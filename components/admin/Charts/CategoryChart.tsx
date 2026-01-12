
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CategoryChartProps {
  data: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data?.length) return null;

  // Take top 8 categories, others as "Others"
  let chartData = data.slice(0, 8).map(item => ({
    name: item.name,
    value: parseInt(item.count, 10)
  }));
  
  const othersCount = data.slice(8).reduce((acc, curr) => acc + parseInt(curr.count, 10), 0);
  if (othersCount > 0) {
    chartData.push({ name: 'Others', value: othersCount });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jobs by Category</CardTitle>
        <CardDescription>market demand by sector</CardDescription>
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
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Others' ? '#94a3b8' : COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px" }} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CompanyTableProps {
  data: any[];
}

export function CompanyTable({ data }: CompanyTableProps) {
  if (!data?.length) return null;

  return (
    <Card className="col-span-2 md:col-span-3">
      <CardHeader>
        <CardTitle>Top Hiring Companies</CardTitle>
        <CardDescription>Companies with most active listings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium p-2 text-muted-foreground">Company Name</th>
                <th className="text-right font-medium p-2 text-muted-foreground">Active Jobs</th>
                <th className="text-right font-medium p-2 text-muted-foreground w-20">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-medium">{item.company || "Confidential"}</td>
                  <td className="p-3 text-right">{item.count}</td>
                  <td className="p-3 text-right">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SeoViewProps {
    analyticsData: any;
}

export function SeoView({ analyticsData }: SeoViewProps) {
    if (!analyticsData) return <div>Loading...</div>;

    const keywords = analyticsData.seoInsights || [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">SEO & Market Insights</h2>
                <p className="text-muted-foreground">High-demand keywords and trending topics in the job market.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Keywords in Job Titles</CardTitle>
                    <CardDescription>Most frequently occurring terms in active job listings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keywords} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                <XAxis type="number" fontSize={12} stroke="#888888" />
                                <YAxis 
                                    type="category" 
                                    dataKey="word" 
                                    width={100} 
                                    fontSize={12} 
                                    stroke="#888888" 
                                    tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{ borderRadius: '8px' }}
                                    formatter={(value: any) => [value, "Occurrences"]}
                                />
                                <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {keywords.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 5}, 70%, 50%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Content Strategy</CardTitle>
                        <CardDescription>Suggested blog topics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                            <li>Top {keywords[0]?.word} Jobs in Nepal: A Complete Guide</li>
                            <li>How to become a {keywords[1]?.word} in 2026</li>
                            <li>Salary Trends for {keywords[2]?.word} roles</li>
                            <li>Skills required for {keywords[0]?.word} positions</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

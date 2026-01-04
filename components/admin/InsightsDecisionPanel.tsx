import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, MessageSquare, Plus, History, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function InsightsDecisionPanel() {
    const mockInsights = [
        {
            type: "AI_INSIGHT",
            text: "Remote job listings increased by 15% this week. Consider promoting the 'Remote-First' filter on the homepage.",
            date: "Today at 09:45 AM"
        },
        {
            type: "MANUAL_DECISION",
            text: "Disabled Source 'Jobjee' due to persistent mapping errors in the construction category.",
            date: "Yesterday at 04:15 PM",
            author: "Admin"
        }
    ];

    return (
        <Card className="border-none shadow-none bg-slate-50 dark:bg-slate-900/50">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            Insights & Decisions
                        </CardTitle>
                        <CardDescription>Traceability for system adjustments.</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 gap-2">
                        <Plus className="h-4 w-4" /> New Note
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockInsights.map((item, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                             <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'AI_INSIGHT' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                             
                             <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className={`text-[10px] py-0 ${item.type === 'AI_INSIGHT' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : 'bg-amber-50 text-amber-700 hover:bg-amber-50'}`}>
                                        {item.type === 'AI_INSIGHT' ? 'System Insight' : 'Admin Decision'}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                        <History className="h-3 w-3" /> {item.date}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                    {item.text}
                                </p>
                                {item.author && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                            {item.author[0]}
                                        </div>
                                        <span className="text-[10px] font-medium text-slate-500">By {item.author}</span>
                                    </div>
                                )}
                             </div>
                        </div>
                    ))}
                    
                    <Button variant="ghost" className="w-full text-xs text-muted-foreground border-dashed border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all py-6">
                        + Add strategic observation or log an operational change
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

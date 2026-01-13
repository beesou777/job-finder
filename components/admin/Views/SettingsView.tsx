
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Play, Database, Server } from "lucide-react";

interface SettingsViewProps {
  handleScrape: () => void;
  isScraping: boolean;
  scrapeResult: any;
}

export function SettingsView({ handleScrape, isScraping, scrapeResult }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Manage scraper configuration and system maintenance.</p>
      </div>

      <div className="grid gap-6">
        {/* Scraper Control Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              Scraper Engine Control
            </CardTitle>
            <CardDescription>
              Trigger manual ingestion cycles. This will fetch new jobs from all configured sources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleScrape} 
                disabled={isScraping}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isScraping ? (
                    <>
                        <span className="animate-spin mr-2">⟳</span> Running Scraper...
                    </>
                ) : (
                    <>
                        <Play className="mr-2 h-4 w-4" /> Run Scraper Now
                    </>
                )}
              </Button>
            </div>

            {scrapeResult && (
              <div className={`p-4 rounded-md text-sm ${scrapeResult.success ? "bg-green-50 text-green-700 dark:bg-green-900/20" : "bg-red-50 text-red-700 dark:bg-red-900/20"}`}>
                <p className="font-bold mb-1">{scrapeResult.success ? "Success" : "Error"}</p>
                <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(scrapeResult.data || scrapeResult.error, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

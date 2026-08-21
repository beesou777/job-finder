"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ADMIN_NAV_ITEMS } from "@/components/admin/NavigationData";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function NavigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Sitemap</h2>
        <p className="text-muted-foreground">
          Central directory of all administrative modules and tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-bold">{item.label}</CardTitle>
                <CardDescription className="text-xs line-clamp-1">
                  {item.description}
                </CardDescription>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-dashed border-2">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-sm">
            Additional modules can be registered via the `NavigationData.ts` schema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { unstable_cache } from "next/cache";
import { getDataSource } from "@/lib/db";

export type MarketInsights = {
  generatedAt: string;
  sampleSize: number;
  activeJobs: number;
  newThisWeek: number;
  expiringSoon: number;
  remoteJobs: number;
  internships: number;
  categories: Array<{ name: string; count: number }>;
  locations: Array<{ name: string; count: number }>;
  methodology: string;
};

const loadMarketInsights = unstable_cache(
  async (): Promise<MarketInsights> => {
    const db = await getDataSource();
    const rows = await db.query(`
      SELECT
        COALESCE(NULLIF(TRIM(j."categoryOld"), ''), 'Other') AS category,
        COALESCE(NULLIF(TRIM(j.location), ''), 'Unspecified') AS location,
        j.type,
        j."jobType",
        j."postedAt",
        j."expiresAt"
      FROM jobs j
      WHERE j."isActive" = true
        AND (j."expiresAt" IS NULL OR j."expiresAt" > CURRENT_TIMESTAMP)
    `);

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const soon = now + 7 * 24 * 60 * 60 * 1000;
    const categories = new Map<string, number>();
    const locations = new Map<string, number>();
    let newThisWeek = 0;
    let expiringSoon = 0;
    let remoteJobs = 0;
    let internships = 0;

    for (const row of rows) {
      const category = String(row.category);
      const location = String(row.location);
      categories.set(category, (categories.get(category) || 0) + 1);
      locations.set(location, (locations.get(location) || 0) + 1);
      const posted = row.postedAt ? new Date(row.postedAt).getTime() : 0;
      const expires = row.expiresAt ? new Date(row.expiresAt).getTime() : 0;
      if (posted >= weekAgo) newThisWeek += 1;
      if (expires > now && expires <= soon) expiringSoon += 1;
      if (row.type === "internship" || row.jobType === "internship") internships += 1;
      if (
        ["remote", "hybrid"].includes(String(row.jobType).toLowerCase()) ||
        /remote/i.test(location)
      )
        remoteJobs += 1;
    }

    const top = (map: Map<string, number>) =>
      Array.from(map, ([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    return {
      generatedAt: new Date().toISOString(),
      sampleSize: rows.length,
      activeJobs: rows.length,
      newThisWeek,
      expiringSoon,
      remoteJobs,
      internships,
      categories: top(categories),
      locations: top(locations),
      methodology:
        "Counts include unique active job records currently in KamKhoj. Expired records are excluded. Categories and locations use the stored listing values; small samples should be treated as directional rather than a complete measure of the Nepal labour market.",
    };
  },
  ["market-insights-current"],
  { revalidate: 900 },
);

export function getMarketInsights() {
  return loadMarketInsights();
}

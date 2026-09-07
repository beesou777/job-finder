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

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL

export async function getMarketInsights(): Promise<MarketInsights> {
  try {
    const res = await fetch(`${API_BASE}/analytics/insights`, {
      next: { revalidate: 900, tags: ["market-insights"] },
    });

    if (!res.ok) {
      return {
        generatedAt: new Date().toISOString(),
        sampleSize: 0,
        activeJobs: 0,
        newThisWeek: 0,
        expiringSoon: 0,
        remoteJobs: 0,
        internships: 0,
        categories: [],
        locations: [],
        methodology: "Computed live across verified active jobs in PostgreSQL.",
      };
    }

    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching market insights:", error);
    return {
      generatedAt: new Date().toISOString(),
      sampleSize: 0,
      activeJobs: 0,
      newThisWeek: 0,
      expiringSoon: 0,
      remoteJobs: 0,
      internships: 0,
      categories: [],
      locations: [],
      methodology: "Computed live across verified active jobs in PostgreSQL.",
    };
  }
}

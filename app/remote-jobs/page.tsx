import { Suspense } from "react";
import { RemoteJobsFiltering } from "@/components/remote/RemoteJobsFiltering";
import { RemoteJobsList, RemoteJobsSkeleton } from "@/components/remote/RemoteJobsList";
import { Pagination } from "@/components/Pagination";

export const dynamic = 'force-dynamic';

const API_URL = "https://js-ha.simplify.jobs/multi_search";
const API_KEY = "SWF1ODFZbzBkcVlVdnVwT2FqUE5EZ3JpSk5hVmdpUHg1SklXWEdGbHZVRT1POHJieyJleGNsdWRlX2ZpZWxkcyI6ImNvbXBhbnlfdXJsLGNhdGVnb3JpZXMsYWRkaXRpb25hbF9yZXF1aXJlbWVudHMsY291bnRyaWVzLGRlZ3JlZXMsZ2VvbG9jYXRpb25zLGluZHVzdHJpZXMsaXNfc2ltcGxlX2FwcGxpY2F0aW9uLGpvYl9saXN0cyxsZWFkZXJzaGlwX3R5cGUsc2VjdXJpdHlfY2xlYXJhbmNlLHNraWxscyx1cmwifQ%3D%3D";

async function getFacets(q: string = "*") {
    const payload = {
        searches: [
          {
            collection: "jobs",
            q: q || "*",
            query_by: "title,company_name,functions,locations",
            facet_by: "countries,degrees,experience_level,functions,locations,travel_requirements,type",
            page: 1,
            per_page: 1,
            max_facet_values: 50,
          }
        ],
    };

    const response = await fetch(`${API_URL}?x-typesense-api-key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        next: { revalidate: 3600 }
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.results[0]?.facet_counts || [];
}

export default async function RemoteJobsPage({
  searchParams,
}: {
  searchParams: { 
    q?: string; 
    country?: string; 
    experience?: string; 
    function?: string; 
    location?: string; 
    type?: string; 
    travel?: string; 
    page?: string; 
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const facetCounts = await getFacets(searchParams.q);

  return (
    <div className="min-h-screen bg-gray-50">
      <RemoteJobsFiltering facetCounts={facetCounts} />
      
      <div className="container mx-auto px-4 py-8">
        <Suspense key={JSON.stringify(searchParams)} fallback={<RemoteJobsSkeleton />}>
          <RemoteJobsList 
            page={page}
            q={searchParams.q}
            country={searchParams.country}
            experience={searchParams.experience}
            function={searchParams.function}
            location={searchParams.location}
            type={searchParams.type}
            travel={searchParams.travel}
          />
        </Suspense>
      </div>
    </div>
  );
}

import { RemoteJobCard } from "@/components/RemoteJobCard";
import { Card, CardContent } from "@/components/ui/card";
import { RemotePagination } from "./RemotePagination";

interface RemoteJobsListProps {
  page: number;
  q?: string;
  country?: string;
  experience?: string;
  function?: string;
  location?: string;
  type?: string;
  travel?: string;
}

const API_URL = "https://js-ha.simplify.jobs/multi_search";
const API_KEY = "SWF1ODFZbzBkcVlVdnVwT2FqUE5EZ3JpSk5hVmdpUHg1SklXWEdGbHZVRT1POHJieyJleGNsdWRlX2ZpZWxkcyI6ImNvbXBhbnlfdXJsLGNhdGVnb3JpZXMsYWRkaXRpb25hbF9yZXF1aXJlbWVudHMsY291bnRyaWVzLGRlZ3JlZXMsZ2VvbG9jYXRpb25zLGluZHVzdHJpZXMsaXNfc2ltcGxlX2FwcGxpY2F0aW9uLGpvYl9saXN0cyxsZWFkZXJzaGlwX3R5cGUsc2VjdXJpdHlfY2xlYXJhbmNlLHNraWxscyx1cmwifQ%3D%3D";
const ITEMS_PER_PAGE = 18;

async function fetchRemoteJobsFromAPI(options: any) {
    const { q = "*", page = 1, filters = "" } = options;
    const payload = {
        searches: [
          {
            collection: "jobs",
            q: q || "*",
            query_by: "title,company_name,functions,locations",
            facet_by: "countries,degrees,experience_level,functions,locations,travel_requirements,type",
            filter_by: filters || "travel_requirements:[`Remote`]",
            highlight_full_fields: "title,company_name,functions,locations",
            sort_by: "_text_match:desc,start_date:desc",
            page: page,
            per_page: ITEMS_PER_PAGE,
            max_facet_values: 50,
          }
        ],
    };

    const response = await fetch(`${API_URL}?x-typesense-api-key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) return { jobs: [], total: 0, facetCounts: [] };
    const data = await response.json();
    const result = data.results[0];
    return {
        jobs: (result.hits || []).map((hit: any) => ({ ...hit.document, id: hit.document.id || hit.document.posting_id })),
        total: result.found || 0,
        facetCounts: result.facet_counts || []
    };
}

export async function RemoteJobsList({
  page,
  q,
  country,
  experience,
  function: func,
  location,
  type,
  travel = "Remote",
}: RemoteJobsListProps) {
  const filtersArr = [];
  if (travel) filtersArr.push(`travel_requirements:[\`${travel}\`]`);
  if (country) filtersArr.push(`countries:[\`${country}\`]`);
  if (experience) filtersArr.push(`experience_level:[\`${experience}\`]`);
  if (func) filtersArr.push(`functions:[\`${func}\`]`);
  if (location) filtersArr.push(`locations:[\`${location}\`]`);
  if (type) filtersArr.push(`type:[\`${type}\`]`);
  
  const filters = filtersArr.join(" && ");
  const { jobs, total } = await fetchRemoteJobsFromAPI({ q, page, filters });

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">No international remote jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        {jobs.map((job: any) => (
          <RemoteJobCard key={job.id} job={job} />
        ))}
      </div>

      {total > ITEMS_PER_PAGE && (
        <div className="mt-8">
          <RemotePagination 
            currentPage={page}
            totalPages={Math.ceil(total / ITEMS_PER_PAGE)}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}
    </>
  );
}

export function RemoteJobsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[...Array(9)].map((_, i) => (
        <Card key={i} className="border-2 border-gray-200 bg-white h-64 animate-pulse">
          <CardContent className="pt-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

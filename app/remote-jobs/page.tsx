"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RemoteJobsFiltering } from "@/components/remote/RemoteJobsFiltering";
import { RemoteJobCard } from "@/components/RemoteJobCard";
import { RemotePagination } from "@/components/remote/RemotePagination";
import { Card, CardContent } from "@/components/ui/card";

const API_URL = "https://js-ha.simplify.jobs/multi_search";
const API_KEY = "SWF1ODFZbzBkcVlVdnVwT2FqUE5EZ3JpSk5hVmdpUHg1SklXWEdGbHZVRT1POHJieyJleGNsdWRlX2ZpZWxkcyI6ImNvbXBhbnlfdXJsLGNhdGVnb3JpZXMsYWRkaXRpb25hbF9yZXF1aXJlbWVudHMsY291bnRyaWVzLGRlZ3JlZXMsZ2VvbG9jYXRpb25zLGluZHVzdHJpZXMsaXNfc2ltcGxlX2FwcGxpY2F0aW9uLGpvYl9saXN0cyxsZWFkZXJzaGlwX3R5cGUsc2VjdXJpdHlfY2xlYXJhbmNlLHNraWxscyx1cmwifQ%3D%3D";
const ITEMS_PER_PAGE = 18;

function RemoteJobsContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [facetCounts, setFacetCounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const q = searchParams.get("q") || "*";
  const page = parseInt(searchParams.get("page") || "1");
  const country = searchParams.get("country");
  const experience = searchParams.get("experience");
  const func = searchParams.get("function");
  const location = searchParams.get("location");
  const type = searchParams.get("type");
  const travel = searchParams.get("travel") || "Remote";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const filtersArr = [];
        if (travel) filtersArr.push(`travel_requirements:[\`${travel}\`]`);
        if (country) filtersArr.push(`countries:[\`${country}\`]`);
        if (experience) filtersArr.push(`experience_level:[\`${experience}\`]`);
        if (func) filtersArr.push(`functions:[\`${func}\`]`);
        if (location) filtersArr.push(`locations:[\`${location}\`]`);
        if (type) filtersArr.push(`type:[\`${type}\`]`);
        
        const filters = filtersArr.join(" && ");

        const payload = {
          searches: [
            {
              collection: "jobs",
              q: q,
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
        });

        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        const result = data.results[0];
        
        setJobs((result.hits || []).map((hit: any) => ({ ...hit.document, id: hit.document.id || hit.document.posting_id })));
        setTotal(result.found || 0);
        setFacetCounts(result.facet_counts || []);
      } catch (err) {
        console.error("Error fetching remote jobs:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q, page, country, experience, func, location, type, travel]);

  return (
    <div className="min-h-screen bg-gray-50">
      <RemoteJobsFiltering facetCounts={facetCounts} />
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
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
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-xl text-red-500">Something went wrong while loading jobs. Please try again later.</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No international remote jobs found matching your criteria.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default function RemoteJobsPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-gray-50">
         <div className="container mx-auto px-4 py-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             {[...Array(9)].map((_, i) => (
               <Card key={i} className="border-2 border-gray-200 bg-white h-64 animate-pulse">
                 <CardContent className="pt-6">
                   <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                   <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
       </div>
    }>
      <RemoteJobsContent />
    </Suspense>
  );
}

import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs in Nepal - Latest Job Opportunities",
  description: "Browse thousands of job opportunities in Nepal. Find jobs in Kathmandu, Pokhara, and cities across Nepal. Search by category, location, and company.",
  keywords: ["jobs nepal", "nepal jobs", "jobs kathmandu", "job opportunities nepal", "nepal employment"],
  openGraph: {
    title: "Jobs in Nepal - Latest Job Opportunities | JobKhoj",
    description: "Browse thousands of job opportunities in Nepal. Find your dream job today.",
  },
};

async function getJobs(search?: string, category?: string, type?: string) {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (type) params.append("type", type);

    // For server-side rendering, construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_API 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const [jobsRes, categoriesRes] = await Promise.all([
      fetch(`${baseUrl}/api/jobs?${params.toString()}`, { 
        cache: "no-store",
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${baseUrl}/api/categories`, { 
        cache: "no-store",
        headers: { 'Content-Type': 'application/json' }
      }),
    ]);

    const jobsData = jobsRes.ok ? await jobsRes.json() : { success: false, data: [], total: 0 };
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { success: false, data: [] };

    return {
      data: jobsData.success ? jobsData.data : [],
      total: jobsData.total || 0,
      categories: categoriesData.success ? categoriesData.data : [],
    };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return { data: [], total: 0, categories: [] };
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; type?: string };
}) {
  const { data: jobs, total, categories } = await getJobs(
    searchParams.search,
    searchParams.category,
    searchParams.type || "job"
  );

  return (
    <div className="min-h-screen">
      {/* Hero Header - Minimal */}
      <div className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            {searchParams.category && categories.find((c: any) => c.id === searchParams.category)
              ? `${categories.find((c: any) => c.id === searchParams.category)?.name} Jobs`
              : "Jobs in Nepal"}
          </h1>
          <p className="text-gray-600">
            {searchParams.category 
              ? `Showing ${total} job${total !== 1 ? 's' : ''} in this category`
              : `Browse ${total} job opportunities from top Nepali job portals`}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form action="/jobs" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="search"
              placeholder="Search jobs by title, company, or category..."
              defaultValue={searchParams.search}
              className="pl-10"
            />
          </div>
          <input type="hidden" name="type" value={searchParams.type || "job"} />
          <input type="hidden" name="category" value={searchParams.category || ""} />
          <Button type="submit">Search</Button>
        </form>

        {/* Category Filter */}
        {categories && categories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by Category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/jobs?type=${searchParams.type || "job"}`}>
                <Badge 
                  variant={!searchParams.category ? "default" : "outline"}
                  className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                    !searchParams.category 
                      ? "bg-gradient-primary text-white border-0 shadow-md text-primary" 
                      : "hover:bg-primary/10 hover:border-primary/50 text-gray-900"
                  }`}
                >
                  All Categories
                </Badge>
              </a>
              {categories.map((cat: any) => (
                <a
                  key={cat.id}
                  href={`/jobs?type=${searchParams.type || "job"}&category=${cat.id}`}
                >
                  <Badge
                    variant={searchParams.category === cat.id ? "default" : "outline"}
                    className={`px-4 py-2 text-sm cursor-pointer transition-all font-semibold ${
                      searchParams.category === cat.id
                        ? "bg-gradient-primary text-white border-0 shadow-md hover:text-white text-primary text-gray-900"
                        : "hover:bg-primary/10 hover:border-primary/50 text-gray-900 border-gray-300 "
                    }`}
                  >
                    {cat.name}
                  </Badge>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <p className="text-xl text-muted-foreground mb-2">
                {searchParams.category 
                  ? "No jobs found in this category yet."
                  : "No jobs found matching your criteria."}
              </p>
              <p className="text-muted-foreground mb-6">
                {searchParams.category 
                  ? "This category may not have any jobs yet, or the jobs may not have been assigned to categories. Try viewing all jobs or selecting a different category."
                  : "Try adjusting your search terms or removing some filters to see more results."}
              </p>
              <div className="flex gap-3 justify-center">
                <a href={`/jobs?type=${searchParams.type || "job"}`}>
                  <Button variant="outline">View All Jobs</Button>
                </a>
                <a href="/">
                  <Button>Back to Home</Button>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {jobs.length} of {total} jobs
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


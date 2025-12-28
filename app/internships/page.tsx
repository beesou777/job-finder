import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internships in Nepal - Find Internship Opportunities",
  description: "Discover internship opportunities in Nepal. Find internships in IT, Marketing, Finance, and more. Start your career journey with top companies in Nepal.",
  keywords: ["internships nepal", "internship opportunities nepal", "nepal internships", "internship kathmandu"],
  openGraph: {
    title: "Internships in Nepal - Find Internship Opportunities | JobKhoj",
    description: "Discover internship opportunities in Nepal. Start your career journey today.",
  },
};

async function getInternships(search?: string, category?: string) {
  try {
    const params = new URLSearchParams();
    params.append("type", "internship");
    if (search) params.append("search", search);
    if (category) params.append("category", category);

    // For server-side rendering, construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_API 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const [internshipsRes, categoriesRes] = await Promise.all([
      fetch(`${baseUrl}/api/jobs?${params.toString()}`, { 
        cache: "no-store",
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch(`${baseUrl}/api/categories`, { 
        cache: "no-store",
        headers: { 'Content-Type': 'application/json' }
      }),
    ]);

    const internshipsData = internshipsRes.ok ? await internshipsRes.json() : { success: false, data: [], total: 0 };
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { success: false, data: [] };

    return {
      data: internshipsData.success ? internshipsData.data : [],
      total: internshipsData.total || 0,
      categories: categoriesData.success ? categoriesData.data : [],
    };
  } catch (error) {
    console.error("Error fetching internships:", error);
    return { data: [], total: 0, categories: [] };
  }
}

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
  const { data: internships, total, categories } = await getInternships(
    searchParams.search,
    searchParams.category
  );

  return (
    <div className="min-h-screen">
      {/* Hero Header - Minimal */}
      <div className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            Internships in Nepal
          </h1>
          <p className="text-gray-600">
            Browse {total} internship opportunities from top companies
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form action="/internships" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              name="search"
              placeholder="Search internships..."
              defaultValue={searchParams.search}
              className="pl-10"
            />
          </div>
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
              <a href="/internships">
                <Badge 
                  variant={!searchParams.category ? "default" : "outline"}
                  className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                    !searchParams.category 
                      ? "bg-gradient-primary text-white border-0 shadow-md text-primary" 
                      : "hover:bg-primary/10 hover:border-primary/50"
                  }`}
                >
                  All Categories
                </Badge>
              </a>
              {categories.map((cat: any) => (
                <a 
                  key={cat.id} 
                  href={`/internships?category=${cat.id}`}
                >
                  <Badge
                    variant={searchParams.category === cat.id ? "default" : "outline"}
                    className={`px-4 py-2 text-sm cursor-pointer transition-all font-semibold ${
                      searchParams.category === cat.id
                        ? "bg-gradient-primary text-white border-0 shadow-md hover:text-white text-primary text-gray-900"
                        : "hover:bg-primary/10 hover:border-primary/50 text-gray-900 border-gray-300"
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

        {/* Internships List */}
        {internships.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <p className="text-xl text-muted-foreground mb-2">
                No internships found matching your criteria.
              </p>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or removing some filters to see more results. 
                New internship opportunities are added regularly.
              </p>
              <div className="flex gap-3 justify-center">
                <a href="/internships">
                  <Button variant="outline">View All Internships</Button>
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
              Showing {internships.length} of {total} internships
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship: any) => (
                <JobCard key={internship.id} job={internship} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


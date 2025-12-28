"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2 } from "lucide-react";

function InternshipsPageContent() {
  const searchParams = useSearchParams();
  const [internships, setInternships] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("search"), searchParams.get("category")]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const search = searchParams.get("search") || "";
      const category = searchParams.get("category") || "";

      const params = new URLSearchParams();
      params.append("type", "internship");
      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const [internshipsRes, categoriesRes] = await Promise.all([
        fetch(`/api/jobs?${params.toString()}`),
        fetch(`/api/categories`),
      ]);

      if (internshipsRes.ok) {
        const internshipsData = await internshipsRes.json();
        setInternships(internshipsData.success ? internshipsData.data : []);
        setTotal(internshipsData.total || 0);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.success ? categoriesData.data : []);
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue) params.append("search", searchValue);
    const category = searchParams.get("category");
    if (category) params.append("category", category);
    window.location.href = `/internships?${params.toString()}`;
  };

  const selectedCategory = searchParams.get("category");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search internships..."
              className="pl-10"
            />
          </div>
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
                  variant={!selectedCategory ? "default" : "outline"}
                  className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                    !selectedCategory 
                      ? "bg-gradient-primary text-white border-0 shadow-md text-primary" 
                      : "hover:bg-primary/10 hover:border-primary/50"
                  }`}
                >
                  All Categories
                </Badge>
              </a>
              {categories.map((cat: any) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <a 
                    key={cat.id} 
                    href={`/internships?category=${cat.id}`}
                  >
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className={`px-4 py-2 text-sm cursor-pointer transition-all font-semibold ${
                        isSelected
                          ? "bg-gradient-primary text-white border-0 shadow-md hover:text-white text-primary text-gray-900"
                          : "hover:bg-primary/10 hover:border-primary/50 text-gray-900 border-gray-300"
                      }`}
                    >
                      {cat.name}
                    </Badge>
                  </a>
                );
              })}
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

export default function InternshipsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <InternshipsPageContent />
    </Suspense>
  );
}


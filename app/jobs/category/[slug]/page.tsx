import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateCategoryMetadata } from "@/lib/seo";
import Script from "next/script";
import { getDataSource } from "@/lib/db";
import { Job } from "@/entities/Job";
import { Category } from "@/entities/Category";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateBreadcrumbSchema } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const dataSource = await getDataSource();
    const categoryRepository = dataSource.getRepository(Category);

    const category = await categoryRepository.findOne({
      where: { slug: params.slug },
    });

    if (!category) {
      return {
        title: "Category Not Found | kamkhoj",
      };
    }

    const jobRepository = dataSource.getRepository(Job);
    const now = new Date();

    // Count active jobs in this category
    const allJobs = await jobRepository.find({
      where: { categoryId: category.id },
      take: 1000,
    });
    const validJobs = allJobs.filter(
      (job) => !job.expiresAt || job.expiresAt > now
    );
    const total = validJobs.length;

    return generateCategoryMetadata(category.name, total);
  } catch (error) {
    return {
      title: "Category | kamkhoj",
    };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  let category: Category | null = null;
  let jobs: Job[] = [];
  let total = 0;
  let locations: string[] = [];

  try {
    const dataSource = await getDataSource();
    const categoryRepository = dataSource.getRepository(Category);
    const jobRepository = dataSource.getRepository(Job);

    category = await categoryRepository.findOne({
      where: { slug: params.slug },
    });

    if (!category) {
      notFound();
    }

    const now = new Date();
    const allJobs = await jobRepository.find({
      where: { categoryId: category.id },
      relations: ["category"],
      take: 100,
      order: { createdAt: "DESC" },
    });

    // Filter expired jobs
    jobs = allJobs.filter((job) => !job.expiresAt || job.expiresAt > now);
    total = jobs.length;

    // Get unique locations
    const locationSet = new Set<string>();
    jobs.forEach((job) => {
      if (job.location) {
        locationSet.add(job.location);
      }
    });
    locations = Array.from(locationSet).slice(0, 10);
  } catch (error) {
    console.error("Error fetching category jobs:", error);
  }

  if (!category) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Jobs", url: absoluteUrl("/jobs") },
    {
      name: `${category.name} Jobs`,
      url: absoluteUrl(`/jobs/category/${params.slug}`),
    },
  ]);

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-[#070708] text-zinc-100">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(166,255,70,0.12),transparent_32%)]">
          <div className="container mx-auto px-4 py-8 md:py-10">
            {/* Breadcrumbs */}
            <nav className="mb-6 text-sm font-bold text-zinc-500" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link
                    href="/"
                    className="hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li className="text-zinc-600">/</li>
                <li>
                  <Link
                    href="/jobs"
                    className="hover:text-primary transition-colors"
                  >
                    Jobs
                  </Link>
                </li>
                <li className="text-zinc-600">/</li>
                <li className="text-zinc-200">{category.name}</li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full">
                  Category
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 text-zinc-50">
                {category.name} Jobs in Nepal
              </h1>
              <p className="text-lg text-zinc-400 mb-4">
                Browse {total.toLocaleString()} {category.name.toLowerCase()}{" "}
                job opportunities
              </p>

              {/* SEO Content Section */}
              <div className="prose prose-invert max-w-none text-zinc-300 mt-6">
                {(() => {
                  const catLower = category.name.toLowerCase();
                  if (
                    catLower.includes("it") ||
                    catLower.includes("software") ||
                    catLower.includes("technology")
                  ) {
                    return (
                      <p className="text-base leading-relaxed">
                        IT and software jobs in Nepal are growing rapidly, with
                        opportunities in software development, web development,
                        mobile app development, and emerging technologies. The
                        sector offers competitive salaries, remote work options,
                        and excellent career growth potential. Major IT
                        companies, startups, and international clients provide
                        diverse opportunities for tech professionals across all
                        experience levels.
                      </p>
                    );
                  }
                  if (
                    catLower.includes("banking") ||
                    catLower.includes("finance")
                  ) {
                    return (
                      <p className="text-base leading-relaxed">
                        Banking and finance jobs in Nepal offer stability,
                        competitive salaries, and excellent benefits. The sector
                        includes commercial banks, development banks,
                        microfinance institutions, and financial service
                        companies. Opportunities range from entry-level
                        positions to senior management roles, with clear career
                        progression paths and professional development
                        opportunities.
                      </p>
                    );
                  }
                  if (catLower.includes("marketing")) {
                    return (
                      <p className="text-base leading-relaxed">
                        Marketing jobs in Nepal span digital marketing,
                        traditional marketing, brand management, and sales. The
                        growing digital landscape has created demand for digital
                        marketing specialists, social media managers, content
                        creators, and SEO experts. Marketing roles offer
                        creative opportunities, competitive compensation, and
                        the chance to work with diverse brands and industries.
                      </p>
                    );
                  }
                  if (catLower.includes("engineering")) {
                    return (
                      <p className="text-base leading-relaxed">
                        Engineering jobs in Nepal include civil engineering,
                        software engineering, electrical engineering, and
                        mechanical engineering. The infrastructure development
                        sector, IT industry, and manufacturing companies provide
                        diverse opportunities. Engineering positions offer good
                        salaries, project-based work, and opportunities to work
                        on significant infrastructure and development projects
                        across Nepal.
                      </p>
                    );
                  }
                  if (
                    catLower.includes("hr") ||
                    catLower.includes("human resource")
                  ) {
                    return (
                      <p className="text-base leading-relaxed">
                        HR jobs in Nepal involve talent acquisition, employee
                        relations, training and development, and organizational
                        development. As companies grow and professionalize, the
                        demand for skilled HR professionals is increasing. HR
                        roles offer opportunities to work across industries,
                        contribute to organizational success, and help shape
                        workplace culture and employee experiences.
                      </p>
                    );
                  }
                  return (
                    <p className="text-base leading-relaxed">
                      {category.name} jobs in Nepal offer diverse opportunities
                      across various industries and experience levels. The
                      sector provides competitive employment options with
                      opportunities for career growth and professional
                      development. Browse available positions to find the right
                      opportunity that matches your skills and career goals.
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="border-white/10 bg-[#1b1b1d]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-2xl font-black text-zinc-50">
                        {total.toLocaleString()}
                      </div>
                      <div className="text-sm text-zinc-500">Total Jobs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-[#1b1b1d]">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    <div>
                      <div className="text-2xl font-black text-zinc-50">
                        {locations.length}
                      </div>
                      <div className="text-sm text-zinc-500">Locations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Locations */}
            {locations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-4 text-zinc-50">
                  Jobs by Location
                </h2>
                <div className="flex flex-wrap gap-3">
                  {locations.map((location) => {
                    const locationJobs = jobs.filter(
                      (job) => job.location === location
                    ).length;
                    return (
                      <Link
                        key={location}
                        href={`/jobs?category=${category.id}&location=${location}`}
                      >
                        <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm cursor-pointer text-zinc-200 hover:border-primary/60 hover:text-primary transition-colors">
                          {location} ({locationJobs})
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View All Jobs Button */}
            <Link href={`/jobs?category=${category.id}`}>
              <Button className="rounded-full bg-primary text-zinc-950 hover:bg-white font-black">
                View All {category.name} Jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Jobs List */}
        <div className="container mx-auto px-4 py-6">
          {jobs.length === 0 ? (
            <Card className="border-white/10 bg-[#1b1b1d]">
              <CardContent className="pt-16 pb-16 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-2xl font-black mb-2 text-zinc-50">
                  No {category.name} Jobs Found
                </h3>
                <p className="text-zinc-400 mb-6">
                  We're constantly updating our job listings. Check back soon or
                  browse other categories.
                </p>
                <Link href="/jobs">
                  <Button variant="outline">Browse All Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {jobs.slice(0, 12).map((job) => (
                  <JobCard key={job.id} job={job as any} />
                ))}
              </div>
              {jobs.length > 12 && (
                <div className="text-center">
                  <Link href={`/jobs?category=${category.id}`}>
                    <Button variant="outline" size="lg">
                      View All {total} {category.name} Jobs
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

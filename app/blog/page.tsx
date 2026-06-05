import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { getAllBlogPosts } from "@/lib/blog";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Career Blog | Job Search Tips & Guides | kamkhoj",
  description:
    "Career advice, job search tips, and guides for finding jobs in Nepal. Learn how to write resumes, ace interviews, and grow your career.",
  keywords: [
    "career advice nepal",
    "job search tips nepal",
    "resume writing nepal",
    "interview tips nepal",
    "career guide nepal",
    "jobs nepal blog",
  ],
  openGraph: {
    title: "Career Blog | kamkhoj",
    description: "Career advice and job search tips for Nepal",
    url: absoluteUrl("/blog"),
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  alternates: {
    canonical: absoluteUrl("/blog"),
  },
};

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Career resources
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
            Career blog for job seekers in Nepal
          </h1>
          <p className="text-lg leading-8 text-zinc-400">
            Practical advice on resumes, interviews, job search strategy,
            internships, remote roles, and navigating Nepali job portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full cursor-pointer rounded-xl border border-white/10 bg-[#18181a] text-white transition-all hover:-translate-y-0.5 hover:border-primary/60">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-black mb-3 text-white line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-zinc-400 mb-4 line-clamp-3 text-sm leading-6">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  <div className="mt-4 flex items-center text-primary font-bold text-sm">
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#18181a] p-8">
          <h2 className="text-2xl font-black mb-3 text-white">
            Ready to search current vacancies?
          </h2>
          <p className="text-zinc-400 mb-6 max-w-2xl">
            Browse active job listings, internships, and remote roles from Nepali
            sources, then apply through the original posting.
          </p>
          <Link href="/jobs">
            <button className="rounded-full bg-primary px-6 py-3 font-black text-zinc-950 hover:bg-white transition-colors">
              Browse Jobs
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

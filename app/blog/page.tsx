import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { getAllBlogPosts } from "@/lib/blog";

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
    url: "https://www.kamkhoj.com//blog",
  },
  alternates: {
    canonical: "https://www.kamkhoj.com//blog",
  },
};

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            Career Resources
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Career Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and advice for your job search in Nepal
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                <CardContent className="pt-6">
                  <div className="mb-3">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
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
                  <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            Ready to Find Your Next Job?
          </h2>
          <p className="text-gray-600 mb-6">
            Browse thousands of job opportunities from top Nepali job portals
          </p>
          <Link href="/jobs">
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Browse Jobs
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

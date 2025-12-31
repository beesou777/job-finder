import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateFAQSchema } from "@/lib/seo";
import Script from "next/script";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/blog";
import { MarkdownContent } from "@/components/MarkdownContent";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: "Blog Post Not Found | JobKhoj",
    };
  }

  return {
    title: `${post.title} | JobKhoj Blog`,
    description: post.description,
    keywords: [
      post.title.toLowerCase(),
      "nepal jobs",
      "career advice nepal",
      post.category.toLowerCase(),
    ],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://kamkhoj.eventeir.ai/blog/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://kamkhoj.eventeir.ai/blog/${params.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const faqSchema = post.faqs ? generateFAQSchema(post.faqs) : null;
  const relatedPosts = getRelatedPosts(params.slug, 3);

  return (
    <>
      {faqSchema && (
        <Script
          id="faq-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <article className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <MarkdownContent content={post.content} />
              </CardContent>
            </Card>

            {/* FAQ Section */}
            {post.faqs && post.faqs.length > 0 && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {post.faqs.map((faq, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                          <h3 className="font-bold mb-2 text-gray-900 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {relatedPost.description}
                          </p>
                          <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                            Read more
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6 text-center">
                <h2 className="text-2xl font-bold mb-3 text-gray-900">
                  Ready to Find Your Next Job?
                </h2>
                <p className="text-gray-600 mb-6">
                  Browse thousands of job opportunities from top Nepali job portals
                </p>
                <Link href="/jobs">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>
    </>
  );
}


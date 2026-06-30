import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateFAQSchema } from "@/lib/seo";
import Script from "next/script";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/blog";
import { MarkdownContent } from "@/components/MarkdownContent";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | kamkhoj",
    };
  }

  return {
    title: `${post.title} | kamkhoj Blog`,
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
      url: absoluteUrl(`/blog/${params.slug}`),
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: absoluteUrl(`/blog/${params.slug}`),
    },
    robots: post.noindex ? { index: false, follow: true } : undefined,
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

      <article className="min-h-screen bg-zinc-950 text-white">
        <div className="container mx-auto px-4 py-14 md:py-16">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/blog"
              className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>

            <header className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1fr_320px]">
              <div>
                <p className="mb-5 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
                  Career article
                </p>
                <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                  {post.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
                  {post.description}
                </p>
              </div>

              <aside className="h-fit rounded-2xl border border-white/10 bg-[#18181a] p-6">
                <p className="mb-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Reading details
                </p>
                <div className="space-y-4 text-sm text-zinc-400">
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
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <div>{post.wordCount} words</div>
                </div>
                <p className="mt-6 text-sm leading-6 text-zinc-400">
                  This guide is part of KamKhoj&apos;s Nepal job-search resource
                  library and should be used together with the original employer
                  or platform source when a role, salary, or hiring rule may
                  have changed.
                </p>
                <Link
                  href="/jobs"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-black text-zinc-950 hover:bg-white"
                >
                  Browse jobs
                </Link>
              </aside>
            </header>

            <div className="grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
              <aside className="hidden lg:block">
                <div className="sticky top-28 rounded-2xl border border-white/10 bg-[#18181a] p-5">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                    KamKhoj blog
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Practical career writing for Nepali job seekers. Verify job
                    details at the original source before applying.
                  </p>
                </div>
              </aside>

              <Card className="mb-8 border-white/10 bg-[#18181a] text-white">
                <CardContent className="p-6 md:p-8">
                <MarkdownContent content={post.content} />
              </CardContent>
            </Card>
            </div>

            {/* FAQ Section */}
            {post.faqs && post.faqs.length > 0 && (
              <Card className="mb-8 border-white/10 bg-[#18181a] text-white">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-black mb-4 text-white">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {post.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-primary pl-4"
                      >
                        <h3 className="font-black text-white mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-zinc-400">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-4 text-white">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blog/${relatedPost.slug}`}
                    >
                      <Card className="h-full cursor-pointer border-white/10 bg-[#18181a] text-white transition-all hover:border-primary/60">
                        <CardContent className="pt-6">
                          <h3 className="font-black mb-2 text-white line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-zinc-400 line-clamp-2">
                            {relatedPost.description}
                          </p>
                          <div className="mt-4 flex items-center text-primary text-sm font-bold">
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
            <Card className="border-white/10 bg-[#18181a] text-white">
              <CardContent className="pt-6 text-center">
                <h2 className="text-2xl font-black mb-3 text-white">
                  Ready to Find Your Next Job?
                </h2>
                <p className="text-zinc-400 mb-6">
                  Browse thousands of job opportunities from top Nepali job
                  portals
                </p>
                <Link href="/jobs">
                  <span className="inline-flex rounded-full bg-primary px-5 py-3 font-black text-zinc-950 hover:bg-white">
                    Browse Jobs
                  </span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>
    </>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import Script from "next/script";
import { generateFAQSchema } from "@/lib/seo";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/blog";
import { MarkdownContent } from "@/components/MarkdownContent";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return { title: "Blog Post Not Found | KamKhoj" };
  return {
    title: `${post.title} | KamKhoj Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: absoluteUrl(`/blog/${params.slug}`),
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    alternates: { canonical: absoluteUrl(`/blog/${params.slug}`) },
    robots: post.noindex ? { index: false, follow: true } : undefined,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();
  const relatedPosts = getRelatedPosts(params.slug, 3);
  const faqSchema = post.faqs ? generateFAQSchema(post.faqs) : null;

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
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
          <header className="mt-12 border-b border-white/10 pb-10">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-primary">
              {post.category}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">{post.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
              <span>{post.wordCount} words</span>
            </div>
          </header>

          <div className="mx-auto max-w-3xl py-10 md:py-14">
            <p className="mb-8 border-l-2 border-primary pl-4 text-sm leading-6 text-zinc-400">
              Practical career writing for Nepali job seekers. Verify job details at the original
              source before applying.
            </p>
            <MarkdownContent content={post.content} />
          </div>

          {post.faqs && post.faqs.length > 0 && (
            <section className="border-t border-white/10 py-10">
              <h2 className="text-2xl font-black">Frequently asked questions</h2>
              <div className="mt-6 space-y-6">
                {post.faqs.map((faq) => (
                  <div key={faq.question} className="border-l-2 border-primary pl-5">
                    <h3 className="font-black">{faq.question}</h3>
                    <p className="mt-2 leading-7 text-zinc-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {relatedPosts.length > 0 && (
            <section className="border-t border-white/10 py-10">
              <h2 className="text-2xl font-black">Related articles</h2>
              <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex items-center justify-between gap-5 py-5"
                  >
                    <span>
                      <span className="block font-black group-hover:text-primary">
                        {related.title}
                      </span>
                      <span className="mt-1 block line-clamp-1 text-sm text-zinc-500">
                        {related.description}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="border-t border-white/10 py-10 text-center">
            <h2 className="text-2xl font-black">Continue your job search</h2>
            <p className="mt-2 text-zinc-400">
              Browse current opportunities and verify the original listing before applying.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-black text-zinc-950 hover:bg-white"
            >
              Browse jobs
            </Link>
          </section>
        </div>
      </article>
    </>
  );
}

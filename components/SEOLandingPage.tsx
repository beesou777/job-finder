import Link from "next/link";
import Script from "next/script";
import { JobsList, JobsSkeleton } from "@/components/jobs/JobsList";
import { JobsFiltering } from "@/components/jobs/JobsFiltering";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories } from "@/server/services/data-fetching";
import { generateFAQSchema } from "@/lib/seo";
import { SeoLandingPageConfig } from "@/lib/seo-pages";
import { Suspense } from "react";

type Props = {
  config: SeoLandingPageConfig;
  page?: number;
};

const jobTypes = [
  { value: "full-time", label: "Full-time", count: 0 },
  { value: "part-time", label: "Part-time", count: 0 },
  { value: "contract", label: "Contract", count: 0 },
  { value: "remote", label: "Remote", count: 0 },
  { value: "hybrid", label: "Hybrid", count: 0 },
  { value: "onsite", label: "On-site", count: 0 },
];

const locations = [
  { value: "Kathmandu", label: "Kathmandu", count: 0 },
  { value: "Lalitpur", label: "Lalitpur", count: 0 },
  { value: "Bhaktapur", label: "Bhaktapur", count: 0 },
  { value: "Pokhara", label: "Pokhara", count: 0 },
  { value: "Chitwan", label: "Chitwan", count: 0 },
  { value: "Butwal", label: "Butwal", count: 0 },
  { value: "Biratnagar", label: "Biratnagar", count: 0 },
  { value: "Remote", label: "Remote", count: 0 },
];

export async function SEOLandingPage({ config, page = 1 }: Props) {
  const categories = await getCategories({ limit: 100 });
  const faqSchema = generateFAQSchema(config.faqs);

  return (
    <>
      <Script
        id={`${config.slug}-faq-schema`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="min-h-screen bg-zinc-950 text-white">
        <section className="border-b border-white/10 bg-zinc-950">
          <div className="container mx-auto px-4 py-12 md:py-14">
            <nav className="mb-6 text-sm font-semibold text-zinc-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-zinc-300">{config.h1}</span>
            </nav>
            <p className="mb-4 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
              Nepal job search guide
            </p>
            <h1 className="max-w-4xl text-4xl md:text-5xl font-black tracking-tight leading-tight text-white mb-4">
              {config.h1}
            </h1>
            <p className="text-lg leading-8 text-zinc-400 max-w-3xl">
              Search current {config.keyword} listings from Nepali job sources, compare key details,
              and apply through the original posting page.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <article className="space-y-5 text-zinc-300 leading-7 bg-[#18181a] border border-white/10 rounded-xl p-6 md:p-8">
              {config.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p>
                KamKhoj is designed for practical discovery. Always review the source page before
                applying because salary, deadline, documents, and eligibility can change after a
                listing is collected.
              </p>
            </article>
            <aside className="bg-[#18181a] border border-white/10 rounded-xl p-6 h-fit">
              <h2 className="text-lg font-black text-white mb-4">Related searches</h2>
              <div className="flex flex-wrap gap-2">
                {config.related.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Badge
                      variant="outline"
                      className="border-white/10 px-3 py-1.5 font-semibold text-zinc-300 hover:bg-primary/10 hover:text-primary"
                    >
                      {item.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <JobsFiltering
          categories={categories}
          jobTypes={jobTypes}
          locations={locations}
          basePath={`/${config.slug}`}
          title={`Search ${config.h1}`}
          searchPlaceholder={`Search ${config.keyword} by title, company, or skill...`}
        />

        <section className="container mx-auto px-4 py-8">
          <Suspense fallback={<JobsSkeleton />}>
            <JobsList page={page} {...config.filter} />
          </Suspense>
        </section>

        <section className="container mx-auto px-4 pb-14">
          <Card className="border-white/10 bg-[#18181a] text-white">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-black text-white mb-5">Frequently Asked Questions</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {config.faqs.map((faq) => (
                  <div key={faq.question} className="rounded-lg bg-zinc-950 p-5">
                    <h3 className="font-black text-white mb-2">{faq.question}</h3>
                    <p className="text-sm leading-6 text-zinc-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}

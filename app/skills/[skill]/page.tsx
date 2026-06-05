import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Code2 } from "lucide-react";
import { JobsList, JobsSkeleton } from "@/components/jobs/JobsList";
import { generateCollectionMetadata } from "@/lib/seo";
import { titleCaseSlug } from "@/lib/site";

export const revalidate = 300;

export function generateStaticParams() {
  return ["react", "python", "javascript", "seo", "accounting", "digital-marketing"].map((skill) => ({ skill }));
}

export async function generateMetadata({
  params,
}: {
  params: { skill: string };
}): Promise<Metadata> {
  const skillName = titleCaseSlug(params.skill);
  return generateCollectionMetadata({
    path: `/skills/${params.skill}`,
    title: `${skillName} Jobs in Nepal | Latest Skill-Based Vacancies | KamKhoj`,
    description: `Find ${skillName} jobs in Nepal. Search vacancies, internships, remote roles, and companies hiring for ${skillName} skills.`,
    keywords: [`${skillName} jobs nepal`, `${skillName} jobs kathmandu`, "skills jobs nepal"],
  });
}

export default function SkillPage({
  params,
  searchParams,
}: {
  params: { skill: string };
  searchParams: { page?: string };
}) {
  const skillName = titleCaseSlug(params.skill);
  const page = Number(searchParams.page || 1);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="bg-zinc-950 border-b border-white/10">
        <div className="container mx-auto px-4 py-10">
          <nav className="mb-6 text-sm text-zinc-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-300">{skillName}</span>
          </nav>
          <p className="mb-4 font-mono text-sm font-black uppercase tracking-[0.18em] text-primary">
            Skill search
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            {skillName} Jobs in Nepal
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl">
            Search Nepal jobs and internships that mention {skillName}. Skill pages help
            candidates discover roles that may not use the exact same job title.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ["/it-jobs-nepal", "IT jobs"],
              ["/remote-jobs-nepal", "Remote jobs"],
              ["/internships-in-nepal", "Internships"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-bold text-zinc-300 hover:border-primary hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-black text-white">Latest {skillName} opportunities</h2>
        </div>
        <Suspense fallback={<JobsSkeleton />}>
          <JobsList page={page} search={skillName} />
        </Suspense>
      </section>
    </div>
  );
}

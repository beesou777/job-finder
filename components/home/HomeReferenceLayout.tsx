import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  Star,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { HomeApiJobRail } from "@/components/home/HomeApiJobRail";
import { getVisibleBlogPosts } from "@/lib/blog";

const featuredJobs = [
  [
    "Nabil Bank",
    "Relationship Manager",
    "Kathmandu, Nepal",
    "NPR 60,000 - 90,000",
    "Banking & Finance",
    "2 days ago",
    "A",
  ],
  [
    "Fusemachines",
    "Software Engineer",
    "Lalitpur, Nepal",
    "NPR 80,000 - 150,000",
    "IT & Software",
    "3 days ago",
    "F",
  ],
  [
    "Teach For Nepal",
    "Program Associate",
    "Kathmandu, Nepal",
    "NPR 50,000 - 70,000",
    "Education",
    "1 day ago",
    "T",
  ],
  [
    "Vianet Communications",
    "Digital Marketing Executive",
    "Kathmandu, Nepal",
    "NPR 40,000 - 70,000",
    "Marketing",
    "4 days ago",
    "V",
  ],
];

const latestJobs = [
  [
    "Unilever Nepal",
    "Assistant Brand Manager",
    "Kathmandu, Nepal",
    "NPR 90,000 - 100,000",
    "FMCG",
    "5 hours ago",
    "U",
  ],
  [
    "Daraz",
    "Product Operations Associate",
    "Kathmandu, Nepal",
    "NPR 50,000 - 80,000",
    "E-commerce",
    "1 day ago",
    "D",
  ],
  [
    "Mercy Corps",
    "Monitoring & Evaluation Officer",
    "Surkhet, Nepal",
    "NPR 65,000 - 95,000",
    "NGO / INGO",
    "2 days ago",
    "M",
  ],
  [
    "Leapfrog Technology",
    "UI/UX Designer",
    "Lalitpur, Nepal",
    "NPR 60,000 - 100,000",
    "Design",
    "2 days ago",
    "L",
  ],
];

export function FeaturedJobsSection() {
  return (
    <HomeApiJobRail
      eyebrow="Featured jobs"
      title="Urgent hiring in Nepal"
      description="Handpicked opportunities from top companies actively hiring now."
      options={{ limit: 4, type: "job", urgency: "7days" }}
    />
  );
}

export function LatestOpportunitiesSection() {
  return (
    <HomeApiJobRail
      eyebrow="Fresh opportunities"
      title="Latest vacancies for talented people"
      description="Explore newly posted jobs from growing companies in Nepal."
      options={{ limit: 4, type: "job" }}
    />
  );
}

function JobRail({
  eyebrow,
  title,
  description,
  jobs,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  jobs: string[][];
  light?: boolean;
}) {
  return (
    <section className={`py-14 ${light ? "bg-white" : "bg-white"}`}>
      <div className="site-container">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="home-eyebrow">
              <span />
              {eyebrow}
            </p>
            <h2 className="home-section-title">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          <Link href="/jobs" className="home-text-link hidden sm:flex">
            View all jobs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {jobs.map((job) => (
            <StaticJobCard key={job[1]} job={job} />
          ))}
        </div>
        <Link href="/jobs" className="home-text-link mt-5 flex sm:hidden">
          View all jobs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function StaticJobCard({ job }: { job: string[] }) {
  return (
    <article className="reference-job-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="company-mark">{job[6]}</span>
          <div>
            <p className="text-xs font-bold text-slate-700">{job[0]}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[.08em] text-slate-400">MeroJob</p>
          </div>
        </div>
      </div>
      <h3 className="mt-5 line-clamp-2 text-[15px] font-extrabold leading-5 text-[#112d62]">
        {job[1]}
      </h3>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        {job[2]}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <BriefcaseBusiness className="h-3.5 w-3.5" />
        {job[3]}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="job-chip">Full-time</span>
        <span className="job-chip">{job[4]}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <Clock3 className="h-3 w-3" />
          {job[5]}
        </span>
        <Link href="/jobs" className="text-xs font-extrabold text-primary hover:text-accent">
          View details <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function ImpactSection() {
  return (
    <section className="py-4">
      <div className="impact-panel">
        <div className="impact-copy">
          <p className="home-eyebrow text-primary">
            <span />
            Our impact
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight text-[#112d62] sm:text-3xl">
            Creating opportunities.
            <br />
            Powering Nepal's workforce.
          </h2>
        </div>
        <div className="impact-stats">
          <ImpactStat icon={BriefcaseBusiness} value="2,500+" label="Active job listings" />
          <ImpactStat icon={ShieldCheck} value="500+" label="Companies hiring" />
          <ImpactStat icon={Star} value="4.8/5" label="User satisfaction" />
        </div>
      </div>
    </section>
  );
}

function ImpactStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BriefcaseBusiness;
  value: string;
  label: string;
}) {
  return (
    <div>
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-2 text-lg font-black text-[#112d62]">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

export function WhySection() {
  const cards = [
    [
      ShieldCheck,
      "Verified opportunities",
      "Real jobs from legitimate companies, not fake listings.",
    ],
    [MapPin, "Nepal-focused", "Built for the local job market with relevant opportunities."],
    [UsersRound, "Free for job seekers", "No hidden fees. Apply and explore at no cost."],
    [TrendingUp, "Career resources", "Guides, tips, and tools to help you grow professionally."],
  ];
  return (
    <section className="py-14">
      <div className="site-container">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="home-eyebrow">
              <span />
              Why KamKhoj
            </p>
            <h2 className="home-section-title">More than just a job portal</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              We're building a better way for Nepal to find work — with the right tools, real
              opportunities, and a people-first approach.
            </p>
          </div>
          <Link href="/about" className="home-text-link hidden sm:flex">
            Learn more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([Icon, title, text]) => (
            <div className="reference-value-card" key={String(title)}>
              <div className="value-icon">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-extrabold text-[#112d62]">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{String(text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResourcesAndStoriesSection() {
  const posts = getVisibleBlogPosts().slice(0, 3);
  const imageBySlug: Record<string, string> = {
    "career-change-nepal": "/blog-career-change.png",
    "part-time-jobs-nepal": "/blog-part-time-jobs.png",
    "resume-writing-tips-nepal": "/blog-resume-writing.png",
    "interview-tips-nepal": "/blog-interview-prep.png",
    "how-to-find-jobs-in-nepal": "/blog-find-jobs-nepal.png",
  };
  return (
    <section className="bg-[#f6faff] py-14">
      <div className="site-container">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="home-eyebrow">
              <span />
              Career resources
            </p>
            <h2 className="home-section-title">Helpful guides for your career journey</h2>
            <p className="mt-2 text-sm text-slate-500">
              Tips, insights, and resources to help you navigate the Nepal job market.
            </p>
          </div>
          <Link href="/blog" className="home-text-link hidden sm:flex">
            View all resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="resource-card">
              <div
                className="h-36 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${imageBySlug[post.slug] || "/nepal-career-hero.png"}')`,
                }}
              />
              <div className="p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-primary">
                  {post.category}
                </p>
                <h3 className="mt-2 font-extrabold leading-5 text-[#112d62]">{post.title}</h3>
                <p className="mt-3 text-xs text-slate-500">{post.readTime}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const stories = [
    [
      "KamKhoj made my job search so much easier. I found a great opportunity in Kathmandu within two weeks.",
      "Sujata Karki",
      "Marketing Executive, Kathmandu",
    ],
    [
      "Mero purkheli ghar Ramechhap ho. Kam khoj ma yo website bata job paye, aile Kathmandu ma ghar banauna lageko chu. Mero pragati ko lagi yo website ko owner lai dherai dherai dhanyabad.",
      "Sujal Poudel",
      "Software Engineer, Lalitpur",
    ],
    [
      "Namaste mero name Anir Jung Thapa. Ma 5 barsa dekhi berojgar vayera baseko thye khana khane paisa ni thyena, eakdin mero sathy le malai usko phone bata kam khoj website ma mero lagi kam khojdiyo. Aaja ma sanga jhamsikhel ma 5 ota ghar ko malik xu. I want to thank that great man who developer kham khoj. Please reveal your identity I want to give one house. Thank you.",
      "Anir Jung Thapa",
      "Program Officer, Pokhara",
    ],
  ];
  return (
    <section className="py-14">
      <div className="site-container">
        <div className="mb-7">
          <p className="home-eyebrow">
            <span />
            Trusted by job seekers
          </p>
          <h2 className="home-section-title">Real people. Real progress.</h2>
          <p className="mt-2 text-sm text-slate-500">
            Hear from job seekers who found new opportunities through KamKhoj.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {stories.map(([quote, name, role]) => (
            <figure key={name} className="testimonial-card">
              <p className="text-sm leading-6 text-slate-600">“{quote}”</p>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="avatar-placeholder">{name[0]}</span>
                <span>
                  <strong className="block text-xs font-extrabold text-[#112d62]">{name}</strong>
                  <span className="text-[10px] text-slate-400">{role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeFaqSection() {
  const questions = [
    "Is KamKhoj free for job seekers?",
    "Do you offer internships as well?",
    "How do I apply for a job?",
    "How can companies post jobs?",
    "Are the job listings verified?",
    "Is my personal data safe?",
    "Can I get job alerts?",
    "How can I contact support?",
  ];
  return (
    <section className="bg-white py-14">
      <div className="site-container">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="home-eyebrow">
              <span />
              Frequently asked questions
            </p>
            <h2 className="home-section-title">Got questions? We've got answers.</h2>
            <p className="mt-2 text-sm text-slate-500">
              Everything you need to know about using KamKhoj.
            </p>
          </div>
          <Link href="/how-kamkhoj-works" className="home-text-link hidden sm:flex">
            View all FAQs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {questions.map((question) => (
            <details key={question} className="faq-row">
              <summary>
                {question}
                <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
              </summary>
              <p>
                KamKhoj helps you discover opportunities and verify the final application details on
                the original source.
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="pb-8 pt-2">
      <div className="final-cta">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl font-black leading-tight text-[#112d62] sm:text-3xl">
            Ready to find your next opportunity?
          </h2>
          <p className="mt-2 text-sm md:text-slate-500 text-white">
            Join thousands of job seekers in Nepal and take the next step in your career today.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/register" className="primary-button">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/jobs" className="secondary-button">
              Browse jobs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

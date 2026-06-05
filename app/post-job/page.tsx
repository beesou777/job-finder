import { Metadata } from "next";
import { PlatformCard } from "@/components/PlatformCard";
import { Info, Shield, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Where to Post a Job in Nepal | Professional Hiring Directory | kamkhoj",
  description: "A professional directory of top job portals and hiring platforms in Nepal. Find the right audience for your vacancies across specialized and general job boards.",
  keywords: [
    "post a job nepal",
    "job portals nepal",
    "hiring platforms nepal",
    "nepal recruitment directory",
    "where to hire in nepal",
  ],
};

const platforms = [
  { name: "MeroJob", website: "https://merojob.com", shortDescription: "One of the largest job portals in Nepal with a massive candidate database." },
  { name: "JobsNepal", website: "https://www.jobsnepal.com", shortDescription: "Established job site with a wide reach across diverse industries." },
  { name: "KumariJob", website: "https://www.kumarijob.com", shortDescription: "Popular platform providing end-to-end recruitment solutions." },
  { name: "MeroRojgari", website: "https://merorojgari.com", shortDescription: "Focused on connecting skilled employers and job seekers nationwide." },
  { name: "JobAxle", website: "https://jobaxle.com", shortDescription: "Modern recruitment platform connecting talent with opportunity." },
  { name: "RamroJob", website: "https://ramrojob.com", shortDescription: "Quality job listings focused on professional growth and career values." },
  { name: "Jobejee", website: "https://jobejee.com", shortDescription: "Data-driven job search and professional hiring platform." },
  { name: "InternSathi", website: "https://internsathi.com", shortDescription: "Nepal's specialized platform for entry-level talent and internships." },
  { name: "WorkHub Nepal", website: "https://workhubnepal.com", shortDescription: "Professional staffing and job opportunity hub." },
  { name: "RecruitNepal", website: "https://recruitnepal.com", shortDescription: "Specialized consultancy and professional recruitment portal." },
  { name: "JobSniper", website: "https://www.jobssniper.com/", shortDescription: "Efficient recruitment platform for quick and verified job matching." },
  { name: "VritJobs", website: "https://vritjobs.com", shortDescription: "The leading hub for IT, technical, and engineering roles in Nepal." },
  { name: "MeroCareer", website: "https://merocareer.com", shortDescription: "Career-focused job portal with a focus on professional development." },
  { name: "JobsDynamics", website: "https://jobsdynamics.com", shortDescription: "Comprehensive recruitment and HR consulting services." },
  { name: "InterNepal", website: "https://internepal.com.np/", shortDescription: "Dedicated bridge between students and industrial internships." },
  { name: "FroxJob", website: "https://froxjob.com", shortDescription: "Modern approach to talent acquisition and career management." },
  { name: "VocalPanda", website: "https://vocalpanda.com", shortDescription: "A creative and diverse job board for multi-disciplinary roles." },
  { name: "NecoJobs", website: "https://www.necojobs.com.np/", shortDescription: "Supporting industrial and local employment across Nepal." }
];

export default function PostJobPage() {
  return (
    <div className="bg-[#070708] min-h-screen text-zinc-100">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(184,244,96,0.12),transparent_32%)]">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-primary">
              Employer hiring guide
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-zinc-50 mb-6 tracking-tight leading-tight">
              Where to post a job in Nepal
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-8">
              Compare Nepali job portals, internship platforms, and hiring
              directories before publishing your next vacancy. KamKhoj is a
              discovery layer, so employers should still review each platform's
              current posting rules, pricing, and candidate audience.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {[
              ["General job portals", "Reach broad candidate pools across industries and experience levels."],
              ["Specialist platforms", "Use internship, IT, technical, or niche boards when the role needs focus."],
              ["Source visibility", "KamKhoj links candidates back to original portals for final applications."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-[#1b1b1d] p-6 shadow-2xl shadow-black/20">
                <h2 className="mb-2 text-lg font-black text-zinc-50">{title}</h2>
                <p className="text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.name}
                name={platform.name}
                website={platform.website}
                shortDescription={platform.shortDescription}
              />
            ))}
          </div>

          <div className="mt-24 max-w-4xl mx-auto">
            <div className="bg-[#1b1b1d] border border-primary/20 rounded-2xl p-8 md:p-12 shadow-2xl shadow-black/25">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-primary rounded-2xl p-4 shrink-0 shadow-lg">
                  <Shield className="w-8 h-8 text-zinc-950" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-zinc-50 mb-4">
                    Our Commitment to Ethical Aggregation
                  </h3>
                  <div className="space-y-4 text-zinc-300 leading-7">
                    <p>
                      At kamkhoj, we believe in supporting the entire employment ecosystem. 
                      Our platform acts as a bridge, providing visibility to vacancies while 
                      honoring the platforms that host them.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Direct credit to all sources</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">No bypassing of original portals</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Transparent data scraping ethics</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Focus on candidate accessibility</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-white/10 text-center">
            <div className="inline-flex max-w-3xl items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm text-zinc-400 border border-white/10">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span>Please refer to the respective platform for job posting terms, conditions, and current pricing.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

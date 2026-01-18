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
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Where Can You Post a Job?
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Find the most effective platforms to reach qualified candidates in Nepal. 
              Discover specialized and general job boards for your next hire.
            </p>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
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

          {/* Ethics & Transparency Banner */}
          <div className="mt-24 max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-[#0A66C2] rounded-xl p-4 shrink-0 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Our Commitment to Ethical Aggregation
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      At kamkhoj, we believe in supporting the entire employment ecosystem. 
                      Our platform acts as a bridge, providing visibility to vacancies while 
                      honoring the platforms that host them.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Direct credit to all sources</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">No bypassing of original portals</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Transparent data scraping ethics</span>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Focus on candidate accessibility</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-gray-200 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
              <Info className="w-4 h-4 text-gray-500" />
              <span>Please refer to the respective platform for job posting terms, conditions, and current pricing.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { HomeSearch } from "./HomeSearch";
import { Stats, StatsSkeleton } from "./Stats";

export function HomeHero() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Search Section */}
            <div>
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
                  Find Jobs in Nepal
                  <span className="block text-[#0A66C2] mt-2">
                    Latest Opportunities {new Date().getFullYear()}
                  </span>
                </h1>
                <p className="text-base md:text-lg text-gray-600 mb-2 leading-relaxed">
                  Discover 1000+ job opportunities from top Nepali job portals
                </p>
                <p className="text-sm text-gray-500">
                  Search across MeroJob, Kantipur Job, JobsNepal, KumariJob,
                  and more - all in one place
                </p>
              </div>

              <HomeSearch />

              <Suspense fallback={<StatsSkeleton />}>
                <Stats />
              </Suspense>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="/man-search-hiring-job-online-from-laptop.avif"
                  alt="Person searching for jobs online"
                  className="w-full h-auto rounded-lg mix-blend-darken"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
